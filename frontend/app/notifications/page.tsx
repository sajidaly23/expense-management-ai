'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { mockNotifications } from '../../lib/mockData';
import { NotificationItem } from '../../types';
import { Bell, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>(mockNotifications);

  const markAllRead = () => {
    setItems(prev => prev.map(i => ({ ...i, read: true })));
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <Bell className="w-3.5 h-3.5" /> Notification Center
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 mt-1">System Alerts & Notifications</h1>
          </div>

          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Mark All Read
          </button>
        </div>

        <div className="space-y-3">
          {items.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 rounded-2xl border transition-colors ${
                n.read ? 'bg-slate-900/60 border-slate-800/80 text-slate-400' : 'bg-slate-900 border-emerald-500/30 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  {n.type === 'budget' || n.type === 'anomaly' ? <AlertCircle className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {n.title}
                </span>
                <span className="text-xs text-slate-500">{n.date}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
