'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { mockSavingsGoals } from '../../lib/mockData';
import { SavingsGoal } from '../../types';
import { Target, Plus, CheckCircle2, Calendar, Clock, AlertTriangle } from 'lucide-react';

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>(mockSavingsGoals);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
              <Target className="w-3.5 h-3.5" /> Savings Goal Calculation Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
              Savings Goals & Target Planning
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Calculates progress percentages and required monthly savings formulas to keep your financial goals on track.
            </p>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            // Approx remaining months
            const requiredMonthly = Math.round(remaining / 15);

            return (
              <div key={goal.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-100">{goal.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    goal.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {goal.status}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Target Progress ({progress}%)</span>
                    <span className="text-slate-100 font-bold font-mono">
                      Rs. {goal.currentAmount.toLocaleString()} / Rs. {goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Deadline Target:</span>
                    <span className="text-slate-200 font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {goal.deadline}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Remaining Needed:</span>
                    <span className="text-cyan-400 font-bold font-mono">Rs. {remaining.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Required Monthly Saving:</span>
                    <span className="text-emerald-400 font-bold font-mono">Rs. {requiredMonthly.toLocaleString()} / month</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
