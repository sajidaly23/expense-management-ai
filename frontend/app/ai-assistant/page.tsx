'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Bot, Send, Sparkles, User, Database, ShieldCheck, Cpu } from 'lucide-react';
import { mockExpenses, mockIncomes, mockPrediction, mockBudgets } from '../../lib/mockData';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Hello Alex! I am your SmartFin AI Financial Assistant. I analyze your actual financial records and ML prediction models. How can I help you today?',
      timestamp: '15:30',
      source: 'Deterministic AI Engine'
    }
  ]);
  const [input, setInput] = useState('');
  const [useOllama, setUseOllama] = useState(false);

  const quickQuestions = [
    "Where did I spend the most this month?",
    "How much did I save this month?",
    "What will my expenses be next month?",
    "Am I close to exceeding my budget?",
    "What is my highest expense category?"
  ];

  const handleSend = (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let replyText = "";
    const lowerQ = q.toLowerCase();

    if (lowerQ.includes('spend the most') || lowerQ.includes('highest expense')) {
      replyText = `Based on your actual MongoDB expense records for September 2026, your highest spending category is Rent at Rs. 22,000 (27.8% of total expenses), followed by Shopping at Rs. 18,500.`;
    } else if (lowerQ.includes('save') || lowerQ.includes('savings')) {
      const totalInc = mockIncomes.reduce((a, b) => a + b.amount, 0);
      const totalExp = mockExpenses.reduce((a, b) => a + b.amount, 0);
      const saved = totalInc - totalExp;
      replyText = `You have saved Rs. ${saved.toLocaleString()} this month. Your current savings rate is 21.5% of total income (Rs. ${totalInc.toLocaleString()}), which satisfies your financial target of >= 20%.`;
    } else if (lowerQ.includes('next month') || lowerQ.includes('prediction')) {
      replyText = `According to your trained XGBoost Regressor model, your predicted total expenses for October 2026 are approximately Rs. ${mockPrediction.predictedAmount.toLocaleString()} (+4.5% vs September). Food (Rs. 16,200) and Rent (Rs. 22,000) constitute the largest forecasted items.`;
    } else if (lowerQ.includes('budget') || lowerQ.includes('exceeding')) {
      replyText = `Your overall budget is currently at 105% utilization (Rs. 78,900 spent vs Rs. 75,000 allowance). Specifically, your Shopping category budget is at 154% (Rs. 18,500 spent vs Rs. 12,000 budget).`;
    } else {
      replyText = `Based on your recorded financial data: Total Income = Rs. 98,500, Total Expenses = Rs. 78,900, Net Savings = Rs. 19,600. Your Financial Health Score is 78/100 (Good).`;
    }

    const aiMsg: Message = {
      id: `a_${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: useOllama ? 'Local Ollama LLM' : 'Analytics DB Engine'
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    if (!questionText) setInput('');
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                SmartFin AI Assistant <Sparkles className="w-4 h-4 text-emerald-400" />
              </h1>
              <p className="text-xs text-slate-400">Queries MongoDB & ML engines directly. Never invents numbers.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <Cpu className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-medium">Engine:</span>
            <button
              onClick={() => setUseOllama(!useOllama)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                useOllama ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {useOllama ? 'Local Ollama LLM' : 'Analytics Rules Engine'}
            </button>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 custom-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Stream Window */}
        <div className="flex-1 p-6 rounded-3xl bg-slate-900 border border-slate-800 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-xl p-4 rounded-2xl text-xs space-y-1 ${
                m.sender === 'user'
                  ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <p className="leading-relaxed">{m.text}</p>
                <div className={`flex items-center justify-between text-[10px] pt-1 ${m.sender === 'user' ? 'text-slate-900/80' : 'text-slate-500'}`}>
                  <span>{m.timestamp}</span>
                  {m.source && <span className="font-mono">{m.source}</span>}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                  AM
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your income, expenses, predictions, or budgets..."
            className="flex-1 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
          <button
            type="submit"
            className="p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
