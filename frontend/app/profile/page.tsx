'use client';

import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { UserProfile } from '../../types';
import { Save } from 'lucide-react';
import { profileService } from '../../services/profile.service';
import { ApiError } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const GOALS: NonNullable<UserProfile['financialGoal']>[] = [
  'Save Money',
  'Buy a House',
  'Buy a Car',
  'Education',
  'Emergency Fund',
  'Investment',
  'Travel',
  'Other',
];

const emptyForm = {
  name: '',
  occupation: '',
  age: '',
  monthlyIncome: '',
  familySize: '1',
  financialGoal: 'Save Money' as NonNullable<UserProfile['financialGoal']>,
  riskPreference: 'Medium' as NonNullable<UserProfile['riskPreference']>,
};

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState(emptyForm);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);

  const loadProfile = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await profileService.get();
      const profile = res.profile;
      setEmail(profile.email || '');
      setFormData({
        name: profile.name || '',
        occupation: profile.occupation || '',
        age: profile.age != null ? String(profile.age) : '',
        monthlyIncome: profile.monthlyIncome != null ? String(profile.monthlyIncome) : '',
        familySize: String(profile.familySize || 1),
        financialGoal: profile.financialGoal || 'Save Money',
        riskPreference: profile.riskPreference || 'Medium',
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.age) {
      setFormError('Name and age are required.');
      return;
    }
    setFormError('');
    setSaving(true);
    setSaved(false);
    try {
      await profileService.update({
        name: formData.name.trim(),
        occupation: formData.occupation.trim(),
        age: parseInt(formData.age, 10),
        monthlyIncome: parseFloat(formData.monthlyIncome || '0'),
        familySize: parseInt(formData.familySize, 10) || 1,
        financialGoal: formData.financialGoal,
        riskPreference: formData.riskPreference,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Account</p>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-slate-100 mt-1">Financial profile</h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Stored on your account. Used as context for the health score (declared income is a fallback if this month has none).
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
            <span>{error}</span>
            <button type="button" onClick={loadProfile} className="font-medium underline-offset-2 hover:underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading profile…</p>
        ) : (
          <form onSubmit={handleSave} className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5 text-sm">
            {formError && (
              <div className="rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-rose-500">{formError}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Full name</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Occupation</label>
                <input
                  type="text"
                  maxLength={80}
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="Software engineer"
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Age</label>
                <input
                  type="number"
                  required
                  min={16}
                  max={100}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Monthly income baseline (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  placeholder="95000"
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Family size</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.familySize}
                  onChange={(e) => setFormData({ ...formData, familySize: e.target.value })}
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Primary financial goal</label>
                <select
                  value={formData.financialGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, financialGoal: e.target.value as NonNullable<UserProfile['financialGoal']> })
                  }
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100"
                >
                  {GOALS.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Risk preference</label>
                <select
                  value={formData.riskPreference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      riskPreference: e.target.value as NonNullable<UserProfile['riskPreference']>,
                    })
                  }
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {saved ? (
                <span className="text-emerald-400 font-medium text-sm">Profile saved.</span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-medium flex items-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save financial profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
