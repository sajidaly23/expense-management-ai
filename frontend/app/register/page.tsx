'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6 shadow-card">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-md bg-ink-900 text-white flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold text-slate-100">Create an account</h1>
            <p className="text-sm text-slate-400 mt-1">Start tracking income, expenses, and forecasts</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-ink-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.mercer@university.edu"
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-ink-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-ink-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-medium flex items-center justify-center gap-2 transition-colors"
          >
            Create account <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 pt-2 border-t border-slate-800">
          Already registered? <Link href="/login" className="text-ink-900 font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
