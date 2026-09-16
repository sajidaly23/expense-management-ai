import { ExpenseCategory } from '../types';
import { apiRequest } from '../lib/api';

export type SimulatorPayload = {
  incomeChangePercent?: number;
  categoryCutPercent?: number;
  category?: ExpenseCategory;
  extraSavingsMonthly?: number;
};

export type SimulatorResult = {
  current: {
    income: number;
    expense: number;
    savings: number;
    savingsRate: number;
    healthScore: number;
  };
  projected: {
    income: number;
    expense: number;
    savings: number;
    savingsRate: number;
    healthScore: number;
  };
  delta: {
    savings: number;
    savingsRate: number;
    healthScore: number;
  };
  adjustments: string[];
  monthLabel: string;
};

export const simulatorService = {
  simulate(payload: SimulatorPayload) {
    return apiRequest<{ status: string; result: SimulatorResult }>('/api/simulator', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
