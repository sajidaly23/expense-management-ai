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
  async simulate(payload: SimulatorPayload) {
    const res = await apiRequest<{ status: string; result?: SimulatorResult; simulation?: SimulatorResult }>(
      '/api/simulator',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return {
      status: res.status,
      result: res.result ?? res.simulation ?? null,
    };
  },
};
