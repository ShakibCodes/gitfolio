'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  TrendingUp,
  History,
  Swords,
  Briefcase,
  Bot,
  Award,
  Terminal,
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
    role: 'Open Source Contributor',
    stack: 'TypeScript, Node.js',
    avatar: 'https://github.com/sindresorhus.png',
  },
];

export default function SearchPage() {
  const [username, setUsername] = useState('');
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
      setError(`GitHub user "${val}" was not found.`);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-neutral-200 flex flex-col justify-between px-6 py-6 font-sans">
      {/* Top Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-2.5">
          {/* Vercel-style clean triangle symbol */}
          <div className="w-4 h-4 flex items-center justify-center">
            <svg viewBox="0 0 76 65" fill="currentColor" className="w-3.5 h-3.5 text-white">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">
            GitFolio
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-800 bg-neutral-950 text-neutral-400">
            2.0
          </span>
        </div>

        <a
          href="https://github.com/shakibCodes/gitfolio"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-800 hover:border-neutral-700 bg-neutral-950 hover:bg-neutral-900 text-xs text-neutral-300 transition-colors font-mono"
        >
          <GithubIcon className="w-3.5 h-3.5" />
          <span>Star on GitHub</span>
        </a>
      </header>

      {/* Hero Center */}
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center my-auto py-16 space-y-7">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-950 text-neutral-300 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
          <span>Developer Intelligence & Showcase Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-2xl leading-[1.1]">
          Evaluate, showcase, and compare GitHub profiles.
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
          Algorithmic developer scores, client-ready portfolio generation, side-by-side engineering battles, and AI-driven recruiter dossiers.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-lg pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative"
          >
            <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-950 hover:border-neutral-700 focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-500 transition-all p-1.5 shadow-2xl">
              <div className="pl-3 pr-2 text-neutral-500 font-mono text-xs">
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
                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-600 outline-none font-mono"
              />

              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-white hover:bg-neutral-200 text-black font-medium text-xs transition-colors disabled:opacity-40"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <p className="text-xs text-neutral-400 mt-2 font-mono text-left pl-2">
              {error}
            </p>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap text-left pl-1">
              <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                <History className="w-3 h-3" /> Recent:
              </span>
              {recentSearches.map((h) => (
                <button
                  key={h}
                  onClick={() => handleSearch(h)}
                  className="text-xs font-mono px-2 py-0.5 rounded border border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-400 hover:text-white transition-colors"
                >
                  @{h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Featured Profiles */}
        <div className="w-full pt-6">
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-3">
            Featured Profiles
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {FEATURED_DEVELOPERS.map((dev) => (
              <div
                key={dev.handle}
                onClick={() => handleSearch(dev.handle)}
                className="rounded-lg p-3 border border-neutral-900 hover:border-neutral-700 bg-neutral-950 hover:bg-neutral-900/60 text-left cursor-pointer transition-all group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden mb-2 border border-neutral-800">
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xs font-medium text-neutral-200 group-hover:text-white truncate font-mono">
                  @{dev.handle}
                </h4>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">{dev.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Feature Grid */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 py-6 border-t border-neutral-900">
        <div className="p-4 rounded-lg border border-neutral-900 bg-neutral-950">
          <div className="flex items-center gap-2 mb-1.5">
            <Award className="w-4 h-4 text-neutral-300" />
            <h4 className="text-xs font-semibold text-neutral-200">Developer Index</h4>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Algorithmic 0–100 score evaluating output, velocity, and reach.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-neutral-900 bg-neutral-950">
          <div className="flex items-center gap-2 mb-1.5">
            <Briefcase className="w-4 h-4 text-neutral-300" />
            <h4 className="text-xs font-semibold text-neutral-200">Portfolio & PDF Resume</h4>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Client-ready showcase view with built-in printable 1-page CV export.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-neutral-900 bg-neutral-950">
          <div className="flex items-center gap-2 mb-1.5">
            <Swords className="w-4 h-4 text-neutral-300" />
            <h4 className="text-xs font-semibold text-neutral-200">Versus Mode</h4>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Head-to-head comparison benchmarking two engineers side-by-side.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-neutral-900 bg-neutral-950">
          <div className="flex items-center gap-2 mb-1.5">
            <Bot className="w-4 h-4 text-neutral-300" />
            <h4 className="text-xs font-semibold text-neutral-200">AI Intelligence</h4>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Contextual code roasts, compensation estimates, and role dossiers.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-neutral-600 font-mono py-2">
        GitFolio • Powered by Next.js & GitHub API
      </footer>
    </main>
  );
}
