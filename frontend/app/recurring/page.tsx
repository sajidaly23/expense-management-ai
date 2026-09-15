'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '../../components/layout/AppLayout';
import { recurringService, RecurringTemplate } from '../../services/recurring.service';
import { ApiError } from '../../lib/api';
import { RefreshCw, Wallet, Receipt, Plus, CheckCircle2 } from 'lucide-react';

const currentMonth = () => new Date().toISOString().slice(0, 7);

function TemplateRow({ item }: { item: RecurringTemplate }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-lg bg-slate-950/60 border border-slate-800">
      <div className="min-w-0">
        <p className="font-medium text-slate-100 truncate">{item.label}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.kind === 'income' ? item.incomeType : item.category}
          {item.transactionType ? ` · ${item.transactionType}` : ''} · Last: {item.lastDate}
        </p>
      </div>
      <span className="text-sm font-semibold text-slate-100 shrink-0">Rs. {item.amount.toLocaleString()}</span>
    </div>
  );
}

export default function RecurringPage() {
  const [income, setIncome] = useState<RecurringTemplate[]>([]);
  const [expense, setExpense] = useState<RecurringTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [processResult, setProcessResult] = useState<string | null>(null);

  const loadTemplates = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await recurringService.list();
      setIncome(res.income);
      setExpense(res.expense);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load recurring templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleProcess = async () => {
    setProcessing(true);
    setError('');
    setProcessResult(null);
    try {
      const res = await recurringService.process(currentMonth());
      const { created, skipped } = res.result;
      const total = created.income + created.expense;
      if (total === 0) {
        setProcessResult(`No new entries needed for ${res.result.month}. ${skipped.income + skipped.expense} already posted.`);
      } else {
        setProcessResult(
          `Created ${created.income} income and ${created.expense} expense entries for ${res.result.month}.`
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to process recurring entries.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <p className="typo-overline text-slate-400">Planning</p>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100 mt-1">
              Bills &amp; recurring
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Mark income or expenses as recurring when adding them. Process monthly to auto-post entries.
            </p>
          </div>
          <button
            type="button"
            onClick={handleProcess}
            disabled={processing}
            className="px-5 py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
            {processing ? 'Processing…' : 'Process this month'}
          </button>
        </div>

        {error && (
          <div className="rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">{error}</div>
        )}

        {processResult && (
          <div className="flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{processResult}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/income"
            className="px-4 py-2 rounded-md border border-slate-800 hover:bg-slate-950 text-slate-200 text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add recurring income
          </Link>
          <Link
            href="/expenses"
            className="px-4 py-2 rounded-md border border-slate-800 hover:bg-slate-950 text-slate-200 text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add recurring expense
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading recurring templates…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" /> Recurring income ({income.length})
              </h3>
              {income.length === 0 ? (
                <p className="text-sm text-slate-400">No recurring income yet. Add salary or other regular earnings with the recurring flag.</p>
              ) : (
                <div className="space-y-2">
                  {income.map((item) => (
                    <TemplateRow key={item.fingerprint} item={item} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" /> Recurring expenses ({expense.length})
              </h3>
              {expense.length === 0 ? (
                <p className="text-sm text-slate-400">No recurring expenses yet. Mark rent, subscriptions, and bills as recurring.</p>
              ) : (
                <div className="space-y-2">
                  {expense.map((item) => (
                    <TemplateRow key={item.fingerprint} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-400">
          <p className="font-medium text-slate-200 mb-1">How it works</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>When creating income or expenses, enable the recurring option.</li>
            <li>Click &quot;Process this month&quot; to auto-create entries that are not yet posted.</li>
            <li>The system also runs a daily check on the server for all users.</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
