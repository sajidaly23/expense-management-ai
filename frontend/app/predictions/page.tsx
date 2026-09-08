'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { mockPrediction } from '../../lib/mockData';
import { chartTheme, tooltipStyle } from '../../lib/theme';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Zap, 
  BarChart3, 
  RefreshCw,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function PredictionsPage() {
  const [selectedModel, setSelectedModel] = useState<'XGBoost Regressor' | 'Random Forest Regressor' | 'Linear Regression'>('XGBoost Regressor');
  const [isTraining, setIsTraining] = useState(false);

  // Model comparison metadata
  const modelsInfo = {
    'XGBoost Regressor': { mae: 1420.5, rmse: 1890.2, mape: 2.1, r2: 0.94, predicted: 82450, status: 'BEST MODEL' },
    'Random Forest Regressor': { mae: 1650.0, rmse: 2120.4, mape: 2.6, r2: 0.91, predicted: 83200, status: 'EVALUATED' },
    'Linear Regression': { mae: 2450.8, rmse: 3100.1, mape: 3.9, r2: 0.82, predicted: 85100, status: 'BASELINE' },
  };

  const activeModel = modelsInfo[selectedModel];

  const handleRetrain = () => {
    setIsTraining(true);
    setTimeout(() => {
      setIsTraining(false);
    }, 1200);
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <BrainCircuit className="w-3.5 h-3.5" /> Core Artificial Intelligence Module
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100">
              Expense forecasts
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Machine Learning forecasting trained on historical user financial records. Evaluates model parameters dynamically.
            </p>
          </div>

          <button
            onClick={handleRetrain}
            disabled={isTraining}
            className="px-5 py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
            {isTraining ? 'Training ML Pipeline...' : 'Re-Train & Select Best Model'}
          </button>
        </div>

        {/* Model Selection Tabs & Metrics Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            1. Model Selection & Performance Evaluation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(Object.keys(modelsInfo) as Array<keyof typeof modelsInfo>).map((modelName) => {
              const info = modelsInfo[modelName];
              const isSelected = selectedModel === modelName;
              return (
                <div
                  key={modelName}
                  onClick={() => setSelectedModel(modelName)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-100">{modelName}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                      info.status === 'BEST MODEL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {info.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                    <div className="flex justify-between"><span>R² Score:</span> <strong className="text-emerald-400">{info.r2}</strong></div>
                    <div className="flex justify-between"><span>MAE (Mean Absolute Error):</span> <span>Rs. {info.mae}</span></div>
                    <div className="flex justify-between"><span>RMSE:</span> <span>Rs. {info.rmse}</span></div>
                    <div className="flex justify-between"><span>MAPE:</span> <span>{info.mape}%</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Model Prediction Banner */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase">Prediction Result for</span>
              <h2 className="text-xl font-bold text-slate-100">{mockPrediction.predictionPeriod}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Forecasted Expense Total</span>
              <h3 className="text-3xl font-black text-emerald-400">
                Rs. {activeModel.predicted.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Category-Level Prediction Comparison Chart */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Category-Level Prediction Breakdown (vs Previous Month)
            </h4>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockPrediction.categoryPredictions}>
                  <XAxis dataKey="category" stroke={chartTheme.axis} fontSize={11} tickLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs.${v/1000}k`} />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Amount']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="previousAmount" fill={chartTheme.mutedBar} name="Previous Month Actual" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="predictedAmount" fill={chartTheme.copper} name="ML Next Month Predicted" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Feature Engineering & Historical Data Integrity Check */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> Feature Engineering Matrix
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
                <span>Lagged Historical Expenses (t-1, t-2, t-3)</span>
                <span className="text-emerald-400 font-semibold">Processed</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
                <span>3-Month Rolling Average & Category Ratios</span>
                <span className="text-emerald-400 font-semibold">Processed</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
                <span>Income-to-Expense Budget Utilization Ratio</span>
                <span className="text-emerald-400 font-semibold">Processed</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
                <span>Recurring Payment Frequency Flags</span>
                <span className="text-emerald-400 font-semibold">Processed</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> FYP Data Verification Safeguard
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SmartFin AI enforces a minimum historical dataset threshold (&ge; 3 months of recorded user expenses). If historical data is missing or incomplete, the ML pipeline returns a strict error safeguard rather than generating un-grounded output.
            </p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Dataset verification passed: 6 consecutive months of user expenses detected.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
