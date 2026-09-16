/** Shared UTC month helpers — aligned with summary.service.ts */

export type DateRange = {
  start: Date;
  end: Date;
  monthKey: string;
  label: string;
};

export type ParsedPeriod =
  | { kind: 'single'; range: DateRange }
  | { kind: 'compare'; ranges: [DateRange, DateRange] };

const MONTH_NAMES: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

export function monthKeyFromDate(value: Date) {
  return value.toISOString().slice(0, 7);
}

export function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(monthKey: string) {
  const date = new Date(`${monthKey}-01T00:00:00.000Z`);
  const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  return `${month} ${year}`;
}

export function shortMonthLabel(monthKey: string) {
  const date = new Date(`${monthKey}-01T00:00:00.000Z`);
  return date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
}

function startOfMonth(monthKey: string) {
  return new Date(`${monthKey}-01T00:00:00.000Z`);
}

function startOfNextMonth(monthKey: string) {
  return startOfMonth(shiftMonth(monthKey, 1));
}

function inferYearForMonth(monthIndex: number, refDate: Date) {
  const refMonth = refDate.getUTCMonth();
  const refYear = refDate.getUTCFullYear();
  if (monthIndex > refMonth) {
    return refYear - 1;
  }
  return refYear;
}

function buildMonthKey(monthIndex: number, year: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

export function buildMonthRange(monthKey: string): DateRange {
  return {
    start: startOfMonth(monthKey),
    end: startOfNextMonth(monthKey),
    monthKey,
    label: monthLabel(monthKey),
  };
}

function parseExplicitMonthYear(text: string, refDate: Date): string | null {
  const q = text.toLowerCase();

  // "August 2026", "aug 2026"
  const namedYear = q.match(
    /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d{4})\b/
  );
  if (namedYear) {
    const monthIndex = MONTH_NAMES[namedYear[1]];
    return buildMonthKey(monthIndex, Number(namedYear[2]));
  }

  // Standalone month name
  const monthPattern =
    /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\b/;
  const monthMatch = q.match(monthPattern);
  if (monthMatch) {
    const monthIndex = MONTH_NAMES[monthMatch[1]];
    const year = inferYearForMonth(monthIndex, refDate);
    return buildMonthKey(monthIndex, year);
  }

  // YYYY-MM
  const iso = q.match(/\b(\d{4})-(\d{2})\b/);
  if (iso) {
    const month = Number(iso[2]);
    if (month >= 1 && month <= 12) {
      return `${iso[1]}-${iso[2]}`;
    }
  }

  return null;
}

function parseRelativeMonth(text: string, refDate: Date): string | null {
  const q = text.toLowerCase();
  const currentKey = monthKeyFromDate(refDate);

  if (/\b(this month|current month)\b/.test(q)) {
    return currentKey;
  }
  if (/\b(last month|previous month)\b/.test(q)) {
    return shiftMonth(currentKey, -1);
  }
  if (/\btoday\b/.test(q)) {
    return currentKey;
  }
  if (/\byesterday\b/.test(q)) {
    const yesterday = new Date(refDate);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return monthKeyFromDate(yesterday);
  }

  return null;
}

function parseQuarter(text: string, refDate: Date): DateRange | null {
  const q = text.toLowerCase();
  const quarterMatch = q.match(/\bq([1-4])\b(?:\s+(\d{4}))?/);
  if (!quarterMatch) return null;

  const quarter = Number(quarterMatch[1]);
  const year = quarterMatch[2] ? Number(quarterMatch[2]) : refDate.getUTCFullYear();
  const startMonth = (quarter - 1) * 3;
  const startKey = buildMonthKey(startMonth, year);
  const endKey = buildMonthKey(startMonth + 2, year);

  return {
    start: startOfMonth(startKey),
    end: startOfNextMonth(endKey),
    monthKey: startKey,
    label: `Q${quarter} ${year}`,
  };
}

function extractComparisonMonths(text: string, refDate: Date): [string, string] | null {
  const q = text.toLowerCase();
  if (!/\b(compare|comparison|versus|vs\.?|against|difference between)\b/.test(q)) {
    return null;
  }

  const found: string[] = [];
  for (const [name, index] of Object.entries(MONTH_NAMES)) {
    if (name.length <= 3) continue;
    if (q.includes(name)) {
      const key = buildMonthKey(index, inferYearForMonth(index, refDate));
      if (!found.includes(key)) found.push(key);
    }
  }

  if (found.length >= 2) {
    return [found[0], found[1]];
  }

  const relative = /\b(this month|last month)\b/g;
  const relMatches = [...q.matchAll(relative)].map((m) => m[1]);
  if (relMatches.length >= 2) {
    const currentKey = monthKeyFromDate(refDate);
    const keys = relMatches.map((m) => (m === 'this month' ? currentKey : shiftMonth(currentKey, -1)));
    return [keys[0], keys[1]];
  }

  if (/\bthis month\b/.test(q) && /\blast month\b/.test(q)) {
    const currentKey = monthKeyFromDate(refDate);
    return [shiftMonth(currentKey, -1), currentKey];
  }

  return null;
}

export function parsePeriod(
  question: string,
  refDate = new Date(),
  contextMonthKey?: string
): ParsedPeriod | null {
  const comparison = extractComparisonMonths(question, refDate);
  if (comparison) {
    return {
      kind: 'compare',
      ranges: [buildMonthRange(comparison[0]), buildMonthRange(comparison[1])],
    };
  }

  const quarter = parseQuarter(question, refDate);
  if (quarter) {
    return { kind: 'single', range: quarter };
  }

  const explicit = parseExplicitMonthYear(question, refDate);
  if (explicit) {
    return { kind: 'single', range: buildMonthRange(explicit) };
  }

  const relative = parseRelativeMonth(question, refDate);
  if (relative) {
    return { kind: 'single', range: buildMonthRange(relative) };
  }

  if (contextMonthKey && /\b(that month|same month|that period)\b/i.test(question)) {
    return { kind: 'single', range: buildMonthRange(contextMonthKey) };
  }

  return null;
}

export function defaultCurrentPeriod(refDate = new Date()): DateRange {
  const monthKey = monthKeyFromDate(refDate);
  return buildMonthRange(monthKey);
}
