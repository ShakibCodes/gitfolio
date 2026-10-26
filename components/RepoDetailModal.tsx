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
  Calendar,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl glass-card rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-2">
          <FolderGit2 className="w-4 h-4 text-emerald-400" />
          <span>Repository Dossier</span>
          {repo.fork && (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              Forked
            </span>
          )}
          {repo.archived && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px]">
              Archived
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-mono mb-2 break-all">
          {repo.name}
        </h2>

        {repo.description ? (
          <p className="text-sm text-slate-300 leading-relaxed mb-5">
            {repo.description}
          </p>
        ) : (
          <p className="text-sm text-slate-500 italic mb-5">
            No repository description provided.
          </p>
        )}

        {/* Quick Links (Homepage / GitHub) */}
        <div className="flex flex-wrap gap-2 mb-6">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {repo.homepage && (
            <a
              href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 text-amber-400" /> Stars
            </span>
            <span className="text-lg font-bold font-mono text-slate-100">
              {repo.stargazers_count.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <GitFork className="w-3 h-3 text-slate-400" /> Forks
            </span>
            <span className="text-lg font-bold font-mono text-slate-100">
              {repo.forks_count.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3 text-slate-400" /> Open Issues
            </span>
            <span className="text-lg font-bold font-mono text-slate-100">
              {repo.open_issues_count.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Tag className="w-3 h-3 text-slate-400" /> Size
            </span>
            <span className="text-lg font-bold font-mono text-slate-100">
              {formattedSize}
            </span>
          </div>
        </div>

        {/* Clone Command Box */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clone Repository</span>
            </span>

            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-white/10 text-[11px] font-mono">
              <button
                onClick={() => setCloneType('https')}
                className={`px-2 py-0.5 rounded-md ${
                  cloneType === 'https'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                HTTPS
              </button>
              <button
                onClick={() => setCloneType('ssh')}
                className={`px-2 py-0.5 rounded-md ${
                  cloneType === 'ssh'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SSH
              </button>
              <button
                onClick={() => setCloneType('cli')}
                className={`px-2 py-0.5 rounded-md ${
                  cloneType === 'cli'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CLI
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-slate-300">
            <span className="truncate pr-3">{cloneCommands[cloneType]}</span>
            <button
              onClick={() => handleCopy(cloneCommands[cloneType])}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="mb-6">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Topics & Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {repo.topics.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-cyan-300 font-mono"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5 font-mono">
          <div className="flex items-center gap-3">
            {repo.language && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="lang-dot" style={{ background: getLangColor(repo.language) }} />
                <span>{repo.language}</span>
              </span>
            )}
            {repo.license && (
              <span className="flex items-center gap-1 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>{repo.license.spdx_id || repo.license.name}</span>
              </span>
            )}
          </div>
          <span>Updated {updatedDate}</span>
        </div>
      </div>
    </div>
  );
}
