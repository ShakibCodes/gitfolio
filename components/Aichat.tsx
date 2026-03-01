'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Repo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  topics: string[];
  fork: boolean;
}

interface AiChatProps {
  username: string;
  userData: {
    name: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
    company: string;
    location: string;
    blog: string;
    twitter_username: string;
    created_at?: string;
    email?: string;
  };
  repos: Repo[];
}

const QUICK_PROMPTS = [
  '🔍 Find social profiles',
  '💻 What are they best at?',
  '🚀 Summarize their work',
  '🧠 Guess their role/title',
  '⭐ Best projects to explore',
  '📅 Career timeline',
];

// ─── Language → role mapping ───
const LANG_ROLE_MAP: Record<string, string[]> = {
  TypeScript: ['Frontend Engineer', 'Full-Stack Engineer'],
  JavaScript: ['Frontend Engineer', 'Full-Stack Engineer'],
  Python: ['Data Scientist', 'Backend Engineer', 'ML Engineer'],
  Rust: ['Systems Engineer', 'Low-Level Engineer'],
  Go: ['Backend Engineer', 'DevOps Engineer', 'Platform Engineer'],
  Java: ['Backend Engineer', 'Android Developer'],
  Kotlin: ['Android Developer', 'Backend Engineer'],
  Swift: ['iOS Developer'],
  'C++': ['Systems Engineer', 'Game Developer', 'Embedded Engineer'],
  C: ['Systems Engineer', 'Embedded Engineer'],
  Ruby: ['Backend Engineer', 'Rails Developer'],
  PHP: ['Backend Engineer', 'Web Developer'],
  Dart: ['Flutter Developer', 'Mobile Developer'],
  Shell: ['DevOps Engineer', 'Platform Engineer'],
  CSS: ['Frontend Engineer', 'UI Engineer'],
  Vue: ['Frontend Engineer'],
  Svelte: ['Frontend Engineer'],
  Elixir: ['Backend Engineer', 'Distributed Systems Engineer'],
  Scala: ['Data Engineer', 'Backend Engineer'],
  Haskell: ['Functional Programmer', 'Compiler Engineer'],
  R: ['Data Scientist', 'Statistician'],
};

// ─── Parse repos to extract rich context ───
function buildRepoContext(repos: Repo[]) {
  const langCounts: Record<string, number> = {};
  const langStars: Record<string, number> = {};
  const topicSet = new Set<string>();
  let totalStars = 0;

  repos.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      langStars[r.language] = (langStars[r.language] || 0) + r.stargazers_count;
    }
    r.topics?.forEach((t) => topicSet.add(t));
    totalStars += r.stargazers_count;
  });

  const topLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, count]) => `${lang} (${count} repos, ${langStars[lang]} ★)`);

  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map((r) => `  • ${r.name} — ${r.stargazers_count}★${r.description ? ' — ' + r.description.slice(0, 80) : ''} — ${r.html_url}`);

  const dominantLangs = Object.keys(langCounts).sort((a, b) => langCounts[b] - langCounts[a]).slice(0, 3);
  const guessedRoles = [...new Set(dominantLangs.flatMap((l) => LANG_ROLE_MAP[l] || []))];

  const topics = [...topicSet].slice(0, 20).join(', ');

  return { topLangs, topRepos, totalStars, guessedRoles, topics, langCounts };
}

