'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Bell, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getInitials, useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notification.service';
import { NotificationItem } from '../../types';

function formatWhen(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { user } = useAuth();
  const unreadCount = notifications.filter((item) => !item.read).length;

  const loadNotifications = async () => {
    try {
      const result = await notificationService.list();
      setNotifications(result.notifications);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    void loadNotifications();
    const refresh = () => void loadNotifications();
    window.addEventListener('smartfin:notifications-changed', refresh);
    return () => window.removeEventListener('smartfin:notifications-changed', refresh);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions, budgets, reports"
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-ink-400 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-800 text-[11px] font-medium text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Systems operational
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) void loadNotifications();
            }}
            className="relative p-2 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-ink-900 text-white text-[10px] font-semibold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-lift z-50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-sm font-semibold text-slate-100">Notifications</h4>
                <Link href="/notifications" className="text-[12px] text-emerald-500 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No budget overruns or unresolved anomalies.</p>
                ) : (
                  notifications.slice(0, 8).map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg text-sm space-y-1 border ${
                        item.read ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-100 flex items-center gap-1.5">
                          {item.type === 'budget' || item.type === 'anomaly' ? (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {item.title}
                        </span>
                        <span className="text-[11px] text-slate-500 shrink-0">{formatWhen(item.date)}</span>
                      </div>
                      <p className="text-[12px] text-slate-400 leading-relaxed">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link href="/profile" className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-md hover:bg-slate-800 transition-colors">
          <div className="w-7 h-7 rounded-full bg-ink-900 text-white flex items-center justify-center font-semibold text-xs">
            {getInitials(user?.name)}
          </div>
          <span className="text-sm font-medium text-slate-100 hidden sm:inline-block">{user?.name || 'Account'}</span>
        </Link>
      </div>
    </header>
  );
}
