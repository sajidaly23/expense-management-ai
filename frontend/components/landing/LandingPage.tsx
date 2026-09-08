'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  HeartPulse, 
  PiggyBank, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Menu, 
  X, 
  Receipt, 
  Target, 
  Bot
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Visual data for Hero & Prediction Showcase preview
  const heroCashflowData = [
    { month: 'May', income: 85000, expense: 65000 },
    { month: 'Jun', income: 88000, expense: 68000 },
    { month: 'Jul', income: 90000, expense: 72000 },
    { month: 'Aug', income: 97000, expense: 75000 },
    { month: 'Sep', income: 98500, expense: 78900 },
    { month: 'Oct (Predicted)', income: 98500, expense: 82450 },
  ];

  const predictionShowcaseData = [
    { category: 'Food', actual: 14500, predicted: 16200 },
    { category: 'Rent', actual: 22000, predicted: 22000 },
    { category: 'Shopping', actual: 18500, predicted: 14000 },
    { category: 'Transport', actual: 6200, predicted: 7100 },
    { category: 'Utilities', actual: 4500, predicted: 4800 },
    { category: 'Entertainment', actual: 8000, predicted: 8500 },
  ];

  const features = [
    {
      icon: BrainCircuit,
      title: 'AI Expense Prediction',
      description: 'Predict your next month\'s expenses using machine learning models trained on your historical spending patterns.',
      badge: 'ML Core'
    },
    {
      icon: Sparkles,
      title: 'Smart Insights',
      description: 'Turn your financial data into clear, actionable insights and tailored category analysis automatically.',
      badge: 'Analytics'
    },
    {
      icon: AlertTriangle,
      title: 'Anomaly Detection',
      description: 'Identify unusual spending patterns and unexpected transactions instantly using Isolation Forest algorithms.',
      badge: 'Isolation Forest'
    },
    {
      icon: HeartPulse,
      title: 'Financial Health Score',
      description: 'Understand your overall financial health with a dynamic 0–100 score based on savings rate, stability, and goals.',
      badge: 'Algorithmic'
    },
    {
      icon: PiggyBank,
      title: 'Smart Budget Management',
      description: 'Create budgets, monitor real-time utilization, and get warning alerts at 80%, 90%, and 100%+ thresholds.',
      badge: 'Real-Time'
    }
  ];

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Connect Your Finances',
      description: 'Track your income, expenses, budgets, and savings goals in one sleek, central dashboard.'
    },
    {
      step: '02',
      title: 'Let AI Understand Your Habits',
      description: 'SmartFin AI automatically analyzes your historical cashflow, category breakdown, and recurring expenses.'
    },
    {
      step: '03',
      title: 'Make Smarter Decisions',
      description: 'Receive multi-model ML predictions, anomaly warnings, health diagnostics, and personalized recommendations.'
    }
  ];

  const benefits = [
    { icon: Receipt, title: 'Track Every Expense', desc: 'Categorize spending with Need vs Want tags for maximum financial clarity.' },
    { icon: TrendingUp, title: 'Understand Spending Patterns', desc: 'Identify monthly expenditure velocity and recurring transaction trends.' },
    { icon: BrainCircuit, title: 'Predict Future Expenses', desc: 'Multi-algorithm Machine Learning forecasts next month\'s expenses accurately.' },
    { icon: ShieldAlert, title: 'Detect Unusual Transactions', desc: 'Isolation Forest ML flags statistical outliers before budget overruns occur.' },
    { icon: PiggyBank, title: 'Manage Budgets', desc: 'Set overall & category limits with automated threshold alerts.' },
    { icon: Target, title: 'Set Savings Goals', desc: 'Track target milestones with automated required monthly savings math.' },
    { icon: HeartPulse, title: 'Monitor Financial Health', desc: 'Receive weighted 0–100 health index ratings and diagnostic tips.' },
    { icon: Bot, title: 'Get AI-Powered Insights', desc: 'Interact with a data-grounded chatbot for natural language financial queries.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* 1. STICKY NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-2xl py-3' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl text-slate-100 tracking-tight">SmartFin</span>
              <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-emerald-500 text-slate-950">AI</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#ai-insights" className="hover:text-emerald-400 transition-colors">AI Insights</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#benefits" className="hover:text-emerald-400 transition-colors">Benefits</a>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-slate-100 px-4 py-2.5 rounded-xl hover:bg-slate-800/60 transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/register"
              className="text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              Get Started Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-6 py-6 space-y-4 text-sm font-semibold">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block text-slate-300 hover:text-emerald-400"
            >
              Features
            </a>
            <a 
              href="#ai-insights" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block text-slate-300 hover:text-emerald-400"
            >
              AI Insights
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block text-slate-300 hover:text-emerald-400"
            >
              How It Works
            </a>
            <a 
              href="#benefits" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block text-slate-300 hover:text-emerald-400"
            >
              Benefits
            </a>
            <hr className="border-slate-800" />
            <div className="flex flex-col gap-3 pt-2">
              <Link 
                href="/login"
                className="w-full text-center py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Sign In
              </Link>
              <Link 
                href="/register"
                className="w-full text-center py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Glow background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-lg shadow-emerald-500/5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>AI-Powered Personal Finance</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-[1.15]">
                Take Control of Your Money with{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  SmartFin AI
                </span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Track your income and expenses, understand your spending habits, detect unusual activity, and use AI-powered predictions to build a smarter financial future.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  Explore AI Features
                </a>
              </div>

              {/* Trust Line */}
              <p className="text-xs text-slate-500 font-medium pt-2 flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Smart insights. Better decisions. Stronger financial habits.</span>
              </p>

            </div>

            {/* Right Side: Dashboard Mockup Preview */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl p-6 bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-5 group hover:border-emerald-500/40 transition-all duration-500">
                
                {/* Mockup Top Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      AM
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">Alex Mercer's Financial Overview</h4>
                      <p className="text-[10px] text-slate-500">SmartFin AI SaaS Dashboard Preview</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Score: 78/100 (Good)
                  </div>
                </div>

                {/* Stat Mini Cards Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-500 font-medium">Income</span>
                    <p className="text-xs font-black text-slate-100 font-mono">Rs. 98,500</p>
                    <span className="text-[9px] text-emerald-400 font-semibold">+12.5%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-500 font-medium">Expenses</span>
                    <p className="text-xs font-black text-slate-100 font-mono">Rs. 78,900</p>
                    <span className="text-[9px] text-amber-400 font-semibold">67% Need</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-500 font-medium">Net Savings</span>
                    <p className="text-xs font-black text-slate-100 font-mono">Rs. 19,600</p>
                    <span className="text-[9px] text-teal-400 font-semibold">21.5% Rate</span>
                  </div>
                </div>

                {/* Forecast Feature Spotlight Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950/30 to-slate-950 border border-emerald-500/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <BrainCircuit className="w-3.5 h-3.5" /> Predicted Next Month Expense
                    </div>
                    <h3 className="text-lg font-black text-slate-100 font-mono">Rs. 82,450</h3>
                    <p className="text-[10px] text-slate-400">Selected Model: <strong className="text-emerald-400">XGBoost Regressor (R² 0.94)</strong></p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    +Rs. 3,550 (+4.5%)
                  </div>
                </div>

                {/* Cashflow Chart Visual */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">Cashflow Trend & Forecast</span>
                    <span>May — Oct 2026</span>
                  </div>
                  <div className="h-32 w-full">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={heroCashflowData}>
                          <defs>
                            <linearGradient id="heroInc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis hide />
                          <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#heroInc)" />
                          <Area type="monotone" dataKey="expense" stroke="#f59e0b" strokeWidth={2} fill="transparent" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full bg-slate-950/60 rounded-xl animate-pulse" />
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. AI FEATURE SECTION */}
      <section id="features" className="py-20 relative bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Core Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Your Personal Finance, Powered by AI
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              SmartFin AI integrates real Machine Learning algorithms to analyze transactions, forecast future budgets, and alert you to unusual spending behavior.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="group p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 hover:bg-slate-900 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-800">
                      {f.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. AI PREDICTION SHOWCASE */}
      <section id="ai-insights" className="py-20 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Text & Marketing Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <BrainCircuit className="w-4 h-4" /> Feature Spotlight: Machine Learning
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
                Know What Your Spending Looks Like Tomorrow
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                SmartFin AI compares multiple machine learning models and selects the best-performing model for your financial history.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-200">Multi-Model Evaluation</span>
                  <p className="text-xs text-slate-400">Trains and evaluates Linear Regression, Random Forest Regressor, and XGBoost Regressor on your financial records.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-200">Ground-Truth Accuracy</span>
                  <p className="text-xs text-slate-400">Calculates actual MAE, RMSE, MAPE, and R² validation metrics automatically.</p>
                </div>
              </div>
            </div>

            {/* Prediction Showcase Card & Chart */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Predicted Next Month Expense</span>
                    <h3 className="text-3xl font-black text-emerald-400 font-mono mt-0.5">Rs. 82,450</h3>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold self-start sm:self-center">
                    Model Selected: XGBoost Regressor
                  </div>
                </div>

                {/* Model Metrics */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">MAE (Mean Error)</span>
                    <strong className="text-xs font-mono text-slate-200">Rs. 1,420.5</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">RMSE Score</span>
                    <strong className="text-xs font-mono text-slate-200">Rs. 1,890.2</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">R² Score</span>
                    <strong className="text-xs font-mono text-emerald-400">0.94 (94%)</strong>
                  </div>
                </div>

                {/* Category Forecast Chart */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">Category-Level Forecast Breakdown</h4>
                  <div className="h-52 w-full pt-2">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={predictionShowcaseData}>
                          <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs.${v/1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                            formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Amount']}
                          />
                          <Bar dataKey="actual" fill="#475569" name="Current Month" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="predicted" fill="#10b981" name="ML Forecast" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full bg-slate-950/60 rounded-xl animate-pulse" />
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 relative bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              How SmartFin AI Works
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              From entering transactions to generating high-precision predictions in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((s, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-teal-500/40 transition-all duration-300 relative group"
              >
                <span className="text-4xl font-black text-teal-500/30 group-hover:text-teal-400 transition-colors font-mono">
                  {s.step}
                </span>
                <h3 className="font-bold text-lg text-slate-100">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. BENEFITS SECTION */}
      <section id="benefits" className="py-20 relative bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Comprehensive Feature Set
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Everything You Need to Build Better Financial Habits
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 w-fit">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">{b.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/50 to-slate-900 border border-emerald-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
            
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              Start Making Smarter Financial Decisions Today
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
              Your money has a story. SmartFin AI helps you understand it.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Sign In
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <span className="font-bold text-base text-slate-100">SmartFin AI</span>
              </div>
              <p className="text-slate-400">AI-powered personal finance management.</p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-medium">
              <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
              <a href="#ai-insights" className="hover:text-emerald-400 transition-colors">AI Insights</a>
              <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
              <a href="#benefits" className="hover:text-emerald-400 transition-colors">Benefits</a>
              <Link href="/login" className="hover:text-emerald-400 transition-colors">Login</Link>
              <Link href="/register" className="hover:text-emerald-400 transition-colors">Sign Up</Link>
            </div>
          </div>

          <hr className="border-slate-900" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-600">
            <p>&copy; 2026 SmartFin AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
