'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Bot, Send, Cpu, Trash2 } from 'lucide-react';
import { getInitials, useAuth } from '../../context/AuthContext';
import {
  assistantService,
  AssistantChatMessage,
  AssistantHistoryTurn,
} from '../../services/assistant.service';
import { ApiError } from '../../lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatStamp(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function welcomeMessage(firstName: string): Message {
  return {
    id: 'welcome',
    sender: 'assistant',
    text: `Hello ${firstName}. Ask me about your income, expenses, budgets, savings goals, forecast, or health score. I answer from your live totals and will not invent numbers.`,
    timestamp: nowStamp(),
    source: 'Assistant',
  };
}

function toUiMessage(item: AssistantChatMessage): Message {
  return {
    id: item.id,
    sender: item.role,
    text: item.text,
    timestamp: formatStamp(item.createdAt),
    source: item.source,
  };
}

export default function AIAssistantPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [useOllama, setUseOllama] = useState(true);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setLoadingHistory(true);
      try {
        const [statusResult, historyResult] = await Promise.all([
          assistantService.status(),
          assistantService.messages(),
        ]);
        if (cancelled) return;

        setOllamaAvailable(statusResult.ollamaAvailable);
        setUseOllama(statusResult.ollamaAvailable);
        setMessages(
          historyResult.messages.length > 0
            ? historyResult.messages.map(toUiMessage)
            : [welcomeMessage(firstName)]
        );
      } catch {
        if (cancelled) return;
        setOllamaAvailable(false);
        setUseOllama(false);
        setMessages([welcomeMessage(firstName)]);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [firstName]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const quickQuestions = [
    'Where did I spend the most this month?',
    'How much did I save this month?',
    'How much did I spend on Food?',
    'What will my expenses be next month?',
    'Am I close to exceeding my budget?',
    'What is my health score?',
  ];

  const handleClear = async () => {
    if (clearing || sending) return;
    setClearing(true);
    try {
      await assistantService.clear();
      setMessages([welcomeMessage(firstName)]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          sender: 'assistant',
          text: err instanceof ApiError ? err.message : 'Unable to clear chat right now.',
          timestamp: nowStamp(),
          source: 'Error',
        },
      ]);
    } finally {
      setClearing(false);
    }
  };

  const handleSend = async (questionText?: string) => {
    const question = (questionText || input).trim();
    if (!question || sending || loadingHistory) return;

    const history: AssistantHistoryTurn[] = messages
      .filter((item) => item.id !== 'welcome' && item.source !== 'Error')
      .slice(-10)
      .map((item) => ({
        role: item.sender,
        text: item.text,
      }));

    const tempUserId = `temp_u_${Date.now()}`;
    const userMsg: Message = {
      id: tempUserId,
      sender: 'user',
      text: question,
      timestamp: nowStamp(),
    };

    setMessages((prev) => [...prev.filter((item) => item.id !== 'welcome'), userMsg]);
    if (!questionText) setInput('');
    setSending(true);

    try {
      const result = await assistantService.ask(question, useOllama, history);
      setOllamaAvailable(result.usedOllama || ollamaAvailable);
      setMessages((prev) => [
        ...prev.filter((item) => item.id !== tempUserId),
        ...result.messages.map(toUiMessage),
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          sender: 'assistant',
          text: err instanceof ApiError ? err.message : 'Unable to answer right now. Check that the backend is running.',
          timestamp: nowStamp(),
          source: 'Error',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold text-slate-100">
                Assistant
              </h1>
              <p className="text-xs text-slate-400">
                Replies from live MongoDB totals · chat saved to your account
                {ollamaAvailable ? ' · Ollama ready' : ' · Ollama offline, using rules'}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <Cpu className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-medium">Engine:</span>
            <button
              type="button"
              onClick={() => setUseOllama(!useOllama)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                useOllama ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {useOllama ? 'Local Ollama LLM' : 'Analytics Rules Engine'}
            </button>
            <button
              type="button"
              onClick={() => void handleClear()}
              disabled={clearing || sending || loadingHistory}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors disabled:opacity-50"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 custom-scrollbar">
          {quickQuestions.map((question) => (
            <button
              key={question}
              type="button"
              disabled={sending || loadingHistory}
              onClick={() => void handleSend(question)}
              className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>

        <div ref={chatRef} className="flex-1 p-6 rounded-3xl bg-slate-900 border border-slate-800 overflow-y-auto space-y-4 custom-scrollbar">
          {loadingHistory ? (
            <p className="text-xs text-slate-500">Loading your saved chat…</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'assistant' && (
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-xl p-4 rounded-2xl text-xs space-y-1 ${
                  message.sender === 'user'
                    ? 'bg-emerald-500 text-ink-50 font-medium rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <div className={`flex items-center justify-between text-[10px] pt-1 ${message.sender === 'user' ? 'text-slate-900/80' : 'text-slate-500'}`}>
                    <span>{message.timestamp}</span>
                    {message.source && <span className="font-mono">{message.source}</span>}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {getInitials(user?.name)}
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <p className="text-xs text-slate-500">
              {useOllama ? 'Thinking with your live totals…' : 'Looking up your live totals…'}
            </p>
          )}
        </div>

        <form
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            void handleSend();
          }}
          className="flex items-center gap-3 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question about your income, expenses, budgets, or forecast…"
            disabled={loadingHistory}
            className="flex-1 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || loadingHistory}
            className="p-3 rounded-md bg-ink-900 hover:bg-ink-800 text-white transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
