import { z } from 'zod';
import { config } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { isDatabaseConnected } from '../../config/db.js';
import { getSummary } from '../summary/summary.service.js';
import { listBudgets, PublicBudget } from '../budget/budget.service.js';
import { listGoals } from '../goal/goal.service.js';
import { getProfile } from '../profile/profile.service.js';
import { getHealthScore } from '../score/score.service.js';
import { getLatestPrediction } from '../prediction/prediction.service.js';

export const askAssistantSchema = z.object({
  question: z.string().trim().min(1, 'Enter a question.').max(500, 'Keep the question under 500 characters.'),
  useOllama: z.boolean().optional(),
});

export type AskAssistantInput = z.infer<typeof askAssistantSchema>;

type AssistantContext = {
  name: string;
  monthKey: string;
  monthLabel: string;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  byCategory: { category: string; amount: number }[];
  budgets: { label: string; amount: number; spent: number; utilization: number }[];
  prediction: {
    period: string;
    amount: number;
    changePercentage: number;
    modelUsed: string;
    categories: { category: string; predictedAmount: number }[];
  } | null;
  health: { overallScore: number; status: string; recommendations: string[] } | null;
  goals: { name: string; remaining: number; requiredMonthly: number; status: string }[];
};

function assertDatabase() {
  if (!isDatabaseConnected()) {
    throw new AppError('Database is not connected. Try again in a moment.', 503);
  }
}

function formatRs(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
}

function budgetLabel(budget: PublicBudget) {
  return budget.category || 'Overall';
}

async function loadContext(userId: string): Promise<AssistantContext> {
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
    income: summary.currentMonth.income,
    expense: summary.currentMonth.expense,
    savings: summary.currentMonth.savings,
    savingsRate: summary.currentMonth.savingsRate,
    byCategory: summary.currentMonth.byCategory,
    budgets: budgetResult.budgets.map((budget) => ({
      label: budgetLabel(budget),
      amount: budget.amount,
      spent: budget.spent,
      utilization: budget.utilization,
    })),
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
    health: health
      ? {
          overallScore: health.overallScore,
          status: health.status,
          recommendations: health.recommendations,
        }
      : null,
    goals: goalResult.goals.map((goal) => ({
      name: goal.name,
      remaining: goal.remaining,
      requiredMonthly: goal.requiredMonthly,
      status: goal.status,
    })),
  };
}

function answerFromRules(question: string, ctx: AssistantContext) {
  const q = question.toLowerCase();
  const top = ctx.byCategory[0];

  if (q.includes('spend the most') || q.includes('highest expense') || q.includes('highest category')) {
    if (!top) {
      return `No expenses are recorded for ${ctx.monthLabel} ${ctx.monthKey.slice(0, 4)}, so there is no highest category yet.`;
    }
    const share = ctx.expense === 0 ? 0 : Number(((top.amount / ctx.expense) * 100).toFixed(1));
    const second = ctx.byCategory[1];
    const extra = second ? ` Next is ${second.category} at ${formatRs(second.amount)}.` : '';
    return `For ${ctx.monthLabel} ${ctx.monthKey.slice(0, 4)}, your highest spending category is ${top.category} at ${formatRs(top.amount)} (${share}% of ${formatRs(ctx.expense)} total expenses).${extra}`;
  }

  if (q.includes('save') || q.includes('savings')) {
    if (ctx.income === 0 && ctx.expense === 0) {
      return `There is no income or expense recorded for ${ctx.monthLabel} yet, so savings cannot be calculated.`;
    }
    return `You saved ${formatRs(ctx.savings)} in ${ctx.monthLabel} (${ctx.savingsRate}% of ${formatRs(ctx.income)} income, with ${formatRs(ctx.expense)} spent).`;
  }

  if (q.includes('next month') || q.includes('prediction') || q.includes('forecast')) {
    if (!ctx.prediction) {
      return 'No forecast is stored yet. Train a model on the Predictions page first.';
    }
    const sign = ctx.prediction.changePercentage >= 0 ? '+' : '';
    const topForecast = [...ctx.prediction.categories].sort((a, b) => b.predictedAmount - a.predictedAmount)[0];
    const extra = topForecast
      ? ` Largest forecasted category is ${topForecast.category} at ${formatRs(topForecast.predictedAmount)}.`
      : '';
    return `Your stored ${ctx.prediction.modelUsed} forecast for ${ctx.prediction.period} is ${formatRs(ctx.prediction.amount)} (${sign}${ctx.prediction.changePercentage}% vs the previous month).${extra}`;
  }

  if (q.includes('budget') || q.includes('exceed')) {
    if (ctx.budgets.length === 0) {
      return `You have not set a budget for ${ctx.monthLabel} yet.`;
    }
    const over = ctx.budgets.filter((item) => item.utilization > 100);
    if (over.length === 0) {
      const highest = [...ctx.budgets].sort((a, b) => b.utilization - a.utilization)[0];
      return `None of your ${ctx.monthLabel} budgets are over 100% utilization. Highest is ${highest.label} at ${highest.utilization}% (${formatRs(highest.spent)} of ${formatRs(highest.amount)}).`;
    }
    return over
      .map(
        (item) =>
          `${item.label} is at ${item.utilization}% (${formatRs(item.spent)} spent vs ${formatRs(item.amount)} budget).`
      )
      .join(' ');
  }

  if (q.includes('health') || q.includes('score')) {
    if (!ctx.health) {
      return 'A health score is not available yet.';
    }
    const tip = ctx.health.recommendations[0] ? ` ${ctx.health.recommendations[0]}` : '';
    return `Your financial health score is ${ctx.health.overallScore}/100 (${ctx.health.status}).${tip}`;
  }

  const healthBit = ctx.health
    ? ` Health score is ${ctx.health.overallScore}/100 (${ctx.health.status}).`
    : '';
  return `For ${ctx.monthLabel}: income ${formatRs(ctx.income)}, expenses ${formatRs(ctx.expense)}, net savings ${formatRs(ctx.savings)} (${ctx.savingsRate}%).${healthBit}`;
}

async function askOllama(question: string, ctx: AssistantContext): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  const prompt = [
    'You are SmartFin AI. Answer using ONLY the JSON context below.',
    'Do not invent amounts, dates, categories, or model names that are not in the JSON.',
    'If the question needs a figure that is missing, say you do not have that figure.',
    'Keep the answer to 2-4 sentences. Use Rs. for money.',
    `Context JSON: ${JSON.stringify(ctx)}`,
    `Question: ${question}`,
  ].join('\n');

  try {
    const response = await fetch(`${config.ollamaUrl.replace(/\/$/, '')}/api/generate`, {
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

export async function askAssistant(userId: string, input: AskAssistantInput) {
  assertDatabase();
  const ctx = await loadContext(userId);
  const rulesAnswer = answerFromRules(input.question, ctx);

  if (!input.useOllama) {
    return {
      answer: rulesAnswer,
      source: 'Analytics rules engine',
      usedOllama: false,
    };
  }

  const ollamaAnswer = await askOllama(input.question, ctx);
  if (!ollamaAnswer) {
    return {
      answer: rulesAnswer,
      source: 'Analytics rules (Ollama unavailable)',
      usedOllama: false,
    };
  }

  return {
    answer: ollamaAnswer,
    source: 'Local Ollama LLM',
    usedOllama: true,
  };
}
