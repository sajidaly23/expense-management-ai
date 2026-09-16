import mongoose from 'mongoose';
import { z } from 'zod';
import { config } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { isDatabaseConnected } from '../../config/db.js';
import { AssistantMessage } from './assistant.model.js';
import { getSummary } from '../summary/summary.service.js';
import { listBudgets, PublicBudget } from '../budget/budget.service.js';
import { listGoals } from '../goal/goal.service.js';
import { getProfile } from '../profile/profile.service.js';
import { getHealthScore } from '../score/score.service.js';
import { getLatestPrediction } from '../prediction/prediction.service.js';
import { runAssistantEngine, EngineContext } from './assistant-engine.js';
import { ChatTurn } from './conversation-context.js';

export const askAssistantSchema = z.object({
  question: z.string().trim().min(1, 'Enter a question.').max(500, 'Keep the question under 500 characters.'),
  useOllama: z.boolean().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().trim().min(1).max(2000),
      })
    )
    .max(12)
    .optional()
    .default([]),
});

export type AskAssistantInput = z.infer<typeof askAssistantSchema>;

export type PublicChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  createdAt: string;
};

const MAX_STORED_MESSAGES = 200;
const ASSISTANT_SOURCE = 'SmartFin Assistant';

type CompactContext = {
  name: string;
  monthLabel: string;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  topCategories: { category: string; amount: number }[];
  budgets: { label: string; amount: number; spent: number; utilization: number }[];
  goals: { name: string; remaining: number; status: string }[];
  health: { overallScore: number; status: string } | null;
  prediction: { period: string; amount: number; changePercentage: number } | null;
};

function assertDatabase() {
  if (!isDatabaseConnected()) {
    throw new AppError('Database is not connected. Try again in a moment.', 503);
  }
}

function budgetLabel(budget: PublicBudget) {
  return budget.category || 'Overall';
}

function ollamaBase() {
  return config.ollamaUrl.replace(/\/$/, '');
}

async function loadEngineContext(userId: string): Promise<EngineContext> {
  const [profile, summary, budgetResult, goalResult, prediction, health] = await Promise.all([
    getProfile(userId),
    getSummary(userId, 6),
    listBudgets(userId, {}),
    listGoals(userId),
    getLatestPrediction(userId),
    getHealthScore(userId),
  ]);

  return {
    name: profile.name,
    monthKey: summary.currentMonth.key,
    monthLabel: summary.currentMonth.label,
    budgets: budgetResult.budgets.map((budget) => ({
      label: budgetLabel(budget),
      amount: budget.amount,
      spent: budget.spent,
      remaining: budget.remaining,
      utilization: budget.utilization,
    })),
    goals: goalResult.goals.map((goal) => ({
      name: goal.name,
      remaining: goal.remaining,
      requiredMonthly: goal.requiredMonthly,
      status: goal.status,
    })),
    health: health
      ? {
          overallScore: health.overallScore,
          status: health.status,
          recommendations: health.recommendations,
        }
      : null,
    prediction: prediction
      ? {
          period: prediction.predictionPeriod,
          amount: prediction.predictedAmount,
          changePercentage: prediction.changePercentage,
          modelUsed: prediction.modelUsed,
          categories: prediction.categoryPredictions.map((row) => ({
            category: row.category,
            predictedAmount: row.predictedAmount,
          })),
        }
      : null,
  };
}

function buildCompactContext(engineCtx: EngineContext, summary: Awaited<ReturnType<typeof getSummary>>): CompactContext {
  return {
    name: engineCtx.name,
    monthLabel: engineCtx.monthLabel,
    income: summary.currentMonth.income,
    expense: summary.currentMonth.expense,
    savings: summary.currentMonth.savings,
    savingsRate: summary.currentMonth.savingsRate,
    topCategories: summary.currentMonth.byCategory.slice(0, 5),
    budgets: engineCtx.budgets.slice(0, 8).map((row) => ({
      label: row.label,
      amount: row.amount,
      spent: row.spent,
      utilization: row.utilization,
    })),
    goals: engineCtx.goals.slice(0, 5).map((row) => ({
      name: row.name,
      remaining: row.remaining,
      status: row.status,
    })),
    health: engineCtx.health
      ? { overallScore: engineCtx.health.overallScore, status: engineCtx.health.status }
      : null,
    prediction: engineCtx.prediction
      ? {
          period: engineCtx.prediction.period,
          amount: engineCtx.prediction.amount,
          changePercentage: engineCtx.prediction.changePercentage,
        }
      : null,
  };
}

