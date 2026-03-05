'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
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
  updated_at?: string;
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

// ─── Quick prompts — more "magical" actions ────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: '🔭', label: 'Find all their socials', prompt: 'Find all social profiles and online presence for this developer — GitHub, LinkedIn, Twitter, NPM, personal site, etc.' },
  { icon: '🧬', label: 'Roast their code', prompt: 'Give a savage but funny roast of this developer based on their GitHub profile and repos. Be witty!' },
  { icon: '💼', label: 'Write their resume', prompt: 'Write a professional one-page resume/CV for this developer based entirely on their GitHub activity, repos, and profile.' },
  { icon: '🎯', label: 'Guess their salary', prompt: 'Based on their tech stack, stars, repos, and experience — estimate what salary range this developer likely earns or could command. Be specific.' },
  { icon: '🤝', label: 'Should I hire them?', prompt: 'Give me a detailed hiring recommendation for this developer. What are their strengths, gaps, and what role would they excel in?' },
  { icon: '🌐', label: 'What are they building now?', prompt: 'Based on their most recent repos and activity, what is this developer likely working on right now? What problems are they trying to solve?' },
];

// ─── Language → role mapping ──────────────────────────────────────────────────
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

// ─── Build rich developer context ─────────────────────────────────────────────
function buildRepoContext(repos: Repo[]) {
  const langCounts: Record<string, number> = {};
  const langStars: Record<string, number> = {};
  const topicSet = new Set<string>();
  let totalStars = 0;
  let totalForks = 0;

  repos.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      langStars[r.language] = (langStars[r.language] || 0) + r.stargazers_count;
    }
    r.topics?.forEach((t) => topicSet.add(t));
    totalStars += r.stargazers_count;
    totalForks += r.forks_count || 0;
  });

  const topLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang, count]) => `${lang} (${count} repos, ${langStars[lang]}★)`);

  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((r) => `  • ${r.name} [${r.stargazers_count}★, ${r.forks_count}⑂]${r.language ? ` [${r.language}]` : ''}${r.description ? ` — ${r.description.slice(0, 100)}` : ''} — ${r.html_url}`);

  const recentRepos = [...repos]
    .filter((r) => r.updated_at)
    .sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime())
    .slice(0, 5)
    .map((r) => `  • ${r.name} (updated ${new Date(r.updated_at!).toLocaleDateString()})`);

  const dominantLangs = Object.keys(langCounts).sort((a, b) => langCounts[b] - langCounts[a]).slice(0, 3);
  const guessedRoles = [...new Set(dominantLangs.flatMap((l) => LANG_ROLE_MAP[l] || []))];
  const topics = [...topicSet].slice(0, 25).join(', ');
  const originalRepos = repos.filter((r) => !r.fork);

  return { topLangs, topRepos, recentRepos, totalStars, totalForks, guessedRoles, topics, langCounts, originalRepos: originalRepos.length };
}

// ─── Proper markdown renderer ──────────────────────────────────────────────────
function renderContent(raw: string): string {
  // Step 1: escape HTML in the raw string
  let text = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Step 2: process line by line for block elements, then inline
  const lines = text.split('\n');
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── H2: ## heading
    if (/^## (.+)$/.test(line)) {
      output.push(
        `<div style="color:var(--text-primary);font-weight:700;font-size:12px;font-family:Syne,sans-serif;margin:14px 0 6px;padding-bottom:4px;border-bottom:1px solid var(--border)">${applyInline(line.replace(/^## /, ''))}</div>`
      );
      i++; continue;
    }

    // ── H3: ### heading
    if (/^### (.+)$/.test(line)) {
      output.push(
        `<div style="color:var(--text-primary);font-weight:600;font-size:11px;font-family:Syne,sans-serif;margin:10px 0 4px;letter-spacing:0.03em">${applyInline(line.replace(/^### /, ''))}</div>`
      );
      i++; continue;
    }

    // ── Bullet: - or * or • at start
    if (/^[-*•]\s+/.test(line)) {
      output.push(
        `<div style="display:flex;gap:6px;margin:4px 0;align-items:flex-start"><span style="color:#00ff88;flex-shrink:0;margin-top:1px;font-size:10px">▸</span><span style="flex:1">${applyInline(line.replace(/^[-*•]\s+/, ''))}</span></div>`
      );
      i++; continue;
    }

    // ── Numbered list: 1. 2. etc.
    if (/^\d+\.\s+/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1] ?? '•';
      output.push(
        `<div style="display:flex;gap:8px;margin:4px 0;align-items:flex-start"><span style="color:#58a6ff;flex-shrink:0;font-size:10px;min-width:14px;text-align:right">${num}.</span><span style="flex:1">${applyInline(line.replace(/^\d+\.\s+/, ''))}</span></div>`
      );
      i++; continue;
    }

    // ── Blank line → spacing div
    if (line.trim() === '') {
      // Avoid stacking multiple blank lines
      const last = output[output.length - 1] ?? '';
      if (!last.includes('margin-block')) {
        output.push(`<div style="margin-block:5px"></div>`);
      }
      i++; continue;
    }

    // ── Normal paragraph line
    output.push(`<span style="display:block;margin:2px 0">${applyInline(line)}</span>`);
    i++;
  }

  return output.join('');
}

