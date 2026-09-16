import { DateRange, buildMonthRange, monthKeyFromDate, parsePeriod, shortMonthLabel } from './date-parser.js';
import { matchedCategory } from './financial-query.service.js';

export type ChatTurn = { role: 'user' | 'assistant'; text: string };

export type ConversationContext = {
  lastMonthKey?: string;
  lastCategory?: string;
};

const MONTH_IN_RESPONSE =
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i;

function extractMonthKeyFromText(text: string, refDate: Date): string | undefined {
  const period = parsePeriod(text, refDate);
  if (period?.kind === 'single') {
    return period.range.monthKey;
  }
  const match = text.match(MONTH_IN_RESPONSE);
  if (match) {
    const parsed = parsePeriod(match[0], refDate);
    if (parsed?.kind === 'single') return parsed.range.monthKey;
  }
  return undefined;
}

export function buildContextFromHistory(history: ChatTurn[], refDate = new Date()): ConversationContext {
  const ctx: ConversationContext = {};
  const recent = history.slice(-6);

  for (let i = recent.length - 1; i >= 0; i -= 1) {
    const turn = recent[i];
    if (!ctx.lastMonthKey) {
      ctx.lastMonthKey = extractMonthKeyFromText(turn.text, refDate);
    }
    if (!ctx.lastCategory) {
      ctx.lastCategory = matchedCategory(turn.text);
    }
    if (ctx.lastMonthKey && ctx.lastCategory) break;
  }

  return ctx;
}

export function isFollowUpQuestion(question: string): boolean {
  const q = question.toLowerCase().trim();
  return (
    /^(what about|how about|and|also)\b/.test(q) ||
    /\b(that category|same category|that month|same month)\b/.test(q) ||
    /^and\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/i.test(
      q
    ) ||
    /^(food|transport|rent|bills|education|healthcare|shopping|entertainment|travel|utilities|other)\??$/i.test(
      q
    )
  );
}

export function resolvePeriod(
  question: string,
  ctx: ConversationContext,
  refDate = new Date()
): DateRange {
  const period = parsePeriod(question, refDate, ctx.lastMonthKey);

  if (period?.kind === 'single') {
    return period.range;
  }

  if (isFollowUpQuestion(question)) {
    const categoryOnly = matchedCategory(question);
    const monthOnly =
      /^(and\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\??$/i.test(
        question.trim()
      );

    if (monthOnly) {
      const parsed = parsePeriod(question, refDate);
      if (parsed?.kind === 'single') return parsed.range;
    }

    if (categoryOnly && ctx.lastMonthKey) {
      return buildMonthRange(ctx.lastMonthKey);
    }

    if (ctx.lastMonthKey && !parsePeriod(question, refDate)?.kind) {
      const monthFollowUp = question.match(
        /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/i
      );
      if (monthFollowUp) {
        const parsed = parsePeriod(monthFollowUp[0], refDate);
        if (parsed?.kind === 'single') return parsed.range;
      }
      if (/^(what about|how about|and)\b/i.test(question.trim()) && matchedCategory(question)) {
        return buildMonthRange(ctx.lastMonthKey);
      }
    }
  }

  return buildMonthRange(monthKeyFromDate(refDate));
}

export function resolveCategory(question: string, ctx: ConversationContext): string | undefined {
  const direct = matchedCategory(question);
  if (direct) return direct;

  if (isFollowUpQuestion(question) && ctx.lastCategory) {
    const q = question.toLowerCase();
    if (/^(what about|how about|and)\b/.test(q) || q.includes('that category') || q.includes('same category')) {
      return ctx.lastCategory;
    }
  }

  return undefined;
}

export function formatPeriodShort(monthKey: string) {
  return `${shortMonthLabel(monthKey)} ${monthKey.slice(0, 4)}`;
}
