'use client';

import { useState } from 'react';
import { Repo } from '@/types/github';
import { getLangColor } from '@/lib/github';
import { Star, GitFork, ExternalLink, Copy, Check, Terminal, ShieldAlert } from 'lucide-react';

interface TopRepoProps {
  repo: Repo;
  onSelectRepo?: (repo: Repo) => void;
}

export default function TopRepo({ repo, onSelectRepo }: TopRepoProps) {
  const [copiedClone, setCopiedClone] = useState(false);
  const updatedAt = new Date(repo.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCopyClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`git clone ${repo.html_url}.git`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div
      onClick={() => onSelectRepo?.(repo)}
      className="glass-card-interactive rounded-2xl p-5 border border-emerald-500/30 relative overflow-hidden group cursor-pointer"
    >
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
          <span>Flagship Repository</span>
        </div>

        <button
          onClick={handleCopyClone}
          title="Copy clone command"
          className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
        >
          {copiedClone ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Terminal className="w-3 h-3" />
          )}
          <span>{copiedClone ? 'Copied clone!' : 'git clone'}</span>
        </button>
      </div>

      {/* Repo title */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors font-mono truncate">
          {repo.name}
        </h3>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
          {repo.description}
        </p>
      )}

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repo.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-cyan-300 font-mono"
            >
              #{topic}
            </span>
          ))}
          {repo.topics.length > 5 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full text-slate-500 font-mono">
              +{repo.topics.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-white/5">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span
              className="lang-dot"
              style={{ background: getLangColor(repo.language) }}
            />
            <span className="text-slate-200 font-medium">{repo.language}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-amber-400 font-mono">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{repo.stargazers_count.toLocaleString()}</span>
        </div>

        {repo.forks_count > 0 && (
          <div className="flex items-center gap-1 font-mono">
            <GitFork className="w-3.5 h-3.5 text-slate-500" />
            <span>{repo.forks_count.toLocaleString()}</span>
          </div>
        )}

        {repo.license && (
          <span className="text-[11px] text-slate-400 border border-white/10 px-1.5 py-0.5 rounded">
            {repo.license.spdx_id || repo.license.name}
          </span>
        )}

        <span className="ml-auto text-[11px] text-slate-500">Updated {updatedAt}</span>
      </div>
    </div>
  );
}
