export interface AiUsageTokens {
  input: number;
  output: number;
}

export interface AiUsageCosts {
  input: number;
  output: number;
  total: number;
}

export interface AiUsageRates {
  inputPerMTok: number;
  outputPerMTok: number;
}

export interface UserAiUsage {
  tokens: AiUsageTokens;
  costs: AiUsageCosts;
  rates: AiUsageRates;
}

export interface AiUsageSummary extends UserAiUsage {
  rates: AiUsageRates;
}

export const EMPTY_AI_USAGE: UserAiUsage = {
  tokens: { input: 0, output: 0 },
  costs: { input: 0, output: 0, total: 0 },
  rates: { inputPerMTok: 0, outputPerMTok: 0 },
};
