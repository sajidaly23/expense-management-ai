'use client';

import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { FileText, Download } from 'lucide-react';
import { reportService, ReportPayload } from '../../services/report.service';
import { ApiError } from '../../lib/api';

function formatRs(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
}

function healthClass(status: string | undefined) {
  if (status === 'Excellent' || status === 'Good') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (status === 'Moderate') return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState<'pdf' | 'xls' | ''>('');

  const loadReport = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await reportService.get();
      setReport(result.report);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the statement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  const handleExport = async (kind: 'pdf' | 'xls') => {
    if (!report) return;
    setError('');
    setExporting(kind);
    try {
      if (kind === 'pdf') {
        await reportService.downloadPdf(report.period.key);
      } else {
        await reportService.downloadExcel(report.period.key);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to download the file.');
    } finally {
      setExporting('');
    }
  };

  const year = report?.period.key.slice(0, 4);
  const expenseTotal = report?.currentMonth.expense || 0;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
              <FileText className="w-3.5 h-3.5" /> Statement generator
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100 mt-1">
              Financial statements
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Live totals for the signed-in account. The PDF matches this layout.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!report || Boolean(exporting)}
              onClick={() => void handleExport('pdf')}
              className="px-4 py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {exporting === 'pdf' ? 'Preparing PDF…' : 'Download PDF'}
            </button>
            <button
              type="button"
              disabled={!report || Boolean(exporting)}
              onClick={() => void handleExport('xls')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {exporting === 'xls' ? 'Preparing Excel…' : 'Export Excel'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
            <span>{error}</span>
            <button type="button" onClick={() => void loadReport()} className="font-medium underline-offset-2 hover:underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading statement…</p>
        ) : !report ? (
          <p className="text-sm text-slate-400">No statement available yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-white text-slate-900 shadow-lift">
            <div className="bg-slate-950 px-8 py-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-emerald-400">SmartFin AI</p>
                  <h2 className="text-2xl font-display font-semibold mt-1">Monthly Financial Statement</h2>
                  <p className="text-sm text-slate-300 mt-2">Prepared for {report.preparedFor}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Period</p>
                  <p className="text-lg font-semibold">{report.period.label} {year}</p>
                  <p className="text-[11px] text-emerald-400 mt-2 font-semibold">CONFIDENTIAL</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-emerald-500" />

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border border-slate-200 rounded-lg p-4 border-l-4 border-l-emerald-500">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Income</p>
                  <p className="text-xl font-semibold mt-1">{formatRs(report.currentMonth.income)}</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 border-l-4 border-l-amber-500">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Expenses</p>
                  <p className="text-xl font-semibold mt-1">{formatRs(report.currentMonth.expense)}</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 border-l-4 border-l-violet-500">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Net savings</p>
                  <p className="text-xl font-semibold mt-1">
                    {formatRs(report.currentMonth.savings)}
                    <span className="text-sm font-medium text-slate-500 ml-2">({report.currentMonth.savingsRate}%)</span>
                  </p>
                </div>
              </div>

              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 border-b border-slate-200 pb-2 mb-3">
                  Spending by category
                </h3>
                {report.currentMonth.byCategory.length === 0 ? (
                  <p className="text-sm text-slate-500">No expenses recorded this month.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-950 text-white">
                        <th className="text-left font-medium px-3 py-2">Category</th>
                        <th className="text-right font-medium px-3 py-2">Amount</th>
                        <th className="text-right font-medium px-3 py-2">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.currentMonth.byCategory.map((row) => (
                        <tr key={row.category} className="border-b border-slate-100">
                          <td className="px-3 py-2">{row.category}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatRs(row.amount)}</td>
                          <td className="px-3 py-2 text-right text-slate-500">
                            {expenseTotal ? `${((row.amount / expenseTotal) * 100).toFixed(1)}%` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 border-b border-slate-200 pb-2 mb-3">
                  Budgets
                </h3>
                {report.budgets.length === 0 ? (
                  <p className="text-sm text-slate-500">No budgets set for this month.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-950 text-white">
                        <th className="text-left font-medium px-3 py-2">Budget</th>
                        <th className="text-right font-medium px-3 py-2">Spent</th>
                        <th className="text-right font-medium px-3 py-2">Limit</th>
                        <th className="text-right font-medium px-3 py-2">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.budgets.map((budget) => (
                        <tr key={budget.id} className="border-b border-slate-100">
                          <td className="px-3 py-2">{budget.category || 'Overall'}</td>
                          <td className="px-3 py-2 text-right">{formatRs(budget.spent)}</td>
                          <td className="px-3 py-2 text-right">{formatRs(budget.amount)}</td>
                          <td className={`px-3 py-2 text-right font-medium ${budget.utilization > 100 ? 'text-rose-600' : 'text-slate-900'}`}>
                            {budget.utilization}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Next-month forecast</p>
                  {report.prediction ? (
                    <>
                      <p className="text-xl font-semibold text-violet-700 mt-1">{formatRs(report.prediction.predictedAmount)}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {report.prediction.predictionPeriod} · {report.prediction.modelUsed}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 mt-2">No stored forecast. Train a model on Predictions first.</p>
                  )}
                </div>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Financial health</p>
                  {report.health ? (
                    <div className="mt-2 flex items-center gap-3">
                      <p className="text-xl font-semibold">{report.health.overallScore} / 100</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${healthClass(report.health.status)}`}>
                        {report.health.status}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 mt-2">Health score is not available.</p>
                  )}
                </div>
              </div>

              {report.goals.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 border-b border-slate-200 pb-2 mb-3">
                    Savings goals
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-950 text-white">
                        <th className="text-left font-medium px-3 py-2">Goal</th>
                        <th className="text-left font-medium px-3 py-2">Status</th>
                        <th className="text-right font-medium px-3 py-2">Remaining</th>
                        <th className="text-right font-medium px-3 py-2">Required / month</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.goals.map((goal) => (
                        <tr key={goal.name} className="border-b border-slate-100">
                          <td className="px-3 py-2">{goal.name}</td>
                          <td className="px-3 py-2">{goal.status}</td>
                          <td className="px-3 py-2 text-right">{formatRs(goal.remaining)}</td>
                          <td className="px-3 py-2 text-right">{formatRs(goal.requiredMonthly)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              <section className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
                  Executive summary
                </h3>
                <p className="text-sm leading-relaxed text-slate-700">{report.executiveSummary}</p>
              </section>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
