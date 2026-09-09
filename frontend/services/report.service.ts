import { Budget, FinancialHealthScore, Prediction } from '../types';
import { apiDownload, apiRequest } from '../lib/api';

export type ReportPayload = {
  preparedFor: string;
  period: { key: string; label: string };
  currentMonth: {
    income: number;
    expense: number;
    savings: number;
    savingsRate: number;
    byCategory: { category: string; amount: number }[];
  };
  prediction: Prediction | null;
  health: FinancialHealthScore | null;
  budgets: Budget[];
  goals: { name: string; remaining: number; requiredMonthly: number; status: string }[];
  executiveSummary: string;
};

export type ReportResponse = {
  status: string;
  report: ReportPayload;
};

export const reportService = {
  get() {
    return apiRequest<ReportResponse>('/api/reports');
  },

  downloadPdf(periodKey: string) {
    return apiDownload('/api/reports/export.pdf', `smartfin-statement-${periodKey}.pdf`);
  },

  downloadExcel(periodKey: string) {
    return apiDownload('/api/reports/export.xls', `smartfin-statement-${periodKey}.xls`);
  },
};
