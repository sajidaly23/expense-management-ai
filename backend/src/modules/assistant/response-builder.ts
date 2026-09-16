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
