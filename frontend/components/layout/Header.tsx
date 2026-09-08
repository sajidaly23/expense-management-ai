'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Bell, Search, Sparkles, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { mockNotifications } from '../../lib/mockData';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions, budgets, insights..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* ML Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ML Engine Active</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" /> System Notifications
                </h4>
                <Link href="/notifications" className="text-[11px] text-emerald-400 hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {mockNotifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-xl text-xs space-y-1 border transition-colors ${
                      n.read ? 'bg-slate-950/40 border-slate-800/60 text-slate-400' : 'bg-slate-950 border-emerald-500/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        {n.type === 'budget' || n.type === 'anomaly' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-500">{n.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Chip */}
        <Link href="/profile" className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl hover:bg-slate-800 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-xs text-slate-950">
            AM
          </div>
          <span className="text-xs font-medium text-slate-200 hidden sm:inline-block">Alex Mercer</span>
        </Link>
      </div>
    </header>
  );
}
