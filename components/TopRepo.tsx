'use client';

import { useState } from 'react';
import { Repo } from '@/types/github';
import { getLangColor } from '@/lib/github';
import { Star, GitFork, ExternalLink, Check, Terminal } from 'lucide-react';

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
      className="rounded-xl border border-neutral-800 bg-neutral-950 hover:border-neutral-700 p-5 cursor-pointer transition-colors font-sans"
    >
      {/* Top Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-300">
          Featured Repository
        </span>

        <button
          onClick={handleCopyClone}
          title="Copy clone command"
          className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
        >
          {copiedClone ? (
            <Check className="w-3 h-3 text-neutral-200" />
          ) : (
            <Terminal className="w-3 h-3" />
          )}
          <span>{copiedClone ? 'Copied' : 'git clone'}</span>
        </button>
      </div>

      {/* Repo title */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-semibold text-white font-mono truncate">
          {repo.name}
        </h3>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded text-neutral-500 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
          {repo.description}
        </p>
      )}

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono"
            >
              #{topic}
            </span>
          ))}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-neutral-400 pt-3 border-t border-neutral-900 font-mono">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: getLangColor(repo.language) }}
            />
            <span className="text-neutral-300">{repo.language}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-neutral-300">
          <Star className="w-3 h-3 text-neutral-400" />
          <span>{repo.stargazers_count.toLocaleString()}</span>
        </div>

        {repo.forks_count > 0 && (
          <div className="flex items-center gap-1 text-neutral-400">
            <GitFork className="w-3 h-3 text-neutral-500" />
            <span>{repo.forks_count.toLocaleString()}</span>
          </div>
        )}

        {repo.license && (
          <span className="text-[11px] text-neutral-500 border border-neutral-800 px-1.5 py-0.2 rounded">
            {repo.license.spdx_id || repo.license.name}
          </span>
        )}

        <span className="ml-auto text-[11px] text-neutral-500">{updatedAt}</span>
      </div>
    </div>
  );
}
