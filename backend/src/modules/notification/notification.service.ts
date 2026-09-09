import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';
import { isDatabaseConnected } from '../../config/db.js';
import { listBudgets } from '../budget/budget.service.js';
import { Anomaly } from '../anomaly/anomaly.model.js';
import { INotification, Notification, NotificationType } from './notification.model.js';

export type PublicNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  date: string;
  sourceId: string;
};

function assertDatabase() {
  if (!isDatabaseConnected()) {
    throw new AppError('Database is not connected. Try again in a moment.', 503);
  }
}

function parseObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Notification not found.', 404);
  }
  return new mongoose.Types.ObjectId(id);
}

function formatRs(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
}

function toPublicNotification(item: INotification): PublicNotification {
  return {
    id: String(item._id),
    title: item.title,
    message: item.message,
    type: item.type,
    read: item.read,
    date: (item.createdAt || new Date()).toISOString(),
    sourceId: item.sourceId,
  };
}

async function upsertNotice(
  userId: string,
  sourceId: string,
  title: string,
  message: string,
  type: NotificationType
) {
  await Notification.updateOne(
    { userId, sourceId },
    {
      $set: { title, message, type },
      $setOnInsert: { userId, sourceId, read: false },
    },
    { upsert: true }
  );
}

async function syncFromLiveData(userId: string) {
  const [budgetResult, unresolved] = await Promise.all([
    listBudgets(userId, {}),
    Anomaly.find({ userId, status: 'UNRESOLVED' }).sort({ detectedAt: -1 }),
  ]);

  for (const budget of budgetResult.budgets) {
    if (budget.utilization <= 100) continue;
    const label = budget.category || 'Overall';
    await upsertNotice(
      userId,
      `budget:${budget.id}:${budget.month}`,
      `${label} budget exceeded`,
      `${label} is at ${budget.utilization}% utilization (${formatRs(budget.spent)} spent of ${formatRs(budget.amount)} for ${budget.month}).`,
      'budget'
    );
  }

  for (const item of unresolved) {
    await upsertNotice(
      userId,
      `anomaly:${String(item._id)}`,
      `${item.severity} spending anomaly`,
      `${item.expenseDescription || item.category} of ${formatRs(item.amount)} looks unusual versus a typical ${formatRs(item.normalAverage)}. ${item.reason}`.trim(),
      'anomaly'
    );
  }
}

export async function listNotifications(userId: string) {
  assertDatabase();
  await syncFromLiveData(userId);
  const items = await Notification.find({ userId }).sort({ createdAt: -1, _id: -1 });
  const notifications = items.map(toPublicNotification);
  return {
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
    count: notifications.length,
  };
}

export async function markNotificationRead(userId: string, id: string) {
  assertDatabase();
  const item = await Notification.findOneAndUpdate(
    { _id: parseObjectId(id), userId },
    { $set: { read: true } },
    { new: true }
  );
  if (!item) {
    throw new AppError('Notification not found.', 404);
  }
  return toPublicNotification(item);
}

export async function markAllNotificationsRead(userId: string) {
  assertDatabase();
  await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
  return listNotifications(userId);
}
