import { DateRange } from './date-parser.js';
import { MonthTotals, SalaryResult, LargestExpenseResult } from './financial-query.service.js';

export function formatRs(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatTotalExpense(totals: MonthTotals, topCategories?: { category: string; amount: number }[]) {
  if (totals.expense === 0) {
    return `No expenses are recorded for ${totals.label}.`;
  }

  let reply = `Your total expenses in ${totals.label} were ${formatRs(totals.expense)}.`;

  const top = topCategories || totals.byCategory.slice(0, 3);
  if (top.length > 0) {
    reply += `\n\nTop categories:\n${top.map((row) => `• ${row.category}: ${formatRs(row.amount)}`).join('\n')}`;
  }

  return reply;
}

export function formatTotalIncome(totals: MonthTotals) {
  if (totals.income === 0) {
    return `No income is recorded for ${totals.label}.`;
  }
  return `Your total income in ${totals.label} was ${formatRs(totals.income)}.`;
}

export function formatNetSavings(totals: MonthTotals) {
  if (totals.income === 0 && totals.expense === 0) {
    return `There is no income or expense recorded for ${totals.label}, so savings cannot be calculated.`;
  }
  return `You saved ${formatRs(totals.savings)} in ${totals.label} (${totals.savingsRate}% of ${formatRs(totals.income)} income, with ${formatRs(totals.expense)} spent).`;
}

export function formatCategoryExpense(category: string, amount: number, totals: MonthTotals, budget?: {
  amount: number;
  spent: number;
  remaining: number;
  utilization: number;
}) {
  if (amount === 0) {
    const budgetBit = budget
      ? ` Your ${category} budget is ${formatRs(budget.amount)} with ${formatRs(budget.remaining)} remaining.`
      : '';
    return `No ${category} expenses are recorded for ${totals.label}.${budgetBit}`;
  }

  const share = totals.expense === 0 ? 0 : Number(((amount / totals.expense) * 100).toFixed(1));
  let reply = `You spent ${formatRs(amount)} on ${category} in ${totals.label} (${share}% of expenses).`;

  if (budget) {
    reply += ` Budget: ${formatRs(budget.amount)} (${budget.utilization}% used, ${formatRs(budget.remaining)} remaining).`;
  }

  return reply;
}

export function formatSalaryIncome(result: SalaryResult) {
  if (result.count === 0) {
    return `No salary income is recorded for ${result.label}.`;
  }
  if (result.count === 1) {
    return `You received ${formatRs(result.total)} in salary across 1 transaction in ${result.label}.`;
  }
  return `You received ${formatRs(result.total)} in salary across ${result.count} transactions in ${result.label}.`;
}

export function formatSalaryCount(count: number, range: DateRange, total?: number) {
  if (count === 0) {
    return `You had no salary transactions in ${range.label}.`;
  }
  const countLabel = count === 1 ? '1 salary transaction' : `${count} salary transactions`;
  if (total !== undefined && total > 0) {
    return `You had ${countLabel} in ${range.label}, totalling ${formatRs(total)}.`;
  }
  return `You had ${countLabel} in ${range.label}.`;
}

export function formatTopCategories(totals: MonthTotals, limit = 5) {
  if (totals.byCategory.length === 0) {
    return `No expenses are recorded for ${totals.label}, so there are no spending categories yet.`;
  }

  const top = totals.byCategory.slice(0, limit);
  const leader = top[0];
  const share = totals.expense === 0 ? 0 : Number(((leader.amount / totals.expense) * 100).toFixed(1));

  let reply = `For ${totals.label}, your highest spending category is ${leader.category} at ${formatRs(leader.amount)} (${share}% of ${formatRs(totals.expense)} total expenses).`;

  if (top.length > 1) {
    reply += `\n\nTop categories:\n${top.map((row) => `• ${row.category}: ${formatRs(row.amount)}`).join('\n')}`;
  }

  return reply;
}

export function formatLargestExpense(item: LargestExpenseResult) {
  if (!item) {
    return `No expenses are recorded for that period.`;
  }
  return `Your largest expense in ${item.label} was ${formatRs(item.amount)} for ${item.description} (${item.category}, ${item.date}).`;
}

export function formatMonthlyComparison(a: MonthTotals, b: MonthTotals, expenseDelta: number, incomeDelta: number) {
  const expenseSign = expenseDelta >= 0 ? 'up' : 'down';
  const incomeSign = incomeDelta >= 0 ? 'up' : 'down';

  return (
    `Expense comparison:\n` +
    `• ${a.label}: ${formatRs(a.expense)}\n` +
    `• ${b.label}: ${formatRs(b.expense)} (${expenseSign} ${formatRs(Math.abs(expenseDelta))})\n\n` +
    `Income comparison:\n` +
    `• ${a.label}: ${formatRs(a.income)}\n` +
    `• ${b.label}: ${formatRs(b.income)} (${incomeSign} ${formatRs(Math.abs(incomeDelta))})`
  );
}

export function formatMonthlySummary(totals: MonthTotals) {
  return (
    `${totals.label} summary:\n` +
    `• Income: ${formatRs(totals.income)}\n` +
    `• Expenses: ${formatRs(totals.expense)}\n` +
    `• Net savings: ${formatRs(totals.savings)} (${totals.savingsRate}% savings rate)`
  );
}

export function formatExpenseChangeWhy(
  current: MonthTotals,
  previous: MonthTotals,
  expenseDelta: number
) {
  if (current.expense === 0 && previous.expense === 0) {
    return `There are no expenses recorded for ${current.label} or ${previous.label}, so there is no spending change to explain.`;
  }

  const direction = expenseDelta >= 0 ? 'increased' : 'decreased';
  const absDelta = Math.abs(expenseDelta);

  const prevMap = new Map(previous.byCategory.map((row) => [row.category, row.amount]));
  const deltas = current.byCategory
    .map((row) => ({
      category: row.category,
      delta: row.amount - (prevMap.get(row.category) || 0),
      current: row.amount,
      previous: prevMap.get(row.category) || 0,
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const top = deltas[0];
  let reply = `Your spending ${direction} by ${formatRs(absDelta)} from ${previous.label} (${formatRs(previous.expense)}) to ${current.label} (${formatRs(current.expense)}).`;

  if (top && top.delta !== 0) {
    const catDirection = top.delta >= 0 ? 'increased' : 'decreased';
    reply += ` The largest contributor was ${top.category}, which ${catDirection} by ${formatRs(Math.abs(top.delta))} (${formatRs(top.previous)} → ${formatRs(top.current)}).`;
  }

  return reply;
}

export function formatSavingsChangeWhy(
  current: MonthTotals,
  previous: MonthTotals,
  savingsDelta: number
) {
  const direction = savingsDelta >= 0 ? 'improved' : 'declined';
  const absDelta = Math.abs(savingsDelta);

  return (
    `Your net savings ${direction} by ${formatRs(absDelta)} from ${previous.label} (${formatRs(previous.savings)}, ${previous.savingsRate}% rate) ` +
    `to ${current.label} (${formatRs(current.savings)}, ${current.savingsRate}% rate). ` +
    `Income moved from ${formatRs(previous.income)} to ${formatRs(current.income)}, and expenses from ${formatRs(previous.expense)} to ${formatRs(current.expense)}.`
  );
}

export function formatCategoryDriver(current: MonthTotals, previous: MonthTotals) {
  const prevMap = new Map(previous.byCategory.map((row) => [row.category, row.amount]));
  const deltas = current.byCategory
    .map((row) => ({
      category: row.category,
      delta: row.amount - (prevMap.get(row.category) || 0),
      current: row.amount,
      previous: prevMap.get(row.category) || 0,
    }))
    .sort((a, b) => b.delta - a.delta);

  if (deltas.length === 0) {
    return `No category spending is recorded for ${current.label}, so I cannot identify a driver.`;
  }

  const top = deltas[0];
  if (top.delta <= 0) {
    const highest = current.byCategory[0];
    return `No category increased versus ${previous.label}. Your highest spending category in ${current.label} is ${highest.category} at ${formatRs(highest.amount)}.`;
  }

  const share = current.expense === 0 ? 0 : Number(((top.delta / Math.abs(current.expense - previous.expense || 1)) * 100).toFixed(1));

  return (
    `${top.category} contributed the most to the change between ${previous.label} and ${current.label}, ` +
    `rising by ${formatRs(top.delta)} (${formatRs(top.previous)} → ${formatRs(top.current)}). ` +
    `It accounts for roughly ${share}% of the overall spending shift.`
  );
}

export function formatSpendingVsEarning(totals: MonthTotals) {
  const expenseBit =
    totals.expense === 0
      ? `No expenses are recorded for ${totals.label} yet.`
      : `Your ${totals.label} expenses are ${formatRs(totals.expense)}.`;
  const incomeBit =
    totals.income === 0
      ? `No income is recorded for ${totals.label} yet.`
      : `Your ${totals.label} income is ${formatRs(totals.income)}.`;

  if (totals.expense > totals.income && totals.income > 0) {
    return `${incomeBit} ${expenseBit} You are spending ${formatRs(totals.expense - totals.income)} more than you earn.`;
  }

  return `${incomeBit} ${expenseBit}`;
}
