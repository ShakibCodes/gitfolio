'use client';

import { Repo } from '@/types/github';
import { getLangColor } from '@/lib/github';
import { Star, GitFork, ExternalLink, GitBranch, Calendar } from 'lucide-react';

interface RepoCardProps {
  repo: Repo;
  index: number;
  onSelectRepo: (repo: Repo) => void;
}

export default function RepoCard({ repo, index, onSelectRepo }: RepoCardProps) {
  const updatedAt = new Date(repo.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={() => onSelectRepo(repo)}
      className="glass-card-interactive rounded-xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
      style={{
        animationDelay: `${Math.min(0.3, index * 0.03)}s`,
      }}
    >
      <div>
        {/* Header: Name + Star count */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {repo.fork ? (
              <GitFork className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            ) : (
              <GitBranch className="w-3.5 h-3.5 text-emerald-400/80 flex-shrink-0" />
            )}
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors font-mono truncate">
              {repo.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {repo.stargazers_count > 0 && (
              <span className="flex items-center gap-1 text-xs font-mono text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>
                  {repo.stargazers_count >= 1000
                    ? `${(repo.stargazers_count / 1000).toFixed(1)}k`
                    : repo.stargazers_count}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {repo.description ? (
          <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
            {repo.description}
          </p>
        ) : (
          <p className="text-xs text-slate-600 italic mb-3">No description provided</p>
        )}

        {/* Topics preview */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400 font-mono"
              >
                #{topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="text-[10px] text-slate-600 font-mono">
                +{repo.topics.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/5 font-mono">
        <div className="flex items-center gap-3">
          {repo.language && (
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="lang-dot" style={{ background: getLangColor(repo.language) }} />
              <span className="text-[11px]">{repo.language}</span>
            </span>
          )}
          {repo.forks_count > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <GitFork className="w-3 h-3 text-slate-500" />
              <span>{repo.forks_count}</span>
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-500">{updatedAt}</span>
      </div>
    </div>
  );
}
