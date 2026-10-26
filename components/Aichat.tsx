'use client';

import { useState, useRef, useEffect } from 'react';
import { GitHubUser, Repo, DevMetrics } from '@/types/github';
import { generateSmartAiResponse } from '@/lib/github';
import {
  Bot,
  Send,
  X,
  Copy,
  Check,
  User,
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
    prompt: 'Give a savage but funny roast of this developer based on their GitHub profile and repos.',
  },
  {
    icon: FileText,
    label: '1-Page Resume',
    prompt: 'Write an executive 1-page developer resume and CV based on their GitHub repos and activity.',
  },
  {
    icon: DollarSign,
    label: 'Salary Estimate',
    prompt: 'Estimate the market salary range and seniority level for this developer based on their stack and stars.',
  },
  {
    icon: Briefcase,
    label: 'Hiring Verdict',
    prompt: 'Provide a detailed hiring recommendation and top interview questions for this developer.',
  },
  {
    icon: Compass,
    label: 'Social Footprint',
    prompt: 'Find all their social links, online handles, and summarize their public presence.',
  },
];

export default function AiChat({ username, user, repos, metrics, onClose }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### GitFolio Intelligence Dossier
Indexed **@${user.login}**:
- **Rating:** ${metrics.score}/100 (${metrics.tier}-Tier)
- **Archetype:** ${metrics.archetype}
- **Volume:** ${metrics.totalStars.toLocaleString()}★ stars across ${user.public_repos} repos
- **Primary Stack:** ${metrics.primaryLanguage}

Select a quick action below or ask any technical or hiring inquiry.`,
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are GitFolio AI, an expert technical recruiter and developer analyst. Developer: @${user.login}. Name: ${user.name || user.login}. Repos: ${user.public_repos}. Stars: ${metrics.totalStars}. Language: ${metrics.primaryLanguage}. Score: ${metrics.score}/100. Archetype: ${metrics.archetype}. Keep response structured, professional, and clear.`,
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
    <div className="flex flex-col h-full bg-black border-l border-neutral-800 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-neutral-400" />
          <h3 className="text-xs font-semibold text-neutral-200 font-mono">
            AI Assistant
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-neutral-800 text-neutral-500">
            Llama 3.3
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 border-b border-neutral-900 bg-neutral-950/60 overflow-x-auto flex gap-1.5">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => handleSend(action.prompt)}
              disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-[11px] text-neutral-400 hover:text-white font-mono flex-shrink-0 transition-colors"
            >
              <Icon className="w-3 h-3 text-neutral-400" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`relative max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-neutral-800 text-white font-mono'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-300'
              }`}
            >
              {msg.role === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(msg.id, msg.content)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
                  title="Copy response"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}

              <div className="whitespace-pre-wrap font-sans space-y-2">
                {msg.content}
              </div>

              <span className="text-[10px] text-neutral-600 font-mono block mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-6 h-6 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="rounded-lg p-3 bg-neutral-950 border border-neutral-800 flex items-center gap-2 text-xs text-neutral-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Analyzing profile...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about this profile..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 outline-none focus:border-neutral-600 transition-colors font-mono"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-md bg-white hover:bg-neutral-200 disabled:opacity-30 text-black font-medium transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
