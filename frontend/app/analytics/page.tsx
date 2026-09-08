'use client';

import AppLayout from '../../components/layout/AppLayout';
import { monthlyTrendsData, mockExpenses } from '../../lib/mockData';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const categoryTotals: Record<string, number> = {};
  mockExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const categoryBarData = Object.keys(categoryTotals).map(cat => ({
    category: cat,
    amount: categoryTotals[cat]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#f43f5e'];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
              <Activity className="w-3.5 h-3.5" /> Analytics Engine Module
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
              Financial Analytics & Behavior Trends
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Computes total savings rate, monthly expense variance, and category-level distributions.
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Spending Bar Chart */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" /> Category Expenditure Distribution
            </h3>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs.${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Savings Trend */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" /> Historical Savings & Growth
            </h3>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendsData}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs.${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Savings']}
                  />
                  <Bar dataKey="savings" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
