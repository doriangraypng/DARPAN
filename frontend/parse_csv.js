const fs = require('fs');

const csvContent = fs.readFileSync('C:/Users/anshj/Downloads/data project overview.csv', 'utf8');
const lines = csvContent.split('\n');

const projects = [];

const states = [
  "Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Uttar Pradesh",
  "Telangana", "Andhra Pradesh", "Rajasthan", "Madhya Pradesh", "Delhi", "Odisha", "West Bengal", "Punjab", "Haryana", "Bihar"
];

function getRandomState() {
  return states[Math.floor(Math.random() * states.length)];
}

function parseDate(dStr) {
  if (!dStr) return "2026-12-31";
  dStr = dStr.replace(/"/g, '').trim();
  const parts = dStr.split('-');
  if (parts.length === 3) {
    let yr = parts[2];
    if (yr.length === 2) {
      if (parseInt(yr) > 50) yr = '19' + yr;
      else yr = '20' + yr;
    }
    return `${yr}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return "2026-12-31";
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

let count = 0;
for (let i = 2; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  
  const columns = parseCSVLine(lines[i].trim());
  if (columns.length < 9) continue;
  
  let [sr, sector, ministry, code, name, origCostStr, revCostStr, expStr, origDate, revDate] = columns;
  
  let approvedCost = parseFloat(origCostStr) || 0;
  let revisedCost = parseFloat(revCostStr) || approvedCost || 0;
  let expenditure = parseFloat(expStr) || 0;
  
  let physical = Math.min(100, Math.max(0, Math.floor((expenditure / (revisedCost || 1)) * 100) + Math.floor(Math.random() * 15)));
  if (physical > 100) physical = 100;
  let financial = Math.min(100, Math.floor((expenditure / (revisedCost || 1)) * 100));
  
  let costOverrun = revisedCost > approvedCost;
  let hasDelay = (revDate && origDate && revDate !== origDate);
  
  let overallRisk = Math.floor(Math.random() * 40) + 10;
  if (costOverrun) overallRisk += 25;
  if (hasDelay) overallRisk += 20;
  if (overallRisk > 95) overallRisk = 95;
  
  let riskLevel = "low";
  if (overallRisk >= 75) riskLevel = "critical";
  else if (overallRisk >= 55) riskLevel = "high";
  else if (overallRisk >= 35) riskLevel = "medium";
  
  let status = "under execution";
  if (physical === 100) status = "completed";
  else if (overallRisk > 80) status = "delayed";
  
  let costRisk = costOverrun ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 40);
  let schedRisk = hasDelay ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 40);
  
  let expectedCompletion = parseDate(revDate || origDate);
  
  const warnings = [];
  if (costOverrun) {
    warnings.push({
      id: `W-COST-${code}`,
      title: "Cost Overrun Detected",
      description: `Project cost has escalated by ${(revisedCost - approvedCost).toFixed(2)} Cr from original estimate.`,
      severity: "high",
      probability: 90,
      createdAt: new Date().toISOString()
    });
  }
  if (hasDelay) {
    warnings.push({
      id: `W-TIME-${code}`,
      title: "Schedule Delay",
      description: `Project completion date has been revised from original schedule.`,
      severity: "medium",
      probability: 85,
      createdAt: new Date().toISOString()
    });
  }
  
  const project = {
    id: String(code || `PRJ-${count}`),
    name: name.replace(/"/g, '').trim(),
    ministry: ministry.trim(),
    sector: sector.trim(),
    state: getRandomState(),
    status: status,
    startDate: "2020-01-01",
    expectedCompletion: expectedCompletion,
    financial: {
      approvedCost,
      revisedCost,
      expenditure,
      currency: "INR"
    },
    progress: {
      physical,
      financial
    },
    risk: {
      overall: overallRisk,
      cost: costRisk,
      schedule: schedRisk,
      implementation: Math.floor(Math.random() * 100),
      level: riskLevel
    },
    prediction: {
      costOverrunProbability: costOverrun ? (70 + Math.random()*20) : (10 + Math.random()*20),
      timeOverrunProbability: hasDelay ? (70 + Math.random()*20) : (10 + Math.random()*20),
      implementationRiskProbability: Math.floor(Math.random() * 60)
    },
    warnings: warnings,
    anomalies: [],
    primaryRiskDriver: costOverrun ? "Cost Escalation" : (hasDelay ? "Schedule Delay" : undefined),
    lastUpdated: new Date().toISOString()
  };
  
  projects.push(project);
  count++;
}

let codeString = `import { Project } from "@/types/project";\n\nexport const mockProjects: Project[] = ${JSON.stringify(projects, null, 2)};`;

fs.writeFileSync('src/data/mock-projects.ts', codeString);
console.log(`Successfully parsed ${projects.length} projects!`);
