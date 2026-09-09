import { FinancialHealthScore } from '../types';
import { apiRequest } from '../lib/api';

export type HealthScoreResponse = {
  status: string;
  score: FinancialHealthScore;
};

export const scoreService = {
  get() {
    return apiRequest<HealthScoreResponse>('/api/health-score');
  },
};
