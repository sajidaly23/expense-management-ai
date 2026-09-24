'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../../components/layout/AppLayout';
import { Camera, Upload, Check, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { uploadReceipt, ParsedReceipt } from '../../../services/receipt.service';
import { expenseService } from '../../../services/expense.service';
import { ApiError } from '../../../lib/api';

export default function ReceiptScanPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Credit Card',
    transactionType: 'NEED',
  });

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setScanning(true);
    setError('');

    try {
      const res = await uploadReceipt(selectedFile);
      const receipt = res.receipt;

      // Extract and sanitize numeric total amount (removing currency symbols/commas)
      const rawTotal = receipt.total;
      const cleanTotal = typeof rawTotal === 'number'
        ? rawTotal
        : parseFloat(String(rawTotal).replace(/[^0-9.]/g, '')) || 0;

      // Sanitize date to YYYY-MM-DD format for <input type="date">
      let cleanDate = new Date().toISOString().slice(0, 10);
      if (receipt.date && /^\d{4}-\d{2}-\d{2}$/.test(receipt.date)) {
        cleanDate = receipt.date;
      } else if (receipt.date && !isNaN(Date.parse(receipt.date))) {
        cleanDate = new Date(receipt.date).toISOString().slice(0, 10);
      }

      const cleanTax = typeof receipt.tax === 'number'
        ? receipt.tax
        : parseFloat(String(receipt.tax || 0).replace(/[^0-9.]/g, '')) || 0;

      const sanitizedReceipt: ParsedReceipt = {
        ...receipt,
        total: cleanTotal,
        tax: cleanTax,
        date: cleanDate,
        items: Array.isArray(receipt.items)
          ? receipt.items.map((it) => ({
              name: String(it.name || 'Purchased Item'),
              price: typeof it.price === 'number' ? it.price : parseFloat(String(it.price || 0).replace(/[^0-9.]/g, '')) || 0,
            }))
          : [],
      };

      setParsed(sanitizedReceipt);
      setForm({
        amount: cleanTotal > 0 ? String(cleanTotal) : '',
        description: receipt.merchant || 'Store Merchant',
        category: receipt.suggestedCategory || 'Food',
        date: cleanDate,
        paymentMethod: 'Credit Card',
        transactionType: 'NEED',
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Receipt parsing failed. Try a clearer image.');
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!form.amount || !form.description) {
      setError('Provide amount and description.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await expenseService.create({
        amount: parseFloat(form.amount),
        description: form.description,
        category: form.category as any,
        date: form.date,
        paymentMethod: form.paymentMethod as any,
        transactionType: form.transactionType as any,
        recurring: false,
      });
      router.push('/expenses');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save scanned expense.');
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/expenses')}
            className="p-2 text.slate-700 text-[#1E293B] hover:text-[#0F172A] rounded-xl hover:bg-[#F1F5F9] transition-colors border border-[#CBD5E1]"
            title="Back to Expenses"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">AI Receipt Scanner</h1>
            <p className="text-sm font-semibold text-[#334155] mt-0.5">
              Upload a physical receipt or photo to automatically extract merchant, date, amount, and category.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {!parsed ? (
          <div className="p-12 rounded-2xl bg-white border-2 border-dashed border-[#CBD5E1] text-center space-y-5 hover:border-emerald-600 transition-all shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <Camera className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">Upload or drop your receipt image</h3>
              <p className="text-xs text-[#475569] font-semibold mt-1">Supports PNG, JPG, JPEG up to 10MB</p>
            </div>
            <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-sm cursor-pointer shadow-md transition-colors">
              <Upload className="w-4 h-4 text-white" />
              <span className="text-white font-bold">Select Receipt Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) void handleFileChange(e.target.files[0]);
                }}
              />
            </label>

            {scanning && (
              <div className="pt-4 text-xs font-bold text-emerald-800 animate-pulse flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Running OCR text detection &amp; merchant inference…</span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Extracted Details Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <span className="text-xs font-black text-[#475569] uppercase tracking-wider">Extracted Details</span>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {Math.round((parsed.confidence || 0.95) * 100)}% Confidence
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#475569] font-semibold">Merchant</span>
                  <span className="font-extrabold text-[#0F172A]">{parsed.merchant}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#475569] font-semibold">Total Amount</span>
                  <span className="font-black text-emerald-700 text-base">Rs. {parsed.total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#475569] font-semibold">Tax</span>
                  <span className="font-bold text-[#1E293B]">Rs. {parsed.tax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#475569] font-semibold">Receipt Date</span>
                  <span className="font-bold text-[#1E293B]">{parsed.date}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#475569] font-semibold">Inferred Category</span>
                  <span className="font-extrabold text-[#0F172A]">{parsed.suggestedCategory}</span>
                </div>
              </div>

              {parsed.items && parsed.items.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-[#475569] mb-2 uppercase tracking-wide">Line Items</p>
                  <div className="space-y-1.5 text-xs bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                    {parsed.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[#1E293B]">
                        <span className="font-semibold">{item.name}</span>
                        <span className="font-extrabold text-[#0F172A]">Rs. {item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Editable Form Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-[#0F172A]">Review &amp; Confirm Transaction</h3>
                <p className="text-xs font-semibold text-[#475569]">Confirm or edit details before saving to your expense ledger.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Description / Merchant</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Total Amount (Rs.)</label>
                  <input
                    type="number"
                    step="any"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-black text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  >
                    {['Food', 'Transport', 'Rent', 'Bills', 'Education', 'Healthcare', 'Shopping', 'Entertainment', 'Travel', 'Utilities', 'Other'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setParsed(null)}
                    className="flex-1 py-3 rounded-xl border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] font-extrabold transition-colors text-sm"
                  >
                    Rescan
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>{saving ? 'Saving...' : 'Confirm & Save'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

