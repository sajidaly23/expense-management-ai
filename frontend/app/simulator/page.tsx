'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { ExpenseCategory } from '../../types';
import { simulatorService, SimulatorResult } from '../../services/simulator.service';
import { ApiError } from '../../lib/api';
import { FlaskConical, Play } from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Rent',
  'Bills',
  'Education',
  'Healthcare',
  'Shopping',
  'Entertainment',
  'Travel',
  'Utilities',
  'Other',
];

export default function SimulatorPage() {
  const [incomeChangePercent, setIncomeChangePercent] = useState(0);
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [categoryCutPercent, setCategoryCutPercent] = useState(0);
  const [extraSavingsMonthly, setExtraSavingsMonthly] = useState(0);
  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSimulation = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await simulatorService.simulate({
        incomeChangePercent,
        category: categoryCutPercent > 0 ? category : undefined,
        categoryCutPercent: categoryCutPercent > 0 ? categoryCutPercent : 0,
        extraSavingsMonthly,
      });
      if (!res.result) {
        throw new ApiError('Simulation completed but no results were returned.', 500);
      }
      setResult(res.result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Simulation failed.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <p className="typo-overline text-slate-400">Overview</p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100 mt-1">What-If Simulator</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Model income changes, category cuts, and extra savings to see projected monthly impact.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6 text-sm">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-400" /> Adjust assumptions
            </h3>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-400">Quick Scenario Presets</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIncomeChangePercent(20);
                    setCategoryCutPercent(0);
                    setExtraSavingsMonthly(0);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium transition-colors"
                >
                  ⚡ Salary +20%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIncomeChangePercent(-10);
                    setCategoryCutPercent(0);
                    setExtraSavingsMonthly(0);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors"
                >
                  ⚡ Income -10%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategory('Food');
                    setCategoryCutPercent(20);
                    setIncomeChangePercent(0);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-xs font-medium transition-colors"
                >
                  ⚡ Cut Food 20%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExtraSavingsMonthly(15000);
                    setIncomeChangePercent(0);
                    setCategoryCutPercent(0);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-medium transition-colors"
                >
                  ⚡ Save +Rs 15k
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-400">
                <label>Income change</label>
                <span className="text-slate-100 font-medium">{incomeChangePercent >= 0 ? '+' : ''}{incomeChangePercent}%</span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                step={1}
                value={incomeChangePercent}
                onChange={(e) => setIncomeChangePercent(Number(e.target.value))}
                className="w-full accent-ink-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-400">
                <label>Cut category spending</label>
                <span className="text-slate-100 font-medium">{categoryCutPercent}%</span>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 mb-2"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={categoryCutPercent}
                onChange={(e) => setCategoryCutPercent(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-400">
                <label>Extra monthly savings (Rs.)</label>
                <span className="text-slate-100 font-medium">{extraSavingsMonthly.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={1000}
                value={extraSavingsMonthly}
                onChange={(e) => setExtraSavingsMonthly(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <button
              onClick={() => void runSimulation()}
              disabled={loading}
              className="w-full px-5 py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Play className="w-4 h-4" /> {loading ? 'Running…' : 'Run simulation'}
            </button>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-semibold text-slate-100">Projected outcome</h3>
            {!result ? (
              <p className="text-sm text-slate-400">Adjust sliders and run a simulation to see projected savings and health score.</p>
            ) : (
              <>
                <p className="text-xs text-slate-500">Based on {result.monthLabel}</p>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="Income" current={result.current.income} projected={result.projected.income} />
                  <MetricCard label="Expenses" current={result.current.expense} projected={result.projected.expense} invert />
                  <MetricCard label="Savings" current={result.current.savings} projected={result.projected.savings} />
                  <MetricCard label="Health score" current={result.current.healthScore} projected={result.projected.healthScore} suffix="" />
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <p className="text-slate-400">
                    Savings rate: {result.current.savingsRate}% →{' '}
                    <span className="text-emerald-400 font-medium">{result.projected.savingsRate}%</span>
                    {' '}({result.delta.savingsRate >= 0 ? '+' : ''}{result.delta.savingsRate} pts)
                  </p>
                  <p className="text-slate-400">
                    Monthly savings delta:{' '}
                    <span className={result.delta.savings >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {result.delta.savings >= 0 ? '+' : ''}Rs. {result.delta.savings.toLocaleString()}
                    </span>
                  </p>
                </div>
                {result.adjustments.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {result.adjustments.map((adj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                        {adj}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function MetricCard({
  label,
  current,
  projected,
  invert,
  suffix = 'Rs.',
}: {
  label: string;
  current: number;
  projected: number;
  invert?: boolean;
  suffix?: string;
}) {
  const delta = projected - current;
  const improved = invert ? delta < 0 : delta > 0;
  const fmt = (n: number) => (suffix === 'Rs.' ? `Rs. ${n.toLocaleString()}` : String(n));

  return (
    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-slate-100 mt-1">{fmt(projected)}</p>
      <p className="text-xs text-slate-500 mt-0.5">
        was {fmt(current)}{' '}
        <span className={improved ? 'text-emerald-400' : delta === 0 ? 'text-slate-500' : 'text-rose-400'}>
          ({delta >= 0 ? '+' : ''}{suffix === 'Rs.' ? `Rs. ${delta.toLocaleString()}` : delta})
        </span>
      </p>
    </div>
  );
}
