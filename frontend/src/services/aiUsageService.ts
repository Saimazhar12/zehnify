import api from '../utils/api';
import { AiUsageSummary } from '../types';

export const aiUsageService = {
  async getMyUsage(): Promise<AiUsageSummary> {
    const response = await api.get<AiUsageSummary>('/users/me/ai-usage');
    return response.data;
  },

  async getUserUsage(userId: string): Promise<AiUsageSummary> {
    const response = await api.get<AiUsageSummary>(`/users/${userId}/ai-usage`);
    return response.data;
  },
};

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(amount);
}

export function formatTokenCount(count: number): string {
  return new Intl.NumberFormat('en-US').format(count);
}
