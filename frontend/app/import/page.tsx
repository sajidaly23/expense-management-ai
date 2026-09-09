'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import AppLayout from '../../components/layout/AppLayout';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { importService, ImportCommitResponse, ImportPreviewResponse } from '../../services/import.service';
import { ApiError } from '../../lib/api';

function formatRs(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString()}`;
}

export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [result, setResult] = useState<ImportCommitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileChange = async (selected: File | null) => {
    reset();
    if (!selected) return;

    setFile(selected);
    setLoading(true);
    try {
      setPreview(await importService.preview(selected));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to read the Excel file.');
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !preview?.ready) return;
    setImporting(true);
    setError('');
    try {
      setResult(await importService.commit(file));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Data import</p>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100 mt-1">Import from Excel</h1>
            <p className="text-slate-400 text-sm mt-1">
              Upload a workbook with <strong className="text-slate-200">Income</strong> and{' '}
              <strong className="text-slate-200">Expenses</strong> sheets. Dashboard, budgets, analytics, and reports
              recalculate automatically after import.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => void importService.downloadTemplate().catch((err) => setError(err instanceof ApiError ? err.message : 'Download failed.'))}
              className="px-4 py-2.5 rounded-md border border-slate-800 hover:bg-slate-950 text-slate-100 font-medium text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Excel template (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => void importService.downloadIncomeCsv().catch((err) => setError(err instanceof ApiError ? err.message : 'Download failed.'))}
              className="px-4 py-2.5 rounded-md border border-slate-800 hover:bg-slate-950 text-slate-100 font-medium text-sm"
            >
              Income CSV
            </button>
            <button
              type="button"
              onClick={() => void importService.downloadExpensesCsv().catch((err) => setError(err instanceof ApiError ? err.message : 'Download failed.'))}
              className="px-4 py-2.5 rounded-md border border-slate-800 hover:bg-slate-950 text-slate-100 font-medium text-sm"
            >
              Expenses CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
            {error}
          </div>
        )}

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-100">Choose your Excel file</h2>
                <p className="text-xs text-slate-400">Supported: .xlsx, .xls, .csv · max 5 MB</p>
              </div>
            </div>
            <label className="px-4 py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-medium text-sm flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              {file ? 'Choose another file' : 'Upload file'}
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                className="hidden"
                onChange={(event) => void handleFileChange(event.target.files?.[0] || null)}
              />
            </label>
          </div>

          {file && (
            <p className="text-sm text-slate-300">
              Selected: <span className="font-medium text-slate-100">{file.name}</span>
            </p>
          )}

          {loading && <p className="text-sm text-slate-400">Reading rows and validating…</p>}

          {preview && !result && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-400">Income rows</p>
                  <p className="text-xl font-semibold text-slate-100">{preview.incomeCount}</p>
                  <p className="text-xs text-emerald-400 mt-1">{formatRs(preview.incomeTotal)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-400">Expense rows</p>
                  <p className="text-xl font-semibold text-slate-100">{preview.expenseCount}</p>
                  <p className="text-xs text-amber-400 mt-1">{formatRs(preview.expenseTotal)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-400">Net from file</p>
                  <p className="text-xl font-semibold text-slate-100">{formatRs(preview.netFromFile)}</p>
                  <p className="text-xs text-slate-500 mt-1">Income − expenses in upload</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-400">Need / Want in file</p>
                  <p className="text-sm font-semibold text-slate-100 mt-1">
                    {formatRs(preview.needsTotal)} / {formatRs(preview.wantsTotal)}
                  </p>
                </div>
              </div>

              {preview.errorCount > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    {preview.errorCount} row{preview.errorCount === 1 ? '' : 's'} need fixing before import
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto text-xs text-amber-100/90">
                    {preview.errors.map((item) => (
                      <p key={`${item.sheet}-${item.row}-${item.message}`}>
                        {item.sheet} row {item.row}: {item.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {(preview.incomes.length > 0 || preview.expenses.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  {preview.incomes.length > 0 && (
                    <div className="rounded-xl border border-slate-800 overflow-hidden">
                      <p className="px-3 py-2 bg-slate-950 text-slate-300 font-semibold">Income preview</p>
                      {preview.incomes.map((row) => (
                        <p key={`income-${row.row}`} className="px-3 py-2 border-t border-slate-800 text-slate-400">
                          {row.date} · {row.source} · {formatRs(row.amount)}
                        </p>
                      ))}
                    </div>
                  )}
                  {preview.expenses.length > 0 && (
                    <div className="rounded-xl border border-slate-800 overflow-hidden">
                      <p className="px-3 py-2 bg-slate-950 text-slate-300 font-semibold">Expense preview</p>
                      {preview.expenses.map((row) => (
                        <p key={`expense-${row.row}`} className="px-3 py-2 border-t border-slate-800 text-slate-400">
                          {row.date} · {row.category} · {row.description} · {formatRs(row.amount)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={!preview.ready || importing}
                onClick={() => void handleImport()}
                className="px-5 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm"
              >
                {importing ? 'Importing…' : `Import ${preview.incomeCount + preview.expenseCount} rows`}
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-semibold">{result.message}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-400">Imported income</p>
                  <p className="text-lg font-semibold text-slate-100">{result.imported.incomeCount} rows</p>
                  <p className="text-xs text-emerald-400">{formatRs(result.imported.incomeTotal)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-400">Imported expenses</p>
                  <p className="text-lg font-semibold text-slate-100">{result.imported.expenseCount} rows</p>
                  <p className="text-xs text-amber-400">{formatRs(result.imported.expenseTotal)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-400">{result.currentMonth.label} totals now</p>
                  <p className="text-sm text-slate-100 mt-1">Income {formatRs(result.currentMonth.income)}</p>
                  <p className="text-sm text-slate-100">Expenses {formatRs(result.currentMonth.expense)}</p>
                  <p className="text-sm text-teal-400">Savings {formatRs(result.currentMonth.savings)} ({result.currentMonth.savingsRate}%)</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard" className="px-4 py-2 rounded-md bg-ink-900 hover:bg-ink-800 text-white text-sm flex items-center gap-2">
                  Open dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/analytics" className="px-4 py-2 rounded-md border border-slate-800 hover:bg-slate-950 text-slate-100 text-sm">
                  View analytics
                </Link>
                <button type="button" onClick={reset} className="px-4 py-2 rounded-md border border-slate-800 hover:bg-slate-950 text-slate-300 text-sm">
                  Import another file
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-400 space-y-2">
          <p className="font-semibold text-slate-200">No Excel app on your Mac?</p>
          <p>
            Use <strong className="text-slate-300">Income CSV</strong> or <strong className="text-slate-300">Expenses CSV</strong> —
            open them in TextEdit, edit the rows, then upload each CSV file separately. You can also open CSV in Google Sheets
            (free) and export as .xlsx if you prefer one workbook.
          </p>
          <p className="font-semibold text-slate-200 pt-2">Template columns</p>
          <p>
            <strong className="text-slate-300">Income sheet:</strong> amount, source, date, incomeType, description,
            recurring
          </p>
          <p>
            <strong className="text-slate-300">Expenses sheet:</strong> amount, description, category, subcategory, date,
            paymentMethod, transactionType, recurring
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
