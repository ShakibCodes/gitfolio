'use client';

import { useState, useMemo } from 'react';
import { Repo } from '@/types/github';
import RepoCard from './RepoCard';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  GitBranch,
  Star,
  ExternalLink,
} from 'lucide-react';

interface RepoExplorerProps {
  repos: Repo[];
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onSelectRepo: (repo: Repo) => void;
}

type SortOption = 'stars' | 'updated' | 'forks' | 'name';

export default function RepoExplorer({
  repos,
  selectedLanguage,
  onSelectLanguage,
  onSelectRepo,
}: RepoExplorerProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('stars');
  const [showForks, setShowForks] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Languages list
  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return ['All', ...Array.from(set).sort()];
  }, [repos]);

  // Filtered & sorted repos
  const filteredRepos = useMemo(() => {
    return repos
      .filter((r) => {
        const matchesLang = selectedLanguage === 'All' || r.language === selectedLanguage;
        const matchesSearch =
          !search ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
          (r.topics && r.topics.some((t) => t.toLowerCase().includes(search.toLowerCase())));
        const matchesForks = showForks || !r.fork;
        return matchesLang && matchesSearch && matchesForks;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        if (sortBy === 'forks') return (b.forks_count || 0) - (a.forks_count || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [repos, selectedLanguage, search, showForks, sortBy]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search repositories by name, topic, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500/50 transition-colors font-mono"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: Filters & View Modes */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language filter select */}
          <div className="relative flex items-center">
            <select
              value={selectedLanguage}
              onChange={(e) => onSelectLanguage(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              {allLanguages.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                  {lang === 'All' ? 'All Languages' : lang}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="relative flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="stars" className="bg-slate-900 text-slate-200">
                Most Stars
              </option>
              <option value="updated" className="bg-slate-900 text-slate-200">
                Recently Updated
              </option>
              <option value="forks" className="bg-slate-900 text-slate-200">
                Most Forks
              </option>
              <option value="name" className="bg-slate-900 text-slate-200">
                Repository Name
              </option>
            </select>
          </div>

          {/* Toggle Forks Button */}
          <button
            onClick={() => setShowForks(!showForks)}
            className={`px-3 py-2 rounded-xl text-xs border transition-all ${
              !showForks
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showForks ? 'Forks: On' : 'Forks: Hidden'}
          </button>

          {/* View mode toggle */}
          <div className="hidden sm:flex rounded-xl bg-slate-900/80 p-0.5 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredRepos.length}</strong> of {repos.length} repositories
        </span>
        {selectedLanguage !== 'All' && (
          <button
            onClick={() => onSelectLanguage('All')}
            className="text-emerald-400 hover:underline"
          >
            Reset filter ({selectedLanguage})
          </button>
        )}
      </div>

      {/* Grid or List of Repos */}
      {filteredRepos.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
          <p className="text-sm text-slate-400 mb-2">No matching repositories found</p>
          <button
            onClick={() => {
              setSearch('');
              onSelectLanguage('All');
              setShowForks(true);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/20"
          >
            Reset all search filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRepos.map((repo, idx) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              index={idx}
              onSelectRepo={onSelectRepo}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => onSelectRepo(repo)}
              className="p-3.5 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-100 hover:text-emerald-400 font-mono truncate">
                    {repo.name}
                  </h4>
                  {repo.language && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-slate-400 font-mono">
                      {repo.language}
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{repo.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-shrink-0">
                {repo.stargazers_count > 0 && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{repo.stargazers_count}</span>
                  </span>
                )}
                <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
