'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Expense, ExpenseCategory, PaymentMethod, TransactionType } from '../../types';
import { Receipt, Plus, Search, Filter, Trash2, Pencil, Repeat } from 'lucide-react';
import { expenseService } from '../../services/expense.service';
import { ApiError } from '../../lib/api';

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Rent',
  'Bills',
  'Education',
  'Healthcare',
  'Shopping',
  'Entertainment',
  'Travel',
  'Utilities',
  'Other',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Mobile Wallet',
  'Other',
];

const emptyForm = {
  amount: '',
  description: '',
  category: 'Food' as ExpenseCategory,
  subcategory: '',
  date: new Date().toLocaleDateString('en-CA'),
  paymentMethod: 'Credit Card' as PaymentMethod,
  transactionType: 'NEED' as TransactionType,
  recurring: false,
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const loadExpenses = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await expenseService.list();
      setExpenses(res.expenses);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load expense entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, date: new Date().toLocaleDateString('en-CA') });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (item: Expense) => {
    setEditingId(item.id);
    setFormData({
      amount: String(item.amount),
      description: item.description,
      category: item.category,
      subcategory: item.subcategory || '',
      date: item.date,
      paymentMethod: item.paymentMethod,
      transactionType: item.transactionType,
      recurring: item.recurring,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description.trim()) {
      setFormError('Description and amount are required.');
      return;
    }
    setFormError('');
    setSaving(true);
    const payload = {
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      category: formData.category,
      subcategory: formData.subcategory.trim() || undefined,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      transactionType: formData.transactionType,
      recurring: formData.recurring,
    };
    try {
      if (editingId) {
        const res = await expenseService.update(editingId, payload);
        setExpenses((prev) => prev.map((item) => (item.id === editingId ? res.expense : item)));
      } else {
        const res = await expenseService.create(payload);
        setExpenses((prev) => [res.expense, ...prev]);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData(emptyForm);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Unable to save expense entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await expenseService.remove(id);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to delete expense entry.');
    }
  };

  const filtered = expenses.filter((item) => {
    const haystack = `${item.description} ${item.subcategory || ''} ${item.category}`.toLowerCase();
    const matchSearch = haystack.includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchType = selectedType === 'ALL' || item.transactionType === selectedType;
    return matchSearch && matchCategory && matchType;
  });

  const totalSpent = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Accounts</p>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100 mt-1">Expenses</h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Record spending with category, Need vs Want, and payment method. These entries are saved to your account.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add expense
          </button>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadExpenses}
              className="shrink-0 font-medium text-rose-500 underline-offset-2 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description or category"
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-ink-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 text-sm text-slate-100 border border-slate-800 rounded-md px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 text-sm text-slate-100 border border-slate-800 rounded-md px-3 py-2 focus:outline-none"
            >
              <option value="ALL">Need & Want</option>
              <option value="NEED">NEED</option>
              <option value="WANT">WANT</option>
            </select>

            <div className="text-sm text-slate-400">
              Total: <strong className="text-slate-100">Rs. {totalSpent.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-400">Loading expenses…</p>
          ) : expenses.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Receipt className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-100">No expense entries yet</p>
              <p className="text-sm text-slate-400">Add your first purchase to start the spending ledger.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-medium text-slate-100">No matching entries</p>
              <p className="text-sm text-slate-400">Try a different search, category, or Need/Want filter.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Need / Want</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5">
                      <p className="font-medium text-slate-100">{item.description}</p>
                      {item.subcategory && <p className="text-xs text-slate-500">{item.subcategory}</p>}
                      {item.recurring && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600">
                          <Repeat className="w-3 h-3" /> Recurring
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          item.transactionType === 'NEED'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {item.transactionType}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">{item.paymentMethod}</td>
                    <td className="py-3.5 text-slate-400">{item.date}</td>
                    <td className="py-3.5 text-right font-semibold text-slate-100">
                      Rs. {item.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal &&
          createPortal(
            <div className="fixed inset-0 z-[80] bg-slate-950/70 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lift max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-display font-semibold text-slate-100">
                  {editingId ? 'Edit expense' : 'Add expense'}
                </h3>
                <form onSubmit={handleSave} className="space-y-4 text-sm">
                  {formError && (
                    <div className="rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-rose-500">
                      {formError}
                    </div>
                  )}
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-medium">Description</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={240}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Supermarket groceries"
                      className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-ink-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-medium">Amount (Rs.)</label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="14500"
                        className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-ink-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-medium">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                        className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-medium">Subcategory</label>
                    <input
                      type="text"
                      maxLength={80}
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="Optional, e.g. Groceries"
                      className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-medium">Need / Want</label>
                      <select
                        value={formData.transactionType}
                        onChange={(e) =>
                          setFormData({ ...formData, transactionType: e.target.value as TransactionType })
                        }
                        className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                      >
                        <option value="NEED">NEED (Essential)</option>
                        <option value="WANT">WANT (Discretionary)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-medium">Payment method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                        className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-medium">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-ink-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="expense-recurring"
                      checked={formData.recurring}
                      onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                      className="rounded border-slate-800"
                    />
                    <label htmlFor="expense-recurring" className="text-slate-300">
                      Recurring monthly expense
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-md border border-slate-800 text-slate-300 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 rounded-md bg-ink-900 text-white font-medium disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : editingId ? 'Update entry' : 'Save entry'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}
      </div>
    </AppLayout>
  );
}
