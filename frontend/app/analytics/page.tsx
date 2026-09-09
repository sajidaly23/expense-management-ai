'use client';

import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { chartTheme, tooltipStyle } from '../../lib/theme';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { summaryService, SummaryResponse } from '../../services/summary.service';
import { ApiError } from '../../lib/api';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await summaryService.get();
      setSummary(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const categoryBarData = summary?.byCategory || [];
  const monthly = summary?.monthly || [];
  const month = summary?.currentMonth;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Insights</p>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100 mt-1">
              Analytics
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Category spend and monthly savings from your income and expense ledger
              {month ? ` · ${month.label} savings rate ${month.savingsRate}%` : ''}.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
            <span>{error}</span>
            <button type="button" onClick={loadSummary} className="font-medium underline-offset-2 hover:underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading analytics…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" /> Spend by category
              </h3>
              <div className="h-72 w-full pt-2">
                {categoryBarData.length === 0 ? (
                  <p className="text-sm text-slate-400 pt-16 text-center">Add expenses to see category totals.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBarData}>
                      <XAxis dataKey="category" stroke={chartTheme.axis} fontSize={11} tickLine={false} />
                      <YAxis
                        stroke={chartTheme.axis}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `Rs.${v / 1000}k` : `Rs.${v}`)}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(val: number) => [`Rs. ${Number(val).toLocaleString()}`, 'Amount']}
                      />
                      <Bar dataKey="amount" fill={chartTheme.copper} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" /> Monthly savings
              </h3>
              <div className="h-72 w-full pt-2">
                {monthly.every((row) => row.income === 0 && row.expense === 0) ? (
                  <p className="text-sm text-slate-400 pt-16 text-center">Add income or expenses to see savings by month.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly}>
                      <XAxis dataKey="month" stroke={chartTheme.axis} fontSize={11} tickLine={false} />
                      <YAxis
                        stroke={chartTheme.axis}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `Rs.${v / 1000}k` : `Rs.${v}`)}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(val: number) => [`Rs. ${Number(val).toLocaleString()}`, 'Savings']}
                      />
                      <Bar dataKey="savings" fill={chartTheme.sage} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
