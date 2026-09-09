import { isDatabaseConnected } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import { User } from '../auth/user.model.js';
import { Income } from '../income/income.model.js';
import { Expense } from '../expense/expense.model.js';
import { Prediction } from '../prediction/prediction.model.js';
import { Anomaly } from '../anomaly/anomaly.model.js';
import { AuditLog, IAuditLog } from '../audit/audit.model.js';

export type PublicAuditLog = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  ipAddress: string;
  timestamp: string;
};

function assertDatabase() {
  if (!isDatabaseConnected()) {
    throw new AppError('Database is not connected. Try again in a moment.', 503);
  }
}

function toPublicAuditLog(item: IAuditLog): PublicAuditLog {
  return {
    id: String(item._id),
    userId: String(item.userId),
    userName: item.userName,
    action: item.action,
    module: item.module,
    ipAddress: item.ipAddress,
    timestamp: (item.createdAt || new Date()).toISOString(),
  };
}

export async function getAdminOverview() {
  assertDatabase();

  const [userCount, incomeCount, expenseCount, predictionCount, anomalyCount, logs] = await Promise.all([
    User.countDocuments(),
    Income.countDocuments(),
    Expense.countDocuments(),
    Prediction.countDocuments(),
    Anomaly.countDocuments(),
    AuditLog.find().sort({ createdAt: -1 }).limit(50),
  ]);

  return {
    users: userCount,
    transactions: incomeCount + expenseCount,
    incomeRecords: incomeCount,
    expenseRecords: expenseCount,
    predictions: predictionCount,
    anomalies: anomalyCount,
    auditLogs: logs.map(toPublicAuditLog),
  };
}
