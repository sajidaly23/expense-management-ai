'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { mockIncomes } from '../../lib/mockData';
import { Income, IncomeType } from '../../types';
import { Wallet, Plus, Search, Filter, Trash2, Edit2, CheckCircle2, Repeat } from 'lucide-react';

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>(mockIncomes);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    incomeType: 'Salary' as IncomeType,
    description: '',
    recurring: false
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.source) return;
    const newInc: Income = {
      id: `inc_${Date.now()}`,
      userId: 'usr_101',
      amount: parseFloat(formData.amount),
      source: formData.source,
      date: formData.date,
      incomeType: formData.incomeType,
      description: formData.description,
      recurring: formData.recurring
    };
    setIncomes([newInc, ...incomes]);
    setShowModal(false);
    setFormData({ amount: '', source: '', date: new Date().toISOString().split('T')[0], incomeType: 'Salary', description: '', recurring: false });
  };

  const handleDelete = (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  const filtered = incomes.filter(i => {
    const matchSearch = i.source.toLowerCase().includes(search.toLowerCase()) || (i.description && i.description.toLowerCase().includes(search.toLowerCase()));
    const matchType = selectedType === 'ALL' || i.incomeType === selectedType;
    return matchSearch && matchType;
  });

  const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <Wallet className="w-3.5 h-3.5" /> Income Operations
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
              Income Management
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Record and structure all sources of monthly and recurring earnings.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Income Entry
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search income source or description..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
                <option value="Business">Business</option>
                <option value="Investment">Investment</option>
                <option value="Gift">Gift</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Filtered Total: <strong className="text-emerald-400 font-bold text-sm">Rs. {total.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Source & Description</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Recurring</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5">
                    <p className="font-bold text-slate-100">{item.source}</p>
                    {item.description && <p className="text-[11px] text-slate-500">{item.description}</p>}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {item.incomeType}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400">{item.date}</td>
                  <td className="py-3.5">
                    {item.recurring ? (
                      <span className="text-teal-400 font-semibold flex items-center gap-1">
                        <Repeat className="w-3 h-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-slate-500">One-time</span>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-black text-slate-100 font-mono">
                    Rs. {item.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for Adding Income */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100">Add New Income Source</h3>
              <form onSubmit={handleAdd} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Source Name</label>
                  <input
                    type="text"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g. Software Salary"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Amount (Rs.)</label>
                    <input
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="85000"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Income Type</label>
                    <select
                      value={formData.incomeType}
                      onChange={(e: any) => setFormData({ ...formData, incomeType: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                    >
                      <option value="Salary">Salary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Business">Business</option>
                      <option value="Investment">Investment</option>
                      <option value="Gift">Gift</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional notes"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                  />
                  <label htmlFor="recurring" className="text-slate-300">Recurring Monthly Payment</label>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
