'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { mockUserProfile } from '../../lib/mockData';
import { UserCheck, Save, ShieldCheck, User } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(mockUserProfile);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <UserCheck className="w-3.5 h-3.5" /> Financial Profile Module
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 mt-1">User Financial Profile</h1>
            <p className="text-slate-400 text-xs">Used by Recommendation Engine and Health Scoring algorithms.</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Occupation</label>
              <input
                type="text"
                value={profile.occupation}
                onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Monthly Income Baseline (Rs.)</label>
              <input
                type="number"
                value={profile.monthlyIncome}
                onChange={(e) => setProfile({ ...profile, monthlyIncome: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Family Size</label>
              <input
                type="number"
                value={profile.familySize}
                onChange={(e) => setProfile({ ...profile, familySize: parseInt(e.target.value) || 1 })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Primary Financial Goal</label>
              <select
                value={profile.financialGoal}
                onChange={(e: any) => setProfile({ ...profile, financialGoal: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
              >
                <option value="Save Money">Save Money</option>
                <option value="Buy a House">Buy a House</option>
                <option value="Buy a Car">Buy a Car</option>
                <option value="Education">Education</option>
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Investment">Investment</option>
                <option value="Travel">Travel</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Risk Preference</label>
              <select
                value={profile.riskPreference}
                onChange={(e: any) => setProfile({ ...profile, riskPreference: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
              >
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {saved ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                ✓ Financial Profile Saved Successfully!
              </span>
            ) : <span />}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" /> Save Financial Profile
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
