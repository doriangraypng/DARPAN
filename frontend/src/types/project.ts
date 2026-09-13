export type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ProjectStatus =
  | "planning"
  | "under execution"
  | "completed"
  | "delayed"
  | "on hold";

export interface ProjectRisk {
  overall: number;
  cost: number;
  schedule: number;
  implementation: number;
  level: RiskLevel;
}

export interface FinancialData {
  approvedCost: number;
  revisedCost: number;
  expenditure: number;
  currency: "INR";
}

export interface ProgressData {
  physical: number;
  financial: number;
}

export interface PredictionData {
  costOverrunProbability: number;
  timeOverrunProbability: number;
  implementationRiskProbability: number;
}

export interface Warning {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  probability?: number;
  createdAt: string;
}

export interface Anomaly {
  id: string;
  type: string;
  description: string;
  severity: RiskLevel;
  detectedAt: string;
}

export interface BenchmarkData {
  peerCount: number;
  costPerformance: number;
  schedulePerformance: number;
  percentile: number;
}

export interface Project {
  id: string;
  name: string;

  ministry: string;
  department?: string;

  sector: string;
  state: string;
  district?: string;

  status: ProjectStatus;

  startDate?: string;
  expectedCompletion?: string;

  financial: FinancialData;
  progress: ProgressData;

  risk: ProjectRisk;

  prediction: PredictionData;

  warnings: Warning[];
  anomalies: Anomaly[];

  benchmark?: BenchmarkData;

  primaryRiskDriver?: string;

  lastUpdated: string;
}