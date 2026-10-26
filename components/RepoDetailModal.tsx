'use client';

import { useState } from 'react';
import { Repo } from '@/types/github';
import { getLangColor } from '@/lib/github';
import {
  X,
  Star,
  GitFork,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  FolderGit2,
  AlertCircle,
  Globe,
  Tag,
  Shield,
} from 'lucide-react';

interface RepoDetailModalProps {
  repo: Repo | null;
  onClose: () => void;
}

export default function RepoDetailModal({ repo, onClose }: RepoDetailModalProps) {
  const [cloneType, setCloneType] = useState<'https' | 'ssh' | 'cli'>('https');
  const [copied, setCopied] = useState(false);

  if (!repo) return null;

  const cloneCommands = {
    https: `git clone ${repo.html_url}.git`,
    ssh: `git clone git@github.com:${repo.full_name || repo.name}.git`,
    cli: `gh repo clone ${repo.full_name || repo.name}`,
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedSize =
    repo.size >= 1024
      ? `${(repo.size / 1024).toFixed(1)} MB`
      : `${repo.size} KB`;

  const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
      <div
        className="relative w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono mb-2">
          <FolderGit2 className="w-3.5 h-3.5 text-neutral-400" />
          <span>Repository Dossier</span>
          {repo.fork && (
            <span className="px-1.5 py-0.2 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 text-[10px]">
              Fork
            </span>
          )}
          {repo.archived && (
            <span className="px-1.5 py-0.2 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 text-[10px]">
              Archived
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-white font-mono mb-2 break-all">
          {repo.name}
        </h2>

        {repo.description ? (
          <p className="text-sm text-neutral-400 leading-relaxed mb-5">
            {repo.description}
          </p>
        ) : (
          <p className="text-sm text-neutral-600 italic mb-5">
            No description provided.
          </p>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-2 mb-6">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-800 hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-mono transition-colors"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {repo.homepage && (
            <a
              href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-800 hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-mono transition-colors"
            >
              <Globe className="w-3 h-3" />
              <span>Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <div className="p-3 rounded-lg border border-neutral-900 bg-neutral-900/40 font-mono">
            <span className="text-[11px] text-neutral-500 block mb-1">Stars</span>
            <span className="text-lg font-bold text-white">
              {repo.stargazers_count.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-neutral-900 bg-neutral-900/40 font-mono">
            <span className="text-[11px] text-neutral-500 block mb-1">Forks</span>
            <span className="text-lg font-bold text-white">
              {repo.forks_count.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-neutral-900 bg-neutral-900/40 font-mono">
            <span className="text-[11px] text-neutral-500 block mb-1">Issues</span>
            <span className="text-lg font-bold text-white">
              {repo.open_issues_count.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-neutral-900 bg-neutral-900/40 font-mono">
            <span className="text-[11px] text-neutral-500 block mb-1">Disk Size</span>
            <span className="text-lg font-bold text-white">{formattedSize}</span>
          </div>
        </div>

        {/* Clone Command Box */}
        <div className="mb-6 font-mono">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neutral-500" />
              <span>Clone</span>
            </span>

            <div className="flex rounded bg-neutral-900 p-0.5 border border-neutral-800 text-[11px]">
              <button
                onClick={() => setCloneType('https')}
                className={`px-2 py-0.5 rounded ${
                  cloneType === 'https'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                HTTPS
              </button>
              <button
                onClick={() => setCloneType('ssh')}
                className={`px-2 py-0.5 rounded ${
                  cloneType === 'ssh'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                SSH
              </button>
              <button
                onClick={() => setCloneType('cli')}
                className={`px-2 py-0.5 rounded ${
                  cloneType === 'cli'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                CLI
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-neutral-800 text-xs text-neutral-300">
            <span className="truncate pr-3">{cloneCommands[cloneType]}</span>
            <button
              onClick={() => handleCopy(cloneCommands[cloneType])}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-3 h-3 text-neutral-200" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="mb-6">
            <span className="text-xs font-mono text-neutral-500 block mb-2">
              Topics
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {repo.topics.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-4 border-t border-neutral-900 font-mono">
          <div className="flex items-center gap-3">
            {repo.language && (
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: getLangColor(repo.language) }}
                />
                <span>{repo.language}</span>
              </span>
            )}
            {repo.license && (
              <span className="text-neutral-400">
                {repo.license.spdx_id || repo.license.name}
              </span>
            )}
          </div>
          <span>Updated {updatedDate}</span>
        </div>
      </div>
    </div>
  );
}
