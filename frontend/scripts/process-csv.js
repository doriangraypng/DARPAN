const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../src/data/projects.csv");
const outPath = path.join(__dirname, "../src/data/mock-projects.ts");

function parseCSV(text) {
  let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
  for (l of text) {
    if ('"' === l) {
      if (s && l === p) row[i] += l;
      s = !s;
    } else if (',' === l && s) l = row[++i] = '';
    else if ('\n' === l && s) {
      if ('\r' === p) row[i] = row[i].slice(0, -1);
      row = ret[++r] = [l = '']; i = 0;
    } else row[i] += l;
    p = l;
  }
  return ret;
}

const csvText = fs.readFileSync(csvPath, "utf-8");
const rows = parseCSV(csvText);

const headers = rows[0].map(h => h.trim());
console.log("Headers:", headers);
/*
[
  'Sr. No.',
  'Sector Name',
  'Line Ministry',
  'Project Code',
  'Project Name',
  'Original Cost',
  'Revised Cost',
  'Expenditure',
  'Original End Date',
  'Revised Date'
]
*/

const projects = [];

function parseVal(v) {
  if (!v) return 0;
  const cleaned = v.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Generate realistic simulated "proxy" data for fields not in the CSV
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

for (let i = 2; i < rows.length; i++) {
  const row = rows[i];
  if (row.length < 5 || !row[4]) continue;

  const code = row[1];
  const name = row[2];
  const ministry = row[3];
  const state = row[4];

  const startDate = row[6];
  const expectedCompletion = row[8] || row[7]; // revised or original

  const origCost = parseVal(row[9]);
  const revCost = parseVal(row[10]) || origCost;
  const exp = parseVal(row[11]);

  // Real reported physical progress from the new CSV!
  let physicalProgress = parseVal(row[12]);

  const sector = row[13];

  const seed = hashString(code + name);
  const rand = seededRandom(seed);
  const rand2 = seededRandom(seed + 1);
  const rand3 = seededRandom(seed + 2);

  // Progress
  // Financial progress is exactly expenditure / revised Cost
  let financialProgress = revCost > 0 ? (exp / revCost) * 100 : 0;
  if (financialProgress > 100) financialProgress = 100;
  if (physicalProgress > 100) physicalProgress = 100;

  // Status
  let status = "under execution";
  if (physicalProgress === 100) status = "completed";
  else if (physicalProgress === 0 && financialProgress === 0) status = "planning";
  else if (rand2 > 0.8) status = "delayed";

  const costOverrun = revCost > origCost;
  const costVariance = revCost - origCost;

  // Predictions & Risk
  const costOverrunProb = costOverrun ? 100 : Math.round(rand * 40 + (financialProgress > 80 ? 0 : 20));
  const timeOverrunProb = Math.round(rand2 * 100);
  const implRiskProb = Math.round(rand3 * 100);

  const riskOverall = Math.round((costOverrunProb + timeOverrunProb + implRiskProb) / 3);
  let riskLevel = "low";
  if (riskOverall > 75) riskLevel = "critical";
  else if (riskOverall > 55) riskLevel = "high";
  else if (riskOverall > 35) riskLevel = "medium";

  // Warnings / anomalies based on data
  const warnings = [];
  const anomalies = [];

  if (costOverrun) {
    warnings.push({
      id: code + "-W1",
      title: "Significant Cost Overrun",
      description: `Project cost revised upward by ₹${costVariance}Cr.`,
      severity: costVariance > 1000 ? "critical" : "high",
      createdAt: "2026-09-01T00:00:00Z"
    });
  }

  if (Math.abs(financialProgress - physicalProgress) > 15) {
     anomalies.push({
      id: code + "-A1",
      type: "Progress Divergence",
      description: `Financial progress (${Math.round(financialProgress)}%) outpaces physical (${Math.round(physicalProgress)}%). Possible disbursement leak.`,
      severity: "high",
      detectedAt: "2026-09-02T00:00:00Z"
     });
  }

  if (implRiskProb > 80) {
    warnings.push({
      id: code + "-W2",
      title: "Contractor Implementation Risk",
      description: `Model flagged contractor execution ability as elevated risk.`,
      severity: "high",
      probability: implRiskProb,
      createdAt: "2026-09-05T00:00:00Z"
    });
  }

  projects.push({
    id: code,
    name: name,
    ministry: ministry,
    sector: sector,
    state: state,
    status: status,
    startDate: startDate,
    expectedCompletion: expectedCompletion,
    financial: {
      approvedCost: origCost,
      revisedCost: revCost,
      expenditure: exp,
      currency: "INR"
    },
    progress: {
      physical: Math.round(physicalProgress),
      financial: Math.round(financialProgress)
    },
    risk: {
      overall: riskOverall,
      cost: Math.round(costOverrunProb),
      schedule: Math.round(timeOverrunProb),
      implementation: Math.round(implRiskProb),
      level: riskLevel
    },
    prediction: {
      costOverrunProbability: Math.round(costOverrunProb),
      timeOverrunProbability: Math.round(timeOverrunProb),
      implementationRiskProbability: Math.round(implRiskProb)
    },
    warnings: warnings,
    anomalies: anomalies,
    lastUpdated: "2026-09-06T00:00:00Z"
  });
}

// Write the output as a TS file exporting the array
const tsContent = `// Auto-generated by scripts/process-csv.js
import { Project } from "../types/project";

export const mockProjects: Project[] = ${JSON.stringify(projects, null, 2)};
`;

fs.writeFileSync(outPath, tsContent, "utf-8");
console.log("Generated:", projects.length, "projects to src/data/mock-projects.ts");