// ─── Render markdown-ish content with clickable links ───
function renderContent(text: string): string {
  // Escape HTML first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>');

  // Italic *text*
  html = html.replace(/\*(.*?)\*/g, '<em style="color:var(--text-secondary)">$1</em>');

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code style="background:var(--surface-3);color:#00ff88;padding:1px 5px;border-radius:4px;font-size:11px">$1</code>');

  // URLs → clickable links (before list processing)
  html = html.replace(
    /(https?:\/\/[^\s<>"')\]]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#58a6ff;text-decoration:underline;text-underline-offset:2px;word-break:break-all" class="hover:opacity-70">$1</a>'
  );

  // Headings ### and ##
  html = html.replace(/^### (.+)$/gm, '<p style="color:var(--text-primary);font-weight:600;margin:10px 0 4px;font-family:Syne,sans-serif">$1</p>');
  html = html.replace(/^## (.+)$/gm, '<p style="color:var(--text-primary);font-weight:700;margin:12px 0 4px;font-family:Syne,sans-serif;font-size:13px">$1</p>');

  // Bullet lists — • or - or *
  html = html.replace(/^[\-•]\s+(.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:#00ff88;flex-shrink:0">›</span><span>$1</span></div>');

  // Numbered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:#58a6ff;flex-shrink:0">·</span><span>$1</span></div>');

  // Newlines → <br>
  html = html.replace(/\n/g, '<br>');

  // Clean up excessive <br>s
  html = html.replace(/(<br\s*\/?>\s*){3,}/g, '<br><br>');

  return html;
}


const GROQ_MODEL = 'llama-3.3-70b-versatile';

export default function AiChat({ username, userData, repos }: AiChatProps) {
  const { topLangs, topRepos, totalStars, guessedRoles, topics } = buildRepoContext(repos);

  const systemPrompt = `You are GitFolio AI — an expert developer intelligence assistant. You have deep knowledge about GitHub developer @${username} and can answer almost any question about them.

## Developer Profile
- **Username**: @${username} (https://github.com/${username})
- **Name**: ${userData.name || username}
- **Bio**: ${userData.bio || 'Not provided'}
- **Location**: ${userData.location || 'Unknown'}
- **Company**: ${userData.company || 'Unknown'}
- **Website/Blog**: ${userData.blog || 'None'}
- **Twitter/X**: ${userData.twitter_username ? `@${userData.twitter_username} (https://twitter.com/${userData.twitter_username})` : 'Unknown'}
- **GitHub Profile**: https://github.com/${username}
- **Member Since**: ${userData.created_at ? new Date(userData.created_at).getFullYear() : 'Unknown'}
- **Public Repos**: ${userData.public_repos}
- **Followers**: ${userData.followers} | **Following**: ${userData.following}
- **Total Stars Earned**: ${totalStars}

## Top Languages (by repo count)
${topLangs.join('\n')}

## Top Repositories
${topRepos.join('\n')}

## Topics & Keywords Found
${topics || 'None detected'}

## Inferred Developer Role(s)
Based on their language usage: ${guessedRoles.join(', ') || 'General Developer'}

## Your Capabilities
1. **Social Discovery**: Infer and provide likely social profiles. If they have a blog or twitter set, share it. Always generate likely LinkedIn URL: https://linkedin.com/in/${username} and note it may need verification. Search their repo READMEs and bio for clues.
2. **Tech Analysis**: Deeply analyze their stack, strengths, expertise level per language.
3. **Role Inference**: Tell what kind of developer they are (frontend, backend, ML, etc.) based on their repos and languages.
4. **Project Insights**: Summarize and explain their notable projects. Always include the GitHub repo links.
5. **Career Timeline**: Estimate career progression from join date and repo history.
6. **Strengths & Weaknesses**: Based on their repos, what are they great at? What's missing?

## Response Style Rules
- Always use **markdown** formatting — bold, bullets, code ticks, headers
- Always make URLs clickable by including the full https:// link
- Be confident but note when something is inferred vs confirmed
- Keep answers concise but information-dense
- Use emojis sparingly for visual clarity
- When sharing social links, always clarify which are confirmed vs likely/guessed
- Never say "I don't have access" — use the data above and make intelligent inferences
- If asked about social presence, always provide: GitHub ✓, Twitter (if known), LinkedIn (inferred), personal site (if known), NPM/PyPI/etc based on their stack`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hey! I'm the GitFolio AI for **@${username}**.\n\nI know their repos, languages, top projects, and can find their social profiles. Ask me anything! 🚀`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    setError('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.7,
          max_tokens: 1024,
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedMessages
              .filter((m) => m.id !== 'welcome')
              .map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'No response received.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_ai',
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>

      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-4 py-3 border-b flex items-center gap-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,255,136,0.2)' }}
        >
          ◆
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-tight" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
            GitFolio AI
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
            @{username} · {repos.length} repos analysed
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Live</span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div
                className="w-5 h-5 rounded flex-shrink-0 mt-1 flex items-center justify-center text-xs"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,255,136,0.15)' }}
              >
                ◆
              </div>
            )}

            <div
              className="max-w-[88%] px-3 py-2.5 rounded-xl text-xs leading-relaxed"
              style={{
                background: msg.role === 'user'
                  ? 'rgba(88,166,255,0.08)'
                  : 'var(--surface-2)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(88,166,255,0.18)' : 'var(--border)'}`,
                color: 'var(--text-secondary)',
                fontFamily: 'DM Mono, monospace',
                wordBreak: 'break-word',
              }}
              dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
            />

            {msg.role === 'user' && (
              <div
                className="w-5 h-5 rounded flex-shrink-0 mt-1 flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(88,166,255,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(88,166,255,0.2)' }}
              >
                U
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div
              className="w-5 h-5 rounded flex-shrink-0 mt-1 flex items-center justify-center text-xs"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,255,136,0.15)' }}
            >
              ◆
            </div>
            <div
              className="px-4 py-3 rounded-xl"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: 'var(--accent)', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="text-xs px-3 py-2 rounded-lg border"
            style={{ background: 'rgba(248,81,73,0.08)', borderColor: 'rgba(248,81,73,0.2)', color: '#f85149' }}
          >
            ✕ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick prompts (only at start) ── */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p.replace(/^[\S]+\s/, ''))}
              className="text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-200"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
                background: 'var(--surface-2)',
                fontFamily: 'DM Mono, monospace',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderColor = 'rgba(0,255,136,0.3)';
                (e.target as HTMLElement).style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderColor = 'var(--border)';
                (e.target as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ── Input area ── */}
      <div
        className="flex-shrink-0 px-3 pb-3 pt-2 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-end gap-2 rounded-xl border px-3 py-2 transition-all duration-200"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          onFocus={() => {}}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about @{username}..."
            rows={1}
            className="flex-1 bg-transparent text-xs outline-none resize-none leading-relaxed"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'DM Mono, monospace',
              maxHeight: '80px',
              overflowY: 'auto',
            }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface-3)',
              color: input.trim() && !loading ? '#000' : 'var(--text-muted)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-center" style={{ color: 'var(--text-muted)', fontSize: '9px', fontFamily: 'DM Mono, monospace' }}>
          Enter to send · Shift+Enter for newline · Powered by Llama 3.3 70B
        </p>
      </div>
    </div>
  );
}