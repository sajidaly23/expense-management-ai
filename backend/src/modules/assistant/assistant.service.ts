import mongoose from 'mongoose';
import { z } from 'zod';
import { config } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { isDatabaseConnected } from '../../config/db.js';
import { EXPENSE_CATEGORIES } from '../expense/expense.model.js';
import { AssistantMessage } from './assistant.model.js';
import { getSummary } from '../summary/summary.service.js';
import { listBudgets, PublicBudget } from '../budget/budget.service.js';
import { listGoals } from '../goal/goal.service.js';
import { getProfile } from '../profile/profile.service.js';
import { getHealthScore } from '../score/score.service.js';
import { getLatestPrediction } from '../prediction/prediction.service.js';

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

type ChatTurn = { role: 'user' | 'assistant'; text: string };

export type PublicChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  createdAt: string;
};

const MAX_STORED_MESSAGES = 200;

type AssistantContext = {
  name: string;
  monthKey: string;
  monthLabel: string;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  needsTotal: number;
  wantsTotal: number;
  byCategory: { category: string; amount: number }[];
  monthly: { month: string; monthKey: string; income: number; expense: number; savings: number }[];
  budgets: { label: string; amount: number; spent: number; remaining: number; utilization: number }[];
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

function ollamaBase() {
  return config.ollamaUrl.replace(/\/$/, '');
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
    needsTotal: summary.currentMonth.needsTotal,
    wantsTotal: summary.currentMonth.wantsTotal,
    byCategory: summary.currentMonth.byCategory,
    monthly: summary.monthly,
    budgets: budgetResult.budgets.map((budget) => ({
      label: budgetLabel(budget),
      amount: budget.amount,
      spent: budget.spent,
      remaining: budget.remaining,
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

function isGreetingOnly(question: string) {
  const q = question.trim().toLowerCase();
  const greeting = /^(hi|hello|hey|yo|salam|assalamu alaikum|good morning|good afternoon|good evening|thanks|thank you|ok|okay|bye)[\s!.,?]*$/i;
  return greeting.test(q);
}

function matchedCategory(question: string) {
  const q = question.toLowerCase();
  return EXPENSE_CATEGORIES.find((category) => q.includes(category.toLowerCase()));
}

function snapshotLine(ctx: AssistantContext) {
  return `${ctx.monthLabel}: income ${formatRs(ctx.income)}, expenses ${formatRs(ctx.expense)}, net savings ${formatRs(ctx.savings)} (${ctx.savingsRate}%).`;
}

function asksNextMonthOutlook(q: string) {
  const nextMonth = /\b(next month|upcoming month|coming month|following month)\b/.test(q);
  const outlook = /\b(expected|expect|forecast|predict|prediction|projection|estimate|planned|plan|outlook|likely)\b/.test(q);
  const money = /\b(budget|spend|spending|expense|expenses|cost|money|afford)\b/.test(q);
  return (nextMonth && money) || (nextMonth && outlook) || (outlook && money && /\bnext\b/.test(q));
}

function asksIncomeQuestion(q: string) {
  return /\b(income|salary|earned|earning|earn|received|receive)\b/.test(q);
}

function asksExpenseQuestion(q: string) {
  return /\b(expense|expenses|spent|spending|spend|cost|paid)\b/.test(q);
}

function formatForecastCategories(categories: { category: string; predictedAmount: number }[]) {
  const sorted = [...categories].sort((a, b) => b.predictedAmount - a.predictedAmount).filter((item) => item.predictedAmount > 0);
  if (sorted.length === 0) return '';
  return sorted.map((item) => `${item.category} ${formatRs(item.predictedAmount)}`).join(', ');
}

function summarizeCurrentBudgets(ctx: AssistantContext) {
  if (ctx.budgets.length === 0) {
    return `You have not set any ${ctx.monthLabel} budget limits yet.`;
  }
  const overall = ctx.budgets.find((item) => item.label === 'Overall');
  const categoryBudgets = ctx.budgets.filter((item) => item.label !== 'Overall');
  const parts: string[] = [];
  if (overall) {
    parts.push(`overall cap ${formatRs(overall.amount)} (${overall.utilization}% used)`);
  }
  if (categoryBudgets.length > 0) {
    const top = [...categoryBudgets].sort((a, b) => b.amount - a.amount).slice(0, 3);
    parts.push(
      `category limits such as ${top.map((item) => `${item.label} ${formatRs(item.amount)}`).join(', ')}`
    );
  }
  return `Your ${ctx.monthLabel} budgets include ${parts.join(' and ')}.`;
}

function answerNextMonthOutlook(ctx: AssistantContext) {
  if (!ctx.prediction) {
    return 'I do not have a next-month forecast yet. Open Predictions, train the model, then ask again.';
  }

  const { prediction } = ctx;
  const sign = prediction.changePercentage >= 0 ? 'up' : 'down';
  const change = Math.abs(prediction.changePercentage);
  const categoryLine = formatForecastCategories(prediction.categories);
  const budgetLine = summarizeCurrentBudgets(ctx);

  let reply = `For ${prediction.period}, your ${prediction.modelUsed} forecast expects about ${formatRs(prediction.amount)} in total spending — ${sign} ${change}% from ${ctx.monthLabel} (${formatRs(ctx.expense)}).`;

  if (categoryLine) {
    reply += ` By category, the model points to ${categoryLine}.`;
  }

  reply += ` Budget limits are set month by month and do not roll over automatically. ${budgetLine}`;

  const overallBudget = ctx.budgets.find((item) => item.label === 'Overall');
  if (overallBudget && prediction.amount > overallBudget.amount) {
    reply += ` The forecast is above your current overall budget (${formatRs(overallBudget.amount)}), so you may want to review limits on the Budgets page before ${prediction.period}.`;
  } else if (overallBudget) {
    reply += ` That sits within your current overall budget of ${formatRs(overallBudget.amount)} if you reuse the same cap.`;
  } else {
    reply += ` To plan caps for ${prediction.period}, add budgets on the Budgets page using this forecast as a guide.`;
  }

  return reply;
}

function answerForecast(ctx: AssistantContext) {
  if (!ctx.prediction) {
    return 'No forecast is stored yet. Train a model on the Predictions page first.';
  }
  const sign = ctx.prediction.changePercentage >= 0 ? '+' : '';
  const categoryLine = formatForecastCategories(ctx.prediction.categories);
  let reply = `The latest forecast for ${ctx.prediction.period} is ${formatRs(ctx.prediction.amount)} (${sign}${ctx.prediction.changePercentage}% vs ${ctx.monthLabel}).`;
  if (categoryLine) {
    reply += ` Breakdown: ${categoryLine}.`;
  }
  return reply;
}

function answerCurrentBudgets(ctx: AssistantContext, q: string) {
  if (ctx.budgets.length === 0) {
    return `You have not set a budget for ${ctx.monthLabel} yet. Add one on the Budgets page.`;
  }

  const over = ctx.budgets.filter((item) => item.utilization > 100);
  if (/\b(exceed|over|overrun|passed|crossed)\b/.test(q) || q.includes('close')) {
    if (over.length === 0) {
      const highest = [...ctx.budgets].sort((a, b) => b.utilization - a.utilization)[0];
      return `You are not over any ${ctx.monthLabel} budget right now. Closest is ${highest.label} at ${highest.utilization}% (${formatRs(highest.spent)} of ${formatRs(highest.amount)}).`;
    }
    return over
      .map(
        (item) =>
          `${item.label} is over budget at ${item.utilization}% (${formatRs(item.spent)} spent vs ${formatRs(item.amount)} limit).`
      )
      .join(' ');
  }

  return ctx.budgets
    .map(
      (item) =>
        `${item.label}: limit ${formatRs(item.amount)}, spent ${formatRs(item.spent)}, ${formatRs(item.remaining)} left (${item.utilization}%).`
    )
    .join(' ');
}

function answerIncomeVsSpendConfusion(ctx: AssistantContext) {
  const expenseBit =
    ctx.expense === 0
      ? `No expenses are recorded for ${ctx.monthLabel} yet.`
      : `Your ${ctx.monthLabel} expenses are ${formatRs(ctx.expense)}.`;
  const incomeBit =
    ctx.income === 0
      ? `No income is recorded for ${ctx.monthLabel} yet.`
      : `Your ${ctx.monthLabel} income is ${formatRs(ctx.income)}.`;
  return `Income is money you receive, not something you spend. ${incomeBit} ${expenseBit}`;
}

function answerFromRules(question: string, ctx: AssistantContext) {
  const q = question.toLowerCase();
  const firstName = ctx.name.split(' ')[0] || 'there';
  const top = ctx.byCategory[0];

  if (isGreetingOnly(question)) {
    return `Hello ${firstName}. Ask me about your ${ctx.monthLabel} income, expenses, budgets, savings goals, forecast, or health score — for example “How much did I spend on Food?”`;
  }

  if (/\b(help|what can you|what do you|how do you)\b/.test(q)) {
    return `I answer from your live ledger. You can ask about ${ctx.monthLabel} income and expenses, a category such as Food, budgets, savings goals, the next-month forecast, or your health score.`;
  }

  if (asksNextMonthOutlook(q)) {
    return answerNextMonthOutlook(ctx);
  }

  if (asksIncomeQuestion(q) && asksExpenseQuestion(q) && !matchedCategory(q)) {
    return answerIncomeVsSpendConfusion(ctx);
  }

  if (q.includes('spend the most') || q.includes('highest expense') || q.includes('highest category')) {
    if (!top) {
      return `No expenses are recorded for ${ctx.monthLabel} ${ctx.monthKey.slice(0, 4)}, so there is no highest category yet.`;
    }
    const share = ctx.expense === 0 ? 0 : Number(((top.amount / ctx.expense) * 100).toFixed(1));
    const second = ctx.byCategory[1];
    const extra = second ? ` Next is ${second.category} at ${formatRs(second.amount)}.` : '';
    return `For ${ctx.monthLabel} ${ctx.monthKey.slice(0, 4)}, your highest spending category is ${top.category} at ${formatRs(top.amount)} (${share}% of ${formatRs(ctx.expense)} total expenses).${extra}`;
  }

  const category = matchedCategory(q);
  if (category && /\b(spend|spent|expense|expenses|how much|budget)\b/.test(q)) {
    const row = ctx.byCategory.find((item) => item.category === category);
    const budget = ctx.budgets.find((item) => item.label === category);
    if (!row) {
      const budgetBit = budget
        ? ` Your ${category} budget is ${formatRs(budget.amount)} with ${formatRs(budget.remaining)} remaining.`
        : '';
      return `No ${category} expenses are recorded for ${ctx.monthLabel}.${budgetBit}`;
    }
    const share = ctx.expense === 0 ? 0 : Number(((row.amount / ctx.expense) * 100).toFixed(1));
    const budgetBit = budget
      ? ` Budget is ${formatRs(budget.amount)} (${budget.utilization}% used, ${formatRs(budget.remaining)} remaining).`
      : '';
    return `You spent ${formatRs(row.amount)} on ${category} in ${ctx.monthLabel} (${share}% of expenses).${budgetBit}`;
  }

  if (/\b(need|want)s?\b/.test(q) && /\b(vs|versus|against|split|share|percent)\b/.test(q)) {
    if (ctx.expense === 0) {
      return `No expenses are recorded for ${ctx.monthLabel}, so Need vs Want cannot be calculated.`;
    }
    const needShare = Number(((ctx.needsTotal / ctx.expense) * 100).toFixed(1));
    const wantShare = Number(((ctx.wantsTotal / ctx.expense) * 100).toFixed(1));
    return `In ${ctx.monthLabel}, needs are ${formatRs(ctx.needsTotal)} (${needShare}%) and wants are ${formatRs(ctx.wantsTotal)} (${wantShare}%).`;
  }

  if (/\bgoal/.test(q)) {
    if (ctx.goals.length === 0) {
      return 'You have not added a savings goal yet. Add one on the Savings Goals page.';
    }
    return ctx.goals
      .map(
        (goal) =>
          `${goal.name} is ${goal.status.toLowerCase()} — ${formatRs(goal.remaining)} left${
            goal.requiredMonthly > 0 ? `, about ${formatRs(goal.requiredMonthly)} / month` : ''
          }.`
      )
      .join(' ');
  }

  if (/\bsav(e|ed|ings)\b/.test(q) && !asksNextMonthOutlook(q)) {
    if (ctx.income === 0 && ctx.expense === 0) {
      return `There is no income or expense recorded for ${ctx.monthLabel} yet, so savings cannot be calculated.`;
    }
    return `You saved ${formatRs(ctx.savings)} in ${ctx.monthLabel} (${ctx.savingsRate}% of ${formatRs(ctx.income)} income, with ${formatRs(ctx.expense)} spent).`;
  }

  if (/\b(forecast|prediction|predict)\b/.test(q) || (q.includes('next month') && !q.includes('budget'))) {
    return answerForecast(ctx);
  }

  if (q.includes('budget') || q.includes('exceed')) {
    return answerCurrentBudgets(ctx, q);
  }

  if (q.includes('health') || q.includes('score')) {
    if (!ctx.health) {
      return 'A health score is not available yet.';
    }
    const tip = ctx.health.recommendations[0] ? ` ${ctx.health.recommendations[0]}` : '';
    return `Your financial health score is ${ctx.health.overallScore}/100 (${ctx.health.status}).${tip}`;
  }

  if (asksIncomeQuestion(q)) {
    if (ctx.income === 0) {
      return `No income is recorded for ${ctx.monthLabel} yet.`;
    }
    return `Your recorded income for ${ctx.monthLabel} is ${formatRs(ctx.income)}.`;
  }

  if (asksExpenseQuestion(q)) {
    if (ctx.expense === 0) {
      return `No expenses are recorded for ${ctx.monthLabel} yet.`;
    }
    const topBit = top ? ` Largest category is ${top.category} at ${formatRs(top.amount)}.` : '';
    return `You spent ${formatRs(ctx.expense)} in ${ctx.monthLabel}.${topBit}`;
  }

  return `I can answer from your ${ctx.monthLabel} totals. ${snapshotLine(ctx)} Ask about a category, budget, savings, forecast, or health score.`;
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

async function askOllama(question: string, ctx: AssistantContext, history: ChatTurn[]): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  const recent = history.slice(-10);
  const transcript = recent.map((turn) => `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.text}`).join('\n');

  const prompt = [
    'You are SmartFin, a personal finance assistant.',
    'Answer the latest user question directly in plain language. Do not ignore the question or dump a generic monthly summary unless they asked for totals.',
    'If they ask about next month budget or expected spending, explain the forecast total, main categories, and how that compares to their current budget limits.',
    'If they confuse income with spending, clarify that income is earned money, then give both income and expense figures.',
    'If they greet you, greet them back briefly and offer to help with their figures.',
    'Use ONLY the JSON context for amounts, dates, categories, and model names. Do not invent figures.',
    'If a figure is missing, say you do not have it. Keep the answer to 2-5 sentences. Use Rs. for money.',
    `Context JSON: ${JSON.stringify(ctx)}`,
    transcript ? `Recent conversation:\n${transcript}` : 'Recent conversation: (none)',
    `Latest question: ${question}`,
  ].join('\n\n');

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

export async function askAssistant(userId: string, input: AskAssistantInput) {
  assertDatabase();
  const ctx = await loadContext(userId);
  const rulesAnswer = answerFromRules(input.question, ctx);
  const preferOllama = input.useOllama !== false;

  let answer = rulesAnswer;
  let source = 'Analytics rules engine';
  let usedOllama = false;

  if (preferOllama) {
    const probe = await probeOllama();
    if (probe.available) {
      const ollamaAnswer = await askOllama(input.question, ctx, input.history || []);
      if (ollamaAnswer) {
        answer = ollamaAnswer;
        source = 'Local Ollama LLM';
        usedOllama = true;
      } else {
        source = 'Analytics rules (Ollama unavailable)';
      }
    } else {
      source = 'Analytics rules (Ollama unavailable)';
    }
  }

  const messages = await saveExchange(userId, input.question, answer, source);

  return {
    answer,
    source,
    usedOllama,
    messages,
  };
}
