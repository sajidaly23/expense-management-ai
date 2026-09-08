'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BrainCircuit, 
  AlertTriangle, 
  HeartPulse, 
  Wallet, 
  Receipt, 
  PiggyBank, 
  Target, 
  Bot, 
  FileText, 
  UserCheck, 
  ShieldCheck,
  ChevronRight,
  LogOut,
  Bell
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics Engine', href: '/analytics', icon: TrendingUp },
    { name: 'ML Predictions', href: '/predictions', icon: BrainCircuit, badge: 'AI Core' },
    { name: 'Anomaly Detection', href: '/anomalies', icon: AlertTriangle, badge: 'ML' },
    { name: 'Financial Health', href: '/financial-health', icon: HeartPulse },
  ];

  const managementNav = [
    { name: 'Income Tracker', href: '/income', icon: Wallet },
    { name: 'Expense Tracker', href: '/expenses', icon: Receipt },
    { name: 'Budget Management', href: '/budgets', icon: PiggyBank },
    { name: 'Savings Goals', href: '/savings-goals', icon: Target },
  ];

  const aiNav = [
    { name: 'AI Financial Assistant', href: '/ai-assistant', icon: Bot, badge: 'Local LLM' },
    { name: 'Financial Reports', href: '/reports', icon: FileText },
    { name: 'Profile & Goals', href: '/profile', icon: UserCheck },
    { name: 'Admin Suite', href: '/admin', icon: ShieldCheck, badge: 'Admin' },
  ];

  const renderNavGroup = (title: string, items: typeof mainNav) => (
    <div className="space-y-1 py-2">
      <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        {title}
      </p>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                item.badge === 'AI Core' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : item.badge === 'Admin'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-teal-500/10 text-teal-400 border-teal-500/30'
              }`}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Logo Header */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 group">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-100 tracking-tight">SmartFin</span>
                <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-emerald-500 text-slate-950">AI</span>
              </div>
              <p className="text-[10px] text-slate-400">ML Financial System</p>
            </div>
          </Link>

          <hr className="border-slate-800" />

          {/* Navigation Items */}
          <nav className="space-y-3">
            {renderNavGroup('AI Core & Analytics', mainNav)}
            {renderNavGroup('Financial Operations', managementNav)}
            {renderNavGroup('Intelligent Services', aiNav)}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                AM
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200">Alex Mercer</p>
                <p className="text-[10px] text-slate-500">USER • Student / SE</p>
              </div>
            </div>
            <Link href="/login" className="p-2 text-slate-500 hover:text-rose-400 transition-colors" title="Log Out">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
