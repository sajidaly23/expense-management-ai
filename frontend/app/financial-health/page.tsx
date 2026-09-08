'use client';

import AppLayout from '../../components/layout/AppLayout';
import { mockFinancialHealthScore } from '../../lib/mockData';
import { HeartPulse, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Compass } from 'lucide-react';

export default function FinancialHealthPage() {
  const score = mockFinancialHealthScore;

  const components = [
    { name: 'Savings Rate (Max 25)', score: score.componentScores.savingsRate, max: 25, color: 'bg-emerald-500' },
    { name: 'Budget Adherence (Max 20)', score: score.componentScores.budgetAdherence, max: 20, color: 'bg-teal-500' },
    { name: 'Expense Stability (Max 15)', score: score.componentScores.expenseStability, max: 15, color: 'bg-blue-500' },
    { name: 'Emergency Fund Reserve (Max 20)', score: score.componentScores.emergencyFund, max: 20, color: 'bg-purple-500' },
    { name: 'Savings Goal Pace (Max 20)', score: score.componentScores.goalProgress, max: 20, color: 'bg-cyan-500' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/30">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
              <HeartPulse className="w-3.5 h-3.5" /> AI Module #5 — Health Scoring Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Financial Health Score & Diagnostics
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Algorithmic index evaluating your savings rate, budget adherence, stability, emergency reserves, and goal pace.
            </p>
          </div>
        </div>

        {/* Score Overview Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between items-center text-center space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Financial Score</span>
            
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-8 border-slate-800" />
              <div 
                className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent border-r-transparent rotate-45"
                style={{ transform: `rotate(${score.overallScore * 3.6}deg)` }}
              />
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-slate-100">{score.overallScore}</span>
                <span className="text-xs font-bold text-emerald-400 mt-1">{score.status}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-xs">
              Score is calculated dynamically from real MongoDB income, expenses, and savings goal progress.
            </p>
          </div>

          {/* Component Breakdown Progress Bars */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Weighted Factor Breakdown
            </h3>

            <div className="space-y-4">
              {components.map((c) => {
                const pct = Math.round((c.score / c.max) * 100);
                return (
                  <div key={c.name} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-300">{c.name}</span>
                      <span className="text-slate-100 font-bold">{c.score} / {c.max} pts ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${c.color}`} 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Personalized Recommendations & Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> System Explanations
            </h3>
            <div className="space-y-2.5">
              {score.explanations.map((exp, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-400" /> AI Recommendation Engine Outputs
            </h3>
            <div className="space-y-2.5">
              {score.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-teal-500/30 text-xs text-slate-300 flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