// ─── Inline markdown: bold, italic, code, [text](url), bare urls ──────────────
function applyInline(text: string): string {
  // [label](url) — must run BEFORE bare URL replacement
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#58a6ff;text-decoration:underline;text-underline-offset:2px;font-weight:500">$1</a>'
  );

  // bare https:// URLs not already inside an href
  text = text.replace(
    /(?<!href=")(https?:\/\/[^\s<>"')\]]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#58a6ff;text-decoration:underline;text-underline-offset:2px;word-break:break-all;font-size:10px">$1</a>'
  );

  // **bold**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:700">$1</strong>');

  // *italic*
  text = text.replace(/\*(.+?)\*/g, '<em style="color:var(--text-secondary);font-style:italic">$1</em>');

  // `inline code`
  text = text.replace(
    /`([^`]+)`/g,
    '<code style="background:rgba(0,255,136,0.08);color:#00ff88;padding:1px 6px;border-radius:4px;font-size:10px;font-family:DM Mono,monospace;border:1px solid rgba(0,255,136,0.15)">$1</code>'
  );

  return text;
}

// ─── Fetch from Groq via your existing /api/chat route ────────────────────────
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function fetchGroq(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  signal: AbortSignal
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.75,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response received.';
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AiChat({ username, userData, repos }: AiChatProps) {
  const { topLangs, topRepos, recentRepos, totalStars, totalForks, guessedRoles, topics, originalRepos } =
    buildRepoContext(repos);

  const systemPrompt = `You are GitFolio AI — an elite developer intelligence assistant with web search capabilities. You have deep knowledge about GitHub developer @${username} and can answer almost anything about them, including searching the web for latest info.

## Developer Profile
- **Username**: @${username} — https://github.com/${username}
- **Name**: ${userData.name || username}
- **Bio**: ${userData.bio || 'Not provided'}
- **Location**: ${userData.location || 'Unknown'}
- **Company**: ${userData.company || 'Unknown'}
- **Website**: ${userData.blog || 'None'}
- **Twitter/X**: ${userData.twitter_username ? `@${userData.twitter_username} (https://twitter.com/${userData.twitter_username})` : 'Unknown'}
- **Member Since**: ${userData.created_at ? new Date(userData.created_at).getFullYear() : 'Unknown'}
- **Public Repos**: ${userData.public_repos} (${originalRepos} original, rest are forks)
- **Followers / Following**: ${userData.followers} / ${userData.following}
- **Total Stars Earned**: ${totalStars.toLocaleString()}
- **Total Forks**: ${totalForks.toLocaleString()}

## Top Languages (by repo count)
${topLangs.join('\n')}

## Top Repositories (by stars)
${topRepos.join('\n')}

## Recently Active Repos
${recentRepos.join('\n')}

## Topics & Keywords Found in Repos
${topics || 'None detected'}

## Inferred Developer Role(s)
${guessedRoles.join(', ') || 'General Developer'}

## Your Special Powers
1. **Web Search**: You can search the web in real time. Use this to:
   - Find this developer's LinkedIn, NPM, PyPI, DEV.to, Medium, Stack Overflow, YouTube, podcast appearances, conference talks
   - Look up news articles or blog posts mentioning them
   - Find their open source contributions outside GitHub
   - Get latest info about their projects or employer
2. **Resume Generation**: Write a complete, polished resume from their GitHub data
3. **Salary Estimation**: Use market data + their stack + stars to estimate comp range
4. **Hire/No-Hire Recommendation**: Give structured hiring analysis
5. **Roast Mode**: Savage but funny roast based on their profile
6. **Career Timeline**: Reconstruct their career arc from join date + repo history
7. **What They're Building**: Infer current focus from recent repo activity

