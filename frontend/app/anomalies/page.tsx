'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { mockAnomalies } from '../../lib/mockData';
import { Anomaly } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Sparkles, Filter } from 'lucide-react';

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(mockAnomalies);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const handleUpdateStatus = (id: string, status: 'VERIFIED' | 'DISMISSED') => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const filtered = filterSeverity === 'ALL' ? anomalies : anomalies.filter(a => a.severity === filterSeverity);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
              <ShieldAlert className="w-3.5 h-3.5" /> AI Module #2 — Anomaly Detection
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Unusual Spending & Anomaly Detection
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Isolation Forest machine learning model scans incoming transactions to highlight unexpected spending spikes.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={filterSeverity}
              onChange={(e: any) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none pr-3 py-1 font-medium"
            >
              <option value="ALL" className="bg-slate-900">All Severities</option>
              <option value="HIGH" className="bg-slate-900">High Severity</option>
              <option value="MEDIUM" className="bg-slate-900">Medium Severity</option>
              <option value="LOW" className="bg-slate-900">Low Severity</option>
            </select>
          </div>
        </div>

        {/* Anomaly Log Grid */}
        <div className="space-y-4">
          {filtered.map((anom) => (
            <div key={anom.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${
                    anom.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-100">{anom.expenseDescription}</h3>
                    <p className="text-xs text-slate-400">Category: <strong className="text-slate-200">{anom.category}</strong> • Logged: {anom.detectedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-rose-400 font-mono">Rs. {anom.amount.toLocaleString()}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    anom.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {anom.severity}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <strong className="text-amber-400">Isolation Forest ML Diagnosis:</strong> {anom.reason}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Baseline Average: <strong className="text-slate-200">Rs. {anom.normalAverage.toLocaleString()}</strong></span>
                    <span>Anomaly Score: <strong className="text-rose-400 font-mono">{anom.anomalyScore}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {anom.status === 'UNRESOLVED' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(anom.id, 'VERIFIED')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Expected / Verified
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(anom.id, 'DISMISSED')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Dismiss Alert
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-slate-950 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {anom.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
