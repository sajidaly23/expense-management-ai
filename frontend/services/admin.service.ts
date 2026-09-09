import { AuditLog } from '../types';
import { apiRequest } from '../lib/api';

export type AdminOverviewResponse = {
  status: string;
  users: number;
  transactions: number;
  incomeRecords: number;
  expenseRecords: number;
  predictions: number;
  anomalies: number;
  auditLogs: AuditLog[];
};

export const adminService = {
  overview() {
    return apiRequest<AdminOverviewResponse>('/api/admin/overview');
  },
};
