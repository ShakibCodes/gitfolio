'use client';

import { useState, useRef, useEffect } from 'react';
import { GitHubUser, Repo, DevMetrics } from '@/types/github';
import { generateSmartAiResponse } from '@/lib/github';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Copy,
  Check,
  User,
  Zap,
  RefreshCw,
  Flame,
  FileText,
  DollarSign,
  Briefcase,
  Compass,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  username: string;
  user: GitHubUser;
  repos: Repo[];
  metrics: DevMetrics;
  onClose?: () => void;
}

const QUICK_ACTIONS = [
  {
    icon: Flame,
    label: 'Roast Code',
    color: 'text-orange-400',
    prompt: 'Give a savage but funny roast of this developer based on their GitHub profile and repos.',
  },
  {
    icon: FileText,
    label: '1-Page Resume',
    color: 'text-emerald-400',
    prompt: 'Write an executive 1-page developer resume and CV based on their GitHub repos and activity.',
  },
  {
    icon: DollarSign,
    label: 'Salary Estimate',
    color: 'text-amber-400',
    prompt: 'Estimate the market salary range and seniority level for this developer based on their stack and stars.',
  },
  {
    icon: Briefcase,
    label: 'Hiring Verdict',
    color: 'text-blue-400',
    prompt: 'Provide a detailed hiring recommendation and top interview questions for this developer.',
  },
  {
    icon: Compass,
    label: 'Social Footprint',
    color: 'text-purple-400',
    prompt: 'Find all their social links, online handles, and summarize their public presence.',
  },
];

export default function AiChat({ username, user, repos, metrics, onClose }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 🤖 GitFolio Developer Intelligence Loaded
I have indexed **@${user.login}**'s GitHub footprint:
- **Index Rating:** ${metrics.score}/100 (${metrics.tier}-Tier)
- **Archetype:** ${metrics.archetype}
- **Volume:** ${metrics.totalStars.toLocaleString()}★ stars across ${user.public_repos} repositories
- **Primary Stack:** ${metrics.primaryLanguage}

Click one of the prompt chips below or ask me anything!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      // Send to server API route
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are GitFolio AI, an expert technical recruiter, engineering leader, and developer analyst. Developer username: ${user.login}. Name: ${user.name || user.login}. Bio: ${user.bio}. Repos: ${user.public_repos}. Stars: ${metrics.totalStars}. Primary language: ${metrics.primaryLanguage}. Score: ${metrics.score}/100. Archetype: ${metrics.archetype}.`,
            },
            { role: 'user', content: text },
          ],
        }),
      });

      const data = await res.json();

      if (data?.choices?.[0]?.message?.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.choices[0].message.content,
            timestamp: new Date(),
          },
        ]);
      } else {
        // Fallback to local heuristic intelligence
        const localResponse = generateSmartAiResponse(text, user, repos, metrics);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: localResponse,
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      // Local fallback on network error
      const localResponse = generateSmartAiResponse(text, user, repos, metrics);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: localResponse,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/95 border-l border-white/10 glass-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-mono">
              <span>GitFolio AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <span className="text-[10px] text-slate-400">Contextual Developer Intelligence</span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 border-b border-white/5 bg-slate-900/30 overflow-x-auto flex gap-1.5">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => handleSend(action.prompt)}
              disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 font-mono flex-shrink-0 transition-all hover:border-emerald-500/30"
            >
              <Icon className={`w-3 h-3 ${action.color}`} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/30">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`relative max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 rounded-tr-none'
                  : 'bg-slate-900/80 text-slate-200 border border-white/10 rounded-tl-none shadow-md'
              }`}
            >
              {/* Copy message button */}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(msg.id, msg.content)}
                  className="absolute top-2 right-2 p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Copy response"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}

              {/* Render content */}
              <div className="prose prose-invert prose-xs max-w-none space-y-2 whitespace-pre-wrap font-sans">
                {msg.content}
              </div>

              <span className="text-[10px] text-slate-500 font-mono block mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/30">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="rounded-2xl rounded-tl-none p-3 bg-slate-900/80 border border-white/10 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Analyzing GitHub graph & synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-white/10 bg-slate-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about tech stack, hiring advice, code quality..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500/50 transition-colors font-mono"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
