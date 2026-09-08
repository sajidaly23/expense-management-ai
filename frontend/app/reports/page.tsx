'use client';

import AppLayout from '../../components/layout/AppLayout';
import { mockUser, mockFinancialHealthScore, mockPrediction } from '../../lib/mockData';
import { FileText, Download, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const handleExportPDF = () => {
    alert('Generating PDF Financial Report... Download ready!');
  };

  const handleExportExcel = () => {
    alert('Exporting Excel Workbook (.xlsx)... Download ready!');
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
              <FileText className="w-3.5 h-3.5" /> Automated Report Generator
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
              Financial Statements & Reports
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Generates executive monthly and yearly PDF/Excel financial reports with ML forecasts included.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
            >
              <Download className="w-4 h-4" /> Download PDF Report
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Download className="w-4 h-4" /> Export Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* Report Preview Document Card */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-xs text-slate-300">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">SmartFin AI Monthly Statement</h2>
              <p className="text-slate-500">Period: September 2026 • Prepared for {mockUser.name}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              VERIFIED STATEMENT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block mb-1">Total Monthly Income</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">Rs. 98,500</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block mb-1">Total Monthly Expenses</span>
              <span className="text-lg font-bold text-amber-400 font-mono">Rs. 78,900</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block mb-1">Next Month Forecast</span>
              <span className="text-lg font-bold text-purple-400 font-mono">Rs. {mockPrediction.predictedAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <h4 className="font-bold text-slate-200">Executive Summary & Recommendations</h4>
            <p className="leading-relaxed text-slate-400">
              User maintains a healthy savings rate of 21.5% with strong goal progress on House Down Payment. Discretionary shopping spending reached 154% of limit and requires capping for October 2026.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
