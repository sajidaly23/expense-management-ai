import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';
import { isDatabaseConnected } from '../../config/db.js';
import { ISavingsGoal, SavingsGoal, GoalStatus } from './goal.model.js';
import { CreateGoalInput, UpdateGoalInput } from './goal.validation.js';

export type PublicGoal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  deadline: string;
  priority: ISavingsGoal['priority'];
  status: GoalStatus;
  monthsRemaining: number;
  requiredMonthly: number;
};

function assertDatabase() {
  if (!isDatabaseConnected()) {
    throw new AppError('Database is not connected. Try again in a moment.', 503);
  }
}

function parseObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Savings goal not found.', 404);
  }
  return new mongoose.Types.ObjectId(id);
}

function toDateOnly(value: Date) {
  return value.toISOString().split('T')[0];
}

function monthsUntil(deadline: Date) {
  const now = new Date();
  const years = deadline.getUTCFullYear() - now.getUTCFullYear();
  const months = years * 12 + (deadline.getUTCMonth() - now.getUTCMonth());
  if (deadline.getUTCDate() < now.getUTCDate()) {
    return months - 1;
  }
  return months;
}

export function toPublicGoal(goal: ISavingsGoal): PublicGoal {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const monthsLeft = monthsUntil(goal.deadline);
  const completed = remaining <= 0;
  const overdue = !completed && monthsLeft < 0;
  const status: GoalStatus = completed ? 'COMPLETED' : overdue ? 'OVERDUE' : 'ACTIVE';
  const monthsRemaining = Math.max(0, monthsLeft);
  const requiredMonthly = completed
    ? 0
    : monthsRemaining <= 0
      ? remaining
      : Math.ceil(remaining / monthsRemaining);

  return {
    id: String(goal._id),
    userId: String(goal.userId),
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    remaining,
    deadline: toDateOnly(goal.deadline),
    priority: goal.priority,
    status,
    monthsRemaining,
    requiredMonthly,
  };
}

export async function listGoals(userId: string) {
  assertDatabase();
  const goals = await SavingsGoal.find({ userId }).sort({ deadline: 1, createdAt: -1 });
  const publicGoals = goals.map(toPublicGoal);
  return { goals: publicGoals, count: publicGoals.length };
}

export async function getGoal(userId: string, id: string) {
  assertDatabase();
  const goal = await SavingsGoal.findOne({ _id: parseObjectId(id), userId });
  if (!goal) {
    throw new AppError('Savings goal not found.', 404);
  }
  return toPublicGoal(goal);
}

export async function createGoal(userId: string, input: CreateGoalInput) {
  assertDatabase();
  const goal = await SavingsGoal.create({
    userId,
    name: input.name,
    targetAmount: input.targetAmount,
    currentAmount: input.currentAmount ?? 0,
    deadline: new Date(`${input.deadline}T00:00:00.000Z`),
    priority: input.priority ?? 'MEDIUM',
  });
  return toPublicGoal(goal);
}

export async function updateGoal(userId: string, id: string, input: UpdateGoalInput) {
  assertDatabase();
  const goal = await SavingsGoal.findOne({ _id: parseObjectId(id), userId });
  if (!goal) {
    throw new AppError('Savings goal not found.', 404);
  }

  if (input.name !== undefined) goal.name = input.name;
  if (input.targetAmount !== undefined) goal.targetAmount = input.targetAmount;
  if (input.currentAmount !== undefined) goal.currentAmount = input.currentAmount;
  if (input.deadline !== undefined) goal.deadline = new Date(`${input.deadline}T00:00:00.000Z`);
  if (input.priority !== undefined) goal.priority = input.priority;

  await goal.save();
  return toPublicGoal(goal);
}

export async function deleteGoal(userId: string, id: string) {
  assertDatabase();
  const goal = await SavingsGoal.findOneAndDelete({ _id: parseObjectId(id), userId });
  if (!goal) {
    throw new AppError('Savings goal not found.', 404);
  }
}
