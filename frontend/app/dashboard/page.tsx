'use client';

import AppLayout from '../../components/layout/AppLayout';
import { 
  mockIncomes, 
  mockExpenses, 
  mockBudgets, 
  mockPrediction, 
  mockAnomalies, 
  mockFinancialHealthScore, 
  monthlyTrendsData 
} from '../../lib/mockData';
import { 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  ArrowUpRight, 
  HeartPulse, 
  Plus,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import Link from 'next/link';
import { chartTheme, tooltipStyle } from '../../lib/theme';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const totalIncome = mockIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = mockExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSavings = totalIncome - totalExpense;
  const savingsRate = ((totalSavings / totalIncome) * 100).toFixed(1);

  const needsTotal = mockExpenses.filter(e => e.transactionType === 'NEED').reduce((acc, curr) => acc + curr.amount, 0);
  const wantsTotal = mockExpenses.filter(e => e.transactionType === 'WANT').reduce((acc, curr) => acc + curr.amount, 0);

  const pieData = [
    { name: 'Needs', value: needsTotal, color: chartTheme.sage },
    { name: 'Wants', value: wantsTotal, color: chartTheme.copper }
  ];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Overview</p>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100">
              Welcome, {user?.name || 'there'}
            </h1>
            <p className="text-slate-400 text-sm">
              Health score <strong className="text-slate-100 font-semibold">{mockFinancialHealthScore.overallScore}/100 ({mockFinancialHealthScore.status})</strong>. Next-month expense forecast is ready.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/income"
              className="px-4 py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add income
            </Link>
            <Link
              href="/expenses"
              className="px-4 py-2.5 rounded-md border border-slate-800 hover:bg-slate-950 text-slate-100 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add expense
            </Link>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Income */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Monthly Income</span>
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-display font-semibold text-slate-100">Rs. {totalIncome.toLocaleString()}</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12.5% from last month
              </p>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Monthly Expenses</span>
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-display font-semibold text-slate-100">Rs. {totalExpense.toLocaleString()}</h3>
              <p className="text-[11px] text-amber-400 flex items-center gap-1 font-medium mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Need vs Want: {((needsTotal/totalExpense)*100).toFixed(0)}% / {((wantsTotal/totalExpense)*100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Net Savings */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Net Monthly Savings</span>
              <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
                <PiggyBank className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-display font-semibold text-slate-100">Rs. {totalSavings.toLocaleString()}</h3>
              <p className="text-[11px] text-teal-400 font-medium mt-1">
                Savings Rate: <strong>{savingsRate}%</strong> (Target: &ge;20%)
              </p>
            </div>
          </div>

          {/* Financial Health Score */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Financial Health Score</span>
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
                <HeartPulse className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-display font-semibold text-slate-100">{mockFinancialHealthScore.overallScore}</h3>
                <span className="text-xs text-slate-400">/ 100 ({mockFinancialHealthScore.status})</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-ink-900 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${mockFinancialHealthScore.overallScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main ML Prediction & Trend Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Area */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Financial Cashflow & Forecast
                </h3>
                <p className="text-xs text-slate-400">Historical Income, Expenses & ML Predicted Next Month</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Model: {mockPrediction.modelUsed}</span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendsData}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTheme.sage} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={chartTheme.sage} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTheme.copper} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={chartTheme.copper} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke={chartTheme.axis} fontSize={11} tickLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs.${v/1000}k`} />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Amount']}
                  />
                  <Area type="monotone" dataKey="income" stroke={chartTheme.sage} strokeWidth={3} fillOpacity={1} fill="url(#incomeGrad)" name="Income" />
                  <Area type="monotone" dataKey="expense" stroke={chartTheme.copper} strokeWidth={3} fillOpacity={1} fill="url(#expenseGrad)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Expense Prediction Feature Spotlight */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">
                  Forecast
                </span>
                <span className="text-[11px] text-slate-400">R² 0.94</span>
              </div>

              <div>
                <p className="text-xs text-slate-400">Predicted expense · {mockPrediction.predictionPeriod}</p>
                <h2 className="text-3xl font-display font-semibold text-slate-100 mt-1">
                  Rs. {mockPrediction.predictedAmount.toLocaleString()}
                </h2>
                <p className="text-xs text-amber-500 font-medium mt-1">
                  +Rs. {mockPrediction.changeAmount.toLocaleString()} ({mockPrediction.changePercentage}%) vs last month
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Selected model</span>
                  <span className="text-slate-100 font-medium">{mockPrediction.modelUsed}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>MAE</span>
                  <span>Rs. {mockPrediction.modelMetrics.mae}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>RMSE</span>
                  <span>Rs. {mockPrediction.modelMetrics.rmse}</span>
                </div>
              </div>
            </div>

            <Link
              href="/predictions"
              className="w-full py-2.5 rounded-md border border-slate-800 hover:bg-slate-950 text-slate-100 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              Model comparison <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Anomaly Alerts & Budget Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anomaly Detection Alerts Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" /> Isolation Forest Anomaly Alerts
              </h3>
              <Link href="/anomalies" className="text-xs text-emerald-400 hover:underline">
                View All Log ({mockAnomalies.length})
              </Link>
            </div>

            <div className="space-y-3">
              {mockAnomalies.map((anom) => (
                <div key={anom.id} className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{anom.expenseDescription}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      anom.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {anom.severity} ANOMALY
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{anom.reason}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Category: {anom.category}</span>
                    <span className="font-mono text-rose-400 font-bold">Rs. {anom.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Need vs Want & Budget Utilization */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-teal-400" /> Need vs Want Spending Breakdown
              </h3>
              <Link href="/budgets" className="text-xs text-emerald-400 hover:underline">
                Manage Budgets
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              <div className="w-40 h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-500">Total Spent</span>
                  <span className="text-xs font-bold text-slate-200">Rs. {(needsTotal+wantsTotal).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex-1 space-y-3 w-full">
                {mockBudgets.filter(b => b.category).slice(0, 3).map((b) => {
                  const util = Math.round((b.spent / b.amount) * 100);
                  return (
                    <div key={b.id} className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-300">{b.category} Budget</span>
                        <span className={util >= 100 ? 'text-rose-400 font-bold' : util >= 80 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {util}% ({b.spent.toLocaleString()} / {b.amount.toLocaleString()})
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            util >= 100 ? 'bg-rose-500' : util >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(util, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