## Response Rules
- Use **markdown** formatting — bold, bullets, headers, inline code ticks
- ALWAYS format links as [label](url) — NEVER paste raw URLs inline. Example: [their website](https://example.com)
- Keep responses concise and scannable — use bullet points and short paragraphs
- Use ## for section headers when the response has multiple sections
- Be confident. Make intelligent inferences. Never say "I don't have access to that"
- Keep answers sharp and information-dense, avoid waffle
- Use emojis only at the start of sections or key points, not mid-sentence
- For social links: clearly mark ✓ confirmed vs 🔍 inferred
- Never start your reply with "I" — lead with the answer directly`;

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
  const [isSearching, setIsSearching] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text?: string) => {
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
    setIsSearching(false);

    // Heuristic: if question sounds like it needs live web data, show search indicator
    const searchKeywords = ['find', 'search', 'linkedin', 'social', 'npm', 'pypi', 'twitter', 'medium', 'latest', 'now', 'current', 'today'];
    if (searchKeywords.some((k) => content.toLowerCase().includes(k))) {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 3000);
    }

    // Placeholder message for streaming
    const aiMsgId = Date.now().toString() + '_ai';
    setMessages((prev) => [
      ...prev,
      { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true },
    ]);

    abortRef.current = new AbortController();

    try {
      const apiMessages = updatedMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const reply = await fetchGroq(apiMessages, systemPrompt, abortRef.current.signal);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, content: reply, isStreaming: false } : m
        )
      );
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [input, loading, messages, systemPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setLoading(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  };

  // ── Resume generation ──────────────────────────────────────────────────────
  const [resumeLoading, setResumeLoading] = useState(false);

  const generateResume = async () => {
    setResumeLoading(true);

    const { topLangs, topRepos, guessedRoles, totalStars } = buildRepoContext(repos);

    const resumePrompt = `Generate a complete, professional developer resume as structured JSON only. No explanation, no markdown, just valid JSON.

The resume is for GitHub user @${username}.

Profile data:
- Name: ${userData.name || username}
- Location: ${userData.location || 'N/A'}
- Website: ${userData.blog || ''}
- Twitter: ${userData.twitter_username ? '@' + userData.twitter_username : ''}
- GitHub: https://github.com/${username}
- Bio: ${userData.bio || ''}
- Member since: ${userData.created_at ? new Date(userData.created_at).getFullYear() : 'Unknown'}
- Followers: ${userData.followers} | Stars earned: ${totalStars}

Top languages: ${topLangs.join(', ')}
Inferred roles: ${guessedRoles.join(', ')}
Top repositories:
${topRepos.join('\n')}

Return ONLY this JSON shape, nothing else:
{
  "name": "...",
  "title": "...",
  "location": "...",
  "github": "...",
  "website": "...",
  "twitter": "...",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", ...],
  "projects": [
    { "name": "...", "description": "...", "stars": 0, "url": "...", "tech": "..." }
  ],
  "highlights": ["achievement1", "achievement2", ...],
  "languages": ["Lang1", "Lang2", ...]
}`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 1500,
          messages: [
            { role: 'system', content: 'You are a resume generator. Always respond with valid JSON only. No markdown, no explanation.' },
            { role: 'user', content: resumePrompt },
          ],
        }),
      });

      const data = await res.json();
      let raw = data.choices?.[0]?.message?.content || '';
      // Strip possible markdown code fences
      raw = raw.replace(/```json|```/g, '').trim();
      const resume = JSON.parse(raw);
      openResumeWindow(resume);
    } catch (err) {
      console.error('Resume generation failed:', err);
      alert('Resume generation failed. Try again!');
    } finally {
      setResumeLoading(false);
    }
  };

  const openResumeWindow = (r: {
    name: string; title: string; location: string; github: string;
    website: string; twitter: string; summary: string; skills: string[];
    projects: { name: string; description: string; stars: number; url: string; tech: string }[];
    highlights: string[]; languages: string[];
  }) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${r.name} — Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;background:#fff;color:#111;font-size:13px;line-height:1.5}
  .page{max-width:760px;margin:0 auto;padding:48px 52px}
  /* Header */
  .header{border-bottom:2px solid #111;padding-bottom:18px;margin-bottom:22px}
  .header h1{font-size:28px;font-weight:700;letter-spacing:-0.5px;margin-bottom:2px}
  .header .title{font-size:14px;color:#444;font-weight:500;margin-bottom:10px}
  .links{display:flex;flex-wrap:wrap;gap:14px;font-size:11.5px;color:#555}
  .links a{color:#1a56db;text-decoration:none}
  .links span{display:flex;align-items:center;gap:4px}
  /* Sections */
  .section{margin-bottom:20px}
  .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #eee}
  /* Summary */
  .summary{color:#333;font-size:13px;line-height:1.65}
  /* Skills */
  .skills-wrap{display:flex;flex-wrap:wrap;gap:6px}
  .skill-tag{background:#f3f4f6;color:#374151;padding:3px 10px;border-radius:4px;font-size:11.5px;font-weight:500;border:1px solid #e5e7eb}
  /* Projects */
  .project{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f0f0f0}
  .project:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
  .project-header{display:flex;align-items:baseline;gap:10px;margin-bottom:3px}
  .project-name{font-weight:600;font-size:13.5px}
  .project-name a{color:#1a56db;text-decoration:none}
  .project-stars{font-size:11px;color:#888;font-family:'JetBrains Mono',monospace}
  .project-tech{font-size:11px;color:#6b7280;font-family:'JetBrains Mono',monospace;margin-bottom:4px}
  .project-desc{color:#444;font-size:12.5px}
  /* Highlights */
  .highlight{display:flex;gap:8px;margin-bottom:6px;font-size:12.5px;color:#333}
  .highlight::before{content:"▸";color:#1a56db;flex-shrink:0;margin-top:1px}
  /* Languages */
  .lang-grid{display:flex;flex-wrap:wrap;gap:6px}
  .lang-chip{font-family:'JetBrains Mono',monospace;font-size:11px;padding:3px 10px;border-radius:20px;border:1px solid #d1d5db;color:#374151}
  /* Watermark — fixed on screen, printed in footer */
  .wm-fixed{position:fixed;bottom:20px;right:24px;display:flex;align-items:center;gap:5px;opacity:0.35;pointer-events:none;z-index:50}
  .wm-dot{width:7px;height:7px;border-radius:50%;background:#00c96e}
  .wm-label{font-family:'Inter',sans-serif;font-size:11.5px;font-weight:700;letter-spacing:0.06em;color:#111}
  .wm-label em{color:#00c96e;font-style:normal}
  /* Footer watermark — only visible on print */
  .wm-footer{margin-top:32px;padding-top:12px;border-top:1px solid #eee;display:flex;align-items:center;justify-content:flex-end;gap:5px}
  .wm-footer-dot{width:5px;height:5px;border-radius:50%;background:#00c96e;display:inline-block}
  .wm-footer-label{font-size:9.5px;font-weight:700;letter-spacing:0.08em;color:#bbb;text-transform:uppercase}
  .wm-footer-label em{color:#00c96e;font-style:normal}
  /* Print */
  @media print{
    body{font-size:12px}
    .page{padding:32px 40px}
    .no-print{display:none!important}
    .wm-fixed{display:none}
  }
  /* Print button */
  .print-bar{position:fixed;top:0;left:0;right:0;background:#1a56db;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;z-index:100}
  .print-bar span{color:#fff;font-size:13px;font-weight:500}
  .print-btn{background:#fff;color:#1a56db;border:none;padding:7px 18px;border-radius:6px;font-weight:600;font-size:13px;cursor:pointer}
  .print-spacer{height:48px}
</style>
</head>
<body>
<div class="wm-fixed no-print">
  <div class="wm-dot"></div>
  <div class="wm-label">Git<em>Folio</em></div>
</div>
<div class="print-bar no-print">
  <span>📄 ${r.name} — Resume Preview</span>
  <button class="print-btn" onclick="window.print()">⬇ Download / Print PDF</button>
</div>
<div class="print-spacer no-print"></div>
<div class="page">
  <div class="header">
    <h1>${r.name}</h1>
    <div class="title">${r.title}</div>
    <div class="links">
      ${r.location ? `<span>📍 ${r.location}</span>` : ''}
      ${r.github ? `<span>🐙 <a href="${r.github}" target="_blank">${r.github.replace('https://', '')}</a></span>` : ''}
      ${r.website ? `<span>🌐 <a href="${r.website}" target="_blank">${r.website.replace(/^https?:\/\//, '')}</a></span>` : ''}
      ${r.twitter ? `<span>✕ ${r.twitter}</span>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Summary</div>
    <div class="summary">${r.summary}</div>
  </div>

  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-wrap">${r.skills.map((s: string) => `<span class="skill-tag">${s}</span>`).join('')}</div>
  </div>

  <div class="section">
    <div class="section-title">Open Source Projects</div>
    ${r.projects.map((p: { name: string; description: string; stars: number; url: string; tech: string }) => `
    <div class="project">
      <div class="project-header">
        <span class="project-name"><a href="${p.url}" target="_blank">${p.name}</a></span>
        ${p.stars ? `<span class="project-stars">★ ${p.stars.toLocaleString()}</span>` : ''}
      </div>
      ${p.tech ? `<div class="project-tech">${p.tech}</div>` : ''}
      <div class="project-desc">${p.description}</div>
    </div>`).join('')}
  </div>

  ${r.highlights?.length ? `
  <div class="section">
    <div class="section-title">Highlights</div>
    ${r.highlights.map((h: string) => `<div class="highlight">${h}</div>`).join('')}
  </div>` : ''}

  <div class="section">
    <div class="section-title">Languages & Technologies</div>
    <div class="lang-grid">${r.languages.map((l: string) => `<span class="lang-chip">${l}</span>`).join('')}</div>
  </div>

  <div class="wm-footer">
    <div class="wm-footer-dot"></div>
    <div class="wm-footer-label">Generated by Git<em>Folio</em></div>
  </div>
</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
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
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {/* Resume button */}
          <button
            onClick={generateResume}
            disabled={resumeLoading || loading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 border"
            style={{
              borderColor: resumeLoading ? 'var(--border)' : 'rgba(0,255,136,0.3)',
              background: resumeLoading ? 'var(--surface-2)' : 'rgba(0,255,136,0.06)',
              color: resumeLoading ? 'var(--text-muted)' : 'var(--accent)',
              cursor: resumeLoading || loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Syne, sans-serif',
            }}
            title="Generate & download resume as PDF"
          >
            {resumeLoading ? (
              <>
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                <span style={{ fontSize: '10px' }}>Building…</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span style={{ fontSize: '10px' }}>Resume</span>
              </>
            )}
          </button>

          {isSearching ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs" style={{ color: '#58a6ff', fontSize: '10px' }}>Searching web…</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Live</span>
            </>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                background: msg.role === 'user' ? 'rgba(88,166,255,0.08)' : 'var(--surface-2)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(88,166,255,0.18)' : 'var(--border)'}`,
                color: 'var(--text-secondary)',
                fontFamily: 'DM Mono, monospace',
                wordBreak: 'break-word',
              }}
            >
              {msg.content ? (
                <span dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>…</span>
              )}
              {/* Blinking cursor while streaming */}
              {msg.isStreaming && (
                <span
                  className="inline-block w-[2px] h-[12px] ml-[2px] align-middle animate-pulse"
                  style={{ background: 'var(--accent)', borderRadius: '1px' }}
                />
              )}
            </div>

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

        {/* Thinking indicator (before first token arrives) */}
        {loading && !messages.find((m) => m.isStreaming) && (
          <div className="flex gap-2 justify-start">
            <div
              className="w-5 h-5 rounded flex-shrink-0 mt-1 flex items-center justify-center text-xs"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,255,136,0.15)' }}
            >
              ◆
            </div>
            <div className="px-4 py-3 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
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
        <div className="px-3 pb-2 flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => sendMessage(p.prompt)}
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
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input area ── */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex items-end gap-2 rounded-xl border px-3 py-2 transition-all duration-200"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about @${username}...`}
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

          {/* Stop button while generating */}
          {loading ? (
            <button
              onClick={stopGeneration}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{ background: 'rgba(248,81,73,0.15)', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)' }}
              title="Stop generating"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                background: input.trim() ? 'var(--accent)' : 'var(--surface-3)',
                color: input.trim() ? '#000' : 'var(--text-muted)',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>
        <p className="mt-1.5 text-center" style={{ color: 'var(--text-muted)', fontSize: '9px', fontFamily: 'DM Mono, monospace' }}>
          Enter to send · Shift+Enter for newline · Powered by Llama 3.3 70B (Groq)
        </p>
      </div>
    </div>
  );
}