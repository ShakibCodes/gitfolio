'use client';

import { useState, useMemo } from 'react';
import { Repo } from '@/types/github';
import RepoCard from './RepoCard';
import { Search, LayoutGrid, List, Star } from 'lucide-react';

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

  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return ['All', ...Array.from(set).sort()];
  }, [repos]);

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
    <div className="space-y-4 font-sans">
      {/* Controls Bar */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 outline-none focus:border-neutral-600 transition-colors font-mono"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap font-mono">
          <select
            value={selectedLanguage}
            onChange={(e) => onSelectLanguage(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 outline-none cursor-pointer hover:border-neutral-700"
          >
            {allLanguages.map((lang) => (
              <option key={lang} value={lang} className="bg-black text-neutral-200">
                {lang === 'All' ? 'All Languages' : lang}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-2.5 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 outline-none cursor-pointer hover:border-neutral-700"
          >
            <option value="stars" className="bg-black text-neutral-200">
              Stars
            </option>
            <option value="updated" className="bg-black text-neutral-200">
              Updated
            </option>
            <option value="forks" className="bg-black text-neutral-200">
              Forks
            </option>
            <option value="name" className="bg-black text-neutral-200">
              Name
            </option>
          </select>

          <button
            onClick={() => setShowForks(!showForks)}
            className={`px-2.5 py-1.5 rounded-md text-xs border transition-colors ${
              !showForks
                ? 'bg-neutral-800 border-neutral-600 text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {showForks ? 'Forks: On' : 'Forks: Off'}
          </button>

          <div className="hidden sm:flex rounded-md bg-neutral-900 p-0.5 border border-neutral-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1 font-mono">
        <span>
          Showing {filteredRepos.length} of {repos.length} repositories
        </span>
        {selectedLanguage !== 'All' && (
          <button
            onClick={() => onSelectLanguage('All')}
            className="text-neutral-300 hover:underline"
          >
            Reset filter ({selectedLanguage})
          </button>
        )}
      </div>

      {/* Grid or List */}
      {filteredRepos.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-12 text-center">
          <p className="text-sm text-neutral-400 mb-2">No matching repositories found</p>
          <button
            onClick={() => {
              setSearch('');
              onSelectLanguage('All');
              setShowForks(true);
            }}
            className="text-xs px-3 py-1.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-300 font-mono hover:text-white"
          >
            Reset filters
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
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 divide-y divide-neutral-900 overflow-hidden">
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => onSelectRepo(repo)}
              className="p-3.5 hover:bg-neutral-900/50 transition-colors cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-neutral-200 hover:text-white font-mono truncate">
                    {repo.name}
                  </h4>
                  {repo.language && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 font-mono">
                      {repo.language}
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs text-neutral-500 truncate mt-0.5">{repo.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono flex-shrink-0">
                {repo.stargazers_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-neutral-400" />
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
