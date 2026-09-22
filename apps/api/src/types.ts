export const DIFFICULTIES = ["ADVANCED", "EXPERT", "EXTREME", "INSANE"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const RISK_LEVELS = ["MODERATE", "HIGH", "SEVERE", "EXTREME"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const COST_TYPES = ["FREE", "VARIES", "PAID"] as const;
export type CostType = (typeof COST_TYPES)[number];
