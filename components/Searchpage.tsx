'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  History,
  Swords,
  Briefcase,
  Bot,
  Award,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

const FEATURED_DEVELOPERS = [
  {
    handle: 'shadcn',
    name: 'shadcn',
    role: 'Creator of shadcn/ui',
    stack: 'TypeScript, React',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    handle: 'torvalds',
    name: 'Linus Torvalds',
    role: 'Creator of Linux & Git',
    stack: 'C, Systems',
    avatar: 'https://github.com/torvalds.png',
  },
  {
    handle: 'gaearon',
    name: 'Dan Abramov',
    role: 'Co-creator of Redux',
    stack: 'JavaScript, React',
    avatar: 'https://github.com/gaearon.png',
  },
  {
    handle: 'antfu',
    name: 'Anthony Fu',
    role: 'Vue & Vite Core Contributor',
    stack: 'TypeScript, Vue',
    avatar: 'https://github.com/antfu.png',
  },
  {
    handle: 'sindresorhus',
    name: 'Sindre Sorhus',
    role: 'Prolific Open Source Titan',
    stack: 'TypeScript, Node.js',
    avatar: 'https://github.com/sindresorhus.png',
  },
];

export default function SearchPage() {
  const [username, setUsername] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
    try {
      const saved = localStorage.getItem('gitfolio_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 6));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveToRecent = (handle: string) => {
    try {
      const updated = [handle, ...recentSearches.filter((h) => h.toLowerCase() !== handle.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem('gitfolio_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSearch = async (targetUser?: string) => {
    const val = (targetUser || username).trim().replace(/^@/, '');
    if (!val) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`https://api.github.com/users/${val}`);
      if (!res.ok) throw new Error('User not found');
      saveToRecent(val);
      router.push(`/dashboard/${val}`);
    } catch {
      setError(`GitHub user "@${val}" was not found. Please try another handle.`);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07090e] bg-grid text-slate-100 flex flex-col items-center justify-between px-4 py-8 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-500/15 via-cyan-500/15 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="w-full max-w-6xl flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
          <span className="font-extrabold text-base tracking-tight text-white">
            Git<span className="text-emerald-400">Folio</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ml-1">
            2.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/shakibCodes/gitfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-xs text-slate-300 hover:text-white border border-white/10 hover:border-emerald-500/30 transition-all font-mono"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Star on GitHub</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center my-auto py-10 relative z-10 space-y-6">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Developer Intelligence & Showcase Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Turn Any GitHub Profile Into a{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            High-Value Portfolio
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
          Unlock algorithmic developer scoring, AI hiring dossiers, instant 1-click printable resumes, and side-by-side 1v1 developer battles.
        </p>

        {/* Search Input Box */}
        <div className="w-full max-w-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative"
          >
            <div
              className={`flex items-center rounded-2xl glass-card border transition-all duration-300 p-2 ${
                focused
                  ? 'border-emerald-500/60 shadow-2xl shadow-emerald-500/15'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="pl-3 pr-2 text-slate-500 font-mono text-sm font-bold">
                github.com/
              </div>

              <input
                ref={inputRef}
                type="text"
                placeholder="username (e.g. shadcn)"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-600 outline-none font-mono"
              />

              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <p className="text-xs text-red-400 mt-2 font-mono text-left pl-3">
              {error}
            </p>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap text-left pl-1">
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <History className="w-3 h-3" /> Recent:
              </span>
              {recentSearches.map((h) => (
                <button
                  key={h}
                  onClick={() => handleSearch(h)}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-400 border border-white/5 transition-all"
                >
                  @{h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Featured Developer Avatars */}
        <div className="w-full pt-6">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trending Open Source Titans</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {FEATURED_DEVELOPERS.map((dev) => (
              <div
                key={dev.handle}
                onClick={() => handleSearch(dev.handle)}
                className="glass-card-interactive rounded-xl p-3 border border-white/10 hover:border-emerald-500/40 text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden mx-auto mb-2 border border-white/10 group-hover:border-emerald-400 transition-colors">
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 truncate font-mono">
                  @{dev.handle}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{dev.role}</p>
                <span className="text-[9px] text-emerald-400/80 font-mono block mt-1">
                  {dev.stack}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Highlights Ribbon */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-white/5 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Developer Score 2.0</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              0-100 index rating with 5-pillar velocity & consistency analysis.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Showcase & Resume Mode</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Transform stats into a client-ready portfolio & 1-page PDF CV.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">1v1 Developer Versus</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Battle two developers head-to-head on stars, streaks, and output.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">AI Intelligence Suite</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instant code roasts, salary estimates, and recruiter dossiers.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-slate-500 font-mono py-2 relative z-10">
        GitFolio • The Developer Intelligence Platform
      </footer>
    </main>
  );
}
