'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { mockExpenses } from '../../lib/mockData';
import { Expense, ExpenseCategory, PaymentMethod, TransactionType } from '../../types';
import { Receipt, Plus, Search, Filter, Trash2, Tag, CreditCard, AlertCircle } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food' as ExpenseCategory,
    subcategory: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card' as PaymentMethod,
    transactionType: 'NEED' as TransactionType,
    recurring: false
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      userId: 'usr_101',
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      subcategory: formData.subcategory,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      transactionType: formData.transactionType,
      recurring: formData.recurring
    };
    setExpenses([newExp, ...expenses]);
    setShowModal(false);
    setFormData({
      amount: '',
      description: '',
      category: 'Food',
      subcategory: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      transactionType: 'NEED',
      recurring: false
    });
  };

  const handleDelete = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const filtered = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchType = selectedType === 'ALL' || e.transactionType === selectedType;
    return matchSearch && matchCategory && matchType;
  });

  const totalSpent = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
              <Receipt className="w-3.5 h-3.5" /> Primary ML Input Module
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
              Expense Management & Tracking
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Record daily expenses with Need vs Want tags. Feeds historical datasets into the Python ML prediction service.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Expense Item
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses by category or note..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Rent">Rent</option>
                <option value="Bills">Bills</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Travel">Travel</option>
                <option value="Utilities">Utilities</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="NEED">NEED</option>
                <option value="WANT">WANT</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Filtered Total: <strong className="text-amber-400 font-bold text-sm">Rs. {totalSpent.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Expense Table */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Need / Want</th>
                <th className="pb-3">Payment Method</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5">
                    <p className="font-bold text-slate-100">{item.description}</p>
                    {item.subcategory && <p className="text-[11px] text-slate-500">{item.subcategory}</p>}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.transactionType === 'NEED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.transactionType}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400">{item.paymentMethod}</td>
                  <td className="py-3.5 text-slate-400">{item.date}</td>
                  <td className="py-3.5 text-right font-black text-rose-400 font-mono">
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

        {/* Modal for Adding Expense */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100">Add New Expense Item</h3>
              <form onSubmit={handleAdd} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Expense Description</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Supermarket Groceries"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
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
                      placeholder="14500"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                    >
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Rent">Rent</option>
                      <option value="Bills">Bills</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Travel">Travel</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Type (Need vs Want)</label>
                    <select
                      value={formData.transactionType}
                      onChange={(e: any) => setFormData({ ...formData, transactionType: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                    >
                      <option value="NEED">NEED (Essential)</option>
                      <option value="WANT">WANT (Discretionary)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e: any) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Wallet">Mobile Wallet</option>
                      <option value="Cash">Cash</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
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
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                  >
                    Save & Trigger AI Scan
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
