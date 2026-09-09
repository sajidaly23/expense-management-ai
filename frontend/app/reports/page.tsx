'use client';

import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { FileText, Download } from 'lucide-react';
import { reportService, ReportPayload } from '../../services/report.service';
import { ApiError } from '../../lib/api';

function formatRs(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState<'pdf' | 'xls' | ''>('');

  const loadReport = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await reportService.get();
      setReport(result.report);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the statement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  const handleExport = async (kind: 'pdf' | 'xls') => {
    if (!report) return;
    setError('');
    setExporting(kind);
    try {
      if (kind === 'pdf') {
        await reportService.downloadPdf(report.period.key);
      } else {
        await reportService.downloadExcel(report.period.key);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to download the file.');
    } finally {
      setExporting('');
    }
  };

  const year = report?.period.key.slice(0, 4);
  const forecast = report?.prediction
    ? formatRs(report.prediction.predictedAmount)
    : 'Not trained';

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
              <FileText className="w-3.5 h-3.5" /> Automated Report Generator
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100 mt-1">
              Financial Statements & Reports
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Live totals for the signed-in account. Downloads are generated from the same numbers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!report || Boolean(exporting)}
              onClick={() => void handleExport('pdf')}
              className="px-4 py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {exporting === 'pdf' ? 'Preparing PDF…' : 'Download PDF Report'}
            </button>
            <button
              type="button"
              disabled={!report || Boolean(exporting)}
              onClick={() => void handleExport('xls')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {exporting === 'xls' ? 'Preparing Excel…' : 'Export Excel'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
            <span>{error}</span>
            <button type="button" onClick={() => void loadReport()} className="font-medium underline-offset-2 hover:underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading statement…</p>
        ) : !report ? (
          <p className="text-sm text-slate-400">No statement available yet.</p>
        ) : (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-xs text-slate-300">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">SmartFin AI Monthly Statement</h2>
                <p className="text-slate-500">Period: {report.period.label} {year} • Prepared for {report.preparedFor}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                LIVE STATEMENT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">Total Monthly Income</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{formatRs(report.currentMonth.income)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">Total Monthly Expenses</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{formatRs(report.currentMonth.expense)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">Next Month Forecast</span>
                <span className="text-lg font-bold text-purple-400 font-mono">{forecast}</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h4 className="font-bold text-slate-200">Executive Summary & Recommendations</h4>
              <p className="leading-relaxed text-slate-400">{report.executiveSummary}</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