async function probeOllama() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(`${ollamaBase()}/api/tags`, { signal: controller.signal });
    if (!response.ok) {
      return { available: false, model: config.ollamaModel };
    }
    const data = (await response.json()) as { models?: { name?: string }[] };
    const names = (data.models || []).map((item) => item.name || '');
    const hasModel = names.some((name) => name === config.ollamaModel || name.startsWith(`${config.ollamaModel}:`));
    return { available: hasModel || names.length > 0, model: config.ollamaModel };
  } catch {
    return { available: false, model: config.ollamaModel };
  } finally {
    clearTimeout(timer);
  }
}

async function askOllama(
  question: string,
  compact: CompactContext,
  history: ChatTurn[],
  deterministicAnswer?: string
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  const recent = history.slice(-10);
  const transcript = recent.map((turn) => `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.text}`).join('\n');

  const prompt = [
    'You are SmartFin, a personal finance assistant.',
    'Answer the latest user question directly in plain language.',
    'Use ONLY the JSON context and any verified backend answer for amounts. Do not invent figures.',
    'If a verified backend answer is provided, preserve its numbers exactly and you may improve wording only.',
    'If the question cannot be answered from context, say what is missing and suggest a clearer question.',
    'Keep the answer to 2-5 sentences unless a list is requested. Use Rs. for money.',
    deterministicAnswer ? `Verified backend answer: ${deterministicAnswer}` : '',
    `Context JSON: ${JSON.stringify(compact)}`,
    transcript ? `Recent conversation:\n${transcript}` : 'Recent conversation: (none)',
    `Latest question: ${question}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const response = await fetch(`${ollamaBase()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { response?: string };
    const text = data.response?.trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function toPublicMessage(doc: {
  _id: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  createdAt: Date;
}): PublicChatMessage {
  return {
    id: String(doc._id),
    role: doc.role,
    text: doc.text,
    source: doc.source || undefined,
    createdAt: doc.createdAt.toISOString(),
  };
}

async function trimOldMessages(userId: string) {
  const count = await AssistantMessage.countDocuments({ userId });
  if (count <= MAX_STORED_MESSAGES) return;

  const overflow = count - MAX_STORED_MESSAGES;
  const oldest = await AssistantMessage.find({ userId }).sort({ createdAt: 1 }).limit(overflow).select('_id');
  const ids = oldest.map((item) => item._id);
  if (ids.length > 0) {
    await AssistantMessage.deleteMany({ _id: { $in: ids } });
  }
}

async function saveExchange(userId: string, question: string, answer: string, source: string) {
  const [userDoc, assistantDoc] = await AssistantMessage.insertMany([
    { userId, role: 'user', text: question },
    { userId, role: 'assistant', text: answer, source },
  ]);
  await trimOldMessages(userId);
  return [toPublicMessage(userDoc), toPublicMessage(assistantDoc)];
}

export async function listChatMessages(userId: string, limit = 100) {
  assertDatabase();
  const items = await AssistantMessage.find({ userId }).sort({ createdAt: 1 }).limit(limit).lean();
  return items.map((item) =>
    toPublicMessage({
      _id: item._id as mongoose.Types.ObjectId,
      role: item.role,
      text: item.text,
      source: item.source,
      createdAt: item.createdAt,
    })
  );
}

export async function clearChatMessages(userId: string) {
  assertDatabase();
  await AssistantMessage.deleteMany({ userId });
}

export async function getAssistantStatus() {
  const probe = await probeOllama();
  return {
    ollamaAvailable: probe.available,
    model: probe.model,
  };
}

function fallbackAnswer(engineCtx: EngineContext) {
  return `I can help with your financial data. Try asking "How much did I spend in August?", "How much salary did I receive last month?", or "What did I spend on Food?" Your ${engineCtx.monthLabel} totals are available once you ask a specific question.`;
}

export async function askAssistant(userId: string, input: AskAssistantInput) {
  assertDatabase();
  const engineCtx = await loadEngineContext(userId);
  const history = input.history || [];

  const engineResult = await runAssistantEngine(userId, input.question, history, engineCtx);

  let answer = engineResult.answer.trim();
  let usedOllama = false;
  const preferOllama = input.useOllama !== false;

  if (!answer) {
    if (preferOllama) {
      const probe = await probeOllama();
      if (probe.available) {
        const summary = await getSummary(userId, 6);
        const compact = buildCompactContext(engineCtx, summary);
        const ollamaAnswer = await askOllama(input.question, compact, history);
        if (ollamaAnswer) {
          answer = ollamaAnswer;
          usedOllama = true;
        }
      }
    }
    if (!answer) {
      answer = fallbackAnswer(engineCtx);
    }
  }

  const messages = await saveExchange(userId, input.question, answer, ASSISTANT_SOURCE);

  return {
    answer,
    source: ASSISTANT_SOURCE,
    usedOllama,
    messages,
  };
}
