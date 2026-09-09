'use client';

import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { FinancialHealthScore } from '../../types';
import { ShieldCheck, CheckCircle2, ArrowRight, Compass } from 'lucide-react';
import { scoreService } from '../../services/score.service';
import { ApiError } from '../../lib/api';

function statusClass(status: FinancialHealthScore['status']) {
  if (status === 'Excellent' || status === 'Good') return 'text-emerald-400';
  if (status === 'Moderate') return 'text-amber-400';
  return 'text-rose-400';
}

export default function FinancialHealthPage() {
  const [score, setScore] = useState<FinancialHealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadScore = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await scoreService.get();
      setScore(res.score);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load health score.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScore();
  }, []);

  const components = score
    ? [
        { name: 'Savings rate (max 25)', score: score.componentScores.savingsRate, max: 25, color: 'bg-emerald-500' },
        { name: 'Budget adherence (max 20)', score: score.componentScores.budgetAdherence, max: 20, color: 'bg-teal-500' },
        { name: 'Expense stability (max 15)', score: score.componentScores.expenseStability, max: 15, color: 'bg-blue-500' },
        { name: 'Emergency fund (max 20)', score: score.componentScores.emergencyFund, max: 20, color: 'bg-purple-500' },
        { name: 'Savings goal pace (max 20)', score: score.componentScores.goalProgress, max: 20, color: 'bg-cyan-500' },
      ]
    : [];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Diagnostics</p>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100">Financial health</h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Weighted 0–100 score from this month’s income, expenses, budgets, and savings goals.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
            <span>{error}</span>
            <button type="button" onClick={loadScore} className="font-medium underline-offset-2 hover:underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Calculating health score…</p>
        ) : !score ? (
          <p className="text-sm text-slate-400">No score available yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between items-center text-center space-y-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall score</span>
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-8 border-slate-800" />
                  <div
                    className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent border-r-transparent"
                    style={{ transform: `rotate(${score.overallScore * 1.8}deg)` }}
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-display font-semibold text-slate-100">{score.overallScore}</span>
                    <span className={`text-xs font-semibold mt-1 ${statusClass(score.status)}`}>{score.status}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                  Recalculated whenever you add or change income, expenses, budgets, or goals.
                </p>
              </div>

              <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
                <h3 className="font-semibold text-base text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> Factor breakdown
                </h3>
                <div className="space-y-4">
                  {components.map((item) => {
                    const pct = Math.round((item.score / item.max) * 100);
                    return (
                      <div key={item.name} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-300">{item.name}</span>
                          <span className="text-slate-100 font-semibold">
                            {item.score} / {item.max} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> How this was calculated
                </h3>
                <div className="space-y-2.5">
                  {score.explanations.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-md bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{exp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-400" /> Recommendations
                </h3>
                <div className="space-y-2.5">
                  {score.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-md bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <ArrowRight className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
