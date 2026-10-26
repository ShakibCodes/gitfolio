'use client';

import { Repo } from '@/types/github';
import { getLangColor } from '@/lib/github';
import { Star, GitFork, GitBranch } from 'lucide-react';

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
      className="rounded-lg border border-neutral-800 bg-neutral-950 hover:border-neutral-600 hover:bg-neutral-900/50 p-4 transition-all cursor-pointer flex flex-col justify-between font-sans group"
    >
      <div>
        {/* Header: Name + Star count */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {repo.fork ? (
              <GitFork className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
            ) : (
              <GitBranch className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            )}
            <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors font-mono truncate">
              {repo.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {repo.stargazers_count > 0 && (
              <span className="flex items-center gap-1 text-xs font-mono text-neutral-300">
                <Star className="w-3 h-3 text-neutral-400" />
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
          <p className="text-xs text-neutral-400 leading-relaxed mb-3 line-clamp-2">
            {repo.description}
          </p>
        ) : (
          <p className="text-xs text-neutral-600 italic mb-3">No description</p>
        )}

        {/* Topics preview */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono"
              >
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-900 font-mono">
        <div className="flex items-center gap-3">
          {repo.language && (
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: getLangColor(repo.language) }}
              />
              <span className="text-[11px]">{repo.language}</span>
            </span>
          )}
          {repo.forks_count > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <GitFork className="w-3 h-3 text-neutral-500" />
              <span>{repo.forks_count}</span>
            </span>
          )}
        </div>

        <span className="text-[10px] text-neutral-500">{updatedAt}</span>
      </div>
    </div>
  );
}
