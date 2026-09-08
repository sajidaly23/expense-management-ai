'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { mockBudgets } from '../../lib/mockData';
import { Budget, ExpenseCategory } from '../../types';
import { PiggyBank, Plus, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold border border-teal-500/20">
              <PiggyBank className="w-3.5 h-3.5" /> Budget Utilization Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100 mt-1">
              Budget & Limit Management
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Monitors overall and category budgets with real-time warning triggers at 80%, 90%, and 100%+ utilization.
            </p>
          </div>
        </div>

        {/* Overall Budget Overview Card */}
        {budgets.filter(b => !b.category).map(overall => {
          const util = Math.round((overall.spent / overall.amount) * 100);
          return (
            <div key={overall.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Overall Monthly Budget</span>
                  <h3 className="text-2xl font-black text-slate-100">
                    Rs. {overall.spent.toLocaleString()} / Rs. {overall.amount.toLocaleString()}
                  </h3>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold border ${
                  util >= 100 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : util >= 80 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {util}% Utilization
                </span>
              </div>

              <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    util >= 100 ? 'bg-rose-500' : util >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(util, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 pt-1">
                <span>Remaining Overall Allowance: <strong className="text-slate-200">Rs. {Math.max(0, overall.amount - overall.spent).toLocaleString()}</strong></span>
                <span>Formula: Utilization = (Spent / Budget) &times; 100</span>
              </div>
            </div>
          );
        })}

        {/* Category Budget Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Category Budget Limits & Utilization Warnings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {budgets.filter(b => b.category).map((b) => {
              const util = Math.round((b.spent / b.amount) * 100);
              return (
                <div key={b.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-100">{b.category} Budget</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      util >= 100 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : util >= 90 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {util >= 100 ? 'EXCEEDED' : util >= 90 ? 'CRITICAL (90%)' : util >= 80 ? 'WARNING (80%)' : 'NORMAL'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Spent: <strong className="text-slate-200">Rs. {b.spent.toLocaleString()}</strong> of Rs. {b.amount.toLocaleString()}</p>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          util >= 100 ? 'bg-rose-500' : util >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(util, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-800/60">
                    <span>Remaining: Rs. {Math.max(0, b.amount - b.spent).toLocaleString()}</span>
                    <span>{util}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
