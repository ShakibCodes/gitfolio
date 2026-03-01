'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProfileCard from '@/components/ProfileCard';
import TopRepo from '@/components/TopRepo';
import RepoCard from '@/components/RepoCard';
import HeatMap from '@/components/Heatmap';
import AiChat from '@/components/Aichat';
import LanguageBar from '@/components/LanguageBar';



interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  company: string;
  location: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface Repo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  topics: string[];
  updated_at: string;
  open_issues_count: number;
  fork: boolean;
}

type SortKey = 'stars' | 'updated' | 'forks';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('stars');
  const [langFilter, setLangFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, repoRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
        ]);
        if (!userRes.ok) throw new Error('User not found');
        const userData = await userRes.json();
        const repoData = await repoRes.json();
        setUser(userData);
        setRepos(Array.isArray(repoData) ? repoData : []);
      } catch (e) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  const topRepo = repos.reduce<Repo | null>((best, r) => {
    if (!best || r.stargazers_count > best.stargazers_count) return r;
    return best;
  }, null);

  const allLanguages = ['All', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean)))];

  const filteredRepos = repos
    .filter(r => {
      const matchLang = langFilter === 'All' || r.language === langFilter;
      const matchSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLang && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
      if (sortBy === 'forks') return b.forks_count - a.forks_count;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  if (loading) {
    return (
      <div
        className="min-h-screen bg-grid flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
            Loading @{username}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="text-sm px-4 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top navbar */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 border-b glass"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}
        >
          <span style={{ color: 'var(--accent)' }}>←</span>
          <span className="hidden sm:inline">Git<span style={{ color: 'var(--accent)' }}>Folio</span></span>
        </button>

        {/* Username pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)', fontFamily: 'DM Mono, monospace' }}
        >
          <img src={user.avatar_url} alt={user.login} className="w-4 h-4 rounded-full" />
          <span style={{ color: 'var(--text-primary)' }}>@{user.login}</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:border-opacity-60"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View GitHub
          </a>

          {/* AI toggle (mobile) */}
          <button
            onClick={() => setAiOpen(!aiOpen)}
            className="lg:hidden flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
            style={{
              borderColor: aiOpen ? 'rgba(0,255,136,0.4)' : 'var(--border)',
              color: aiOpen ? 'var(--accent)' : 'var(--text-secondary)',
              background: aiOpen ? 'var(--accent-dim)' : 'var(--surface)',
            }}
          >
            <span>◆</span>
            <span>{aiOpen ? 'Close AI' : 'AI Chat'}</span>
          </button>
        </div>
      </nav>

      {/* Main 70/30 split */}
      <div className="flex h-[calc(100vh-53px)]">
        {/* LEFT: Main content (70%) */}
        <div
          className={`flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 ${aiOpen ? 'hidden lg:block' : 'block'}`}
          style={{ maxWidth: aiOpen ? '100%' : '100%' }}
        >
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Profile + Top Repo row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileCard user={user} />
              <div className="space-y-4">
                {topRepo && <TopRepo repo={topRepo} />}
                <LanguageBar repos={repos} />
              </div>
            </div>

            {/* Heatmap */}
            <HeatMap username={username} />

            {/* Repos section */}
            <div>
              {/* Repos header + controls */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                    Repositories
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {filteredRepos.length} of {repos.length} shown
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  {/* Search */}
                  <div
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs outline-none w-24"
                      style={{ color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace' }}
                    />
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="px-2.5 py-1.5 rounded-lg border text-xs outline-none cursor-pointer"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'DM Mono, monospace',
                    }}
                  >
                    <option value="stars">★ Stars</option>
                    <option value="updated">⟳ Updated</option>
                    <option value="forks">⑂ Forks</option>
                  </select>

                  {/* Language filter */}
                  <select
                    value={langFilter}
                    onChange={(e) => setLangFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border text-xs outline-none cursor-pointer max-w-[100px]"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'DM Mono, monospace',
                    }}
                  >
                    {allLanguages.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Repo grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredRepos.map((repo, i) => (
                  <RepoCard key={repo.id} repo={repo} index={i} />
                ))}
              </div>

              {filteredRepos.length === 0 && (
                <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                  <p className="text-sm">No repositories found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Chat panel (30%) */}
        <div
          className={`
            ${aiOpen ? 'fixed inset-0 z-40 flex flex-col lg:relative lg:inset-auto lg:flex' : 'hidden lg:flex lg:flex-col'}
            lg:w-[320px] xl:w-[360px] flex-shrink-0 border-l
          `}
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          {/* Mobile close bar */}
          <div
            className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <span className="text-xs font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
              AI Chat
            </span>
            <button
              onClick={() => setAiOpen(false)}
              className="text-xs px-3 py-1 rounded-lg border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              ✕ Close
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AiChat
              username={username}
              repos={repos}
              userData={{
                name: user.name,
                bio: user.bio,
                public_repos: user.public_repos,
                followers: user.followers,
                following: user.following,
                company: user.company,
                location: user.location,
                blog: user.blog,
                twitter_username: user.twitter_username,
                created_at: user.created_at,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}