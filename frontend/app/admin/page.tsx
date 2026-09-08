'use client';

import AppLayout from '../../components/layout/AppLayout';
import { mockAuditLogs } from '../../lib/mockData';
import { ShieldCheck, Users, Activity, Layers, Database, Lock } from 'lucide-react';

export default function AdminPage() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Administration</p>
            <h1 className="text-2xl font-display font-semibold text-slate-100 mt-1">Audit portal</h1>
          </div>
        </div>

        {/* Admin KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Total Registered Users</span>
            <h3 className="text-2xl font-black text-slate-100">142 Users</h3>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Active Financial Transactions</span>
            <h3 className="text-2xl font-black text-emerald-400">4,280 Records</h3>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">ML Predictions Executed</span>
            <h3 className="text-2xl font-black text-purple-400">894 Forecasting Runs</h3>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Detected Anomalies Flagged</span>
            <h3 className="text-2xl font-black text-amber-400">38 Instances</h3>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" /> System Audit Logs
          </h3>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-2">User Name</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Module</th>
                <th className="pb-2">IP Address</th>
                <th className="pb-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {mockAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-100">{log.userName}</td>
                  <td className="py-3 font-mono text-purple-400 font-bold">{log.action}</td>
                  <td className="py-3 text-slate-400">{log.module}</td>
                  <td className="py-3 text-slate-400">{log.ipAddress}</td>
                  <td className="py-3 text-right text-slate-500">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
