'use client';

import { useState } from 'react';
import { GitHubUser, DevMetrics } from '@/types/github';
import {
  MapPin,
  Building,
  Link as LinkIcon,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Briefcase,
  Star,
  Users,
  FolderGit2,
} from 'lucide-react';
import { TwitterIcon } from '@/components/Icons';

interface ProfileCardProps {
  user: GitHubUser;
  metrics?: DevMetrics;
}

export default function ProfileCard({ user, metrics }: ProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const blogUrl = user.blog
    ? user.blog.startsWith('http')
      ? user.blog
      : `https://${user.blog}`
    : '';

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 font-sans">
      {/* Top Header / Avatar + Names */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-white truncate">
              {user.name || user.login}
            </h2>
            {user.hireable && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                <Briefcase className="w-2.5 h-2.5" /> Available
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <a
              href={user.html_url || `https://github.com/${user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 hover:text-white font-mono flex items-center gap-1 transition-colors"
            >
              @{user.login}
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-xs text-neutral-700">•</span>
            <span className="text-xs text-neutral-500 font-mono">
              Joined {joinDate}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded border border-neutral-800 hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-neutral-200" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            <a
              href={`https://github.com/${user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded border border-neutral-800 hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-xs text-neutral-400 leading-relaxed mb-4 pb-4 border-b border-neutral-900">
          {user.bio}
        </p>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="p-2.5 rounded-lg border border-neutral-900 bg-neutral-900/40 text-center">
          <span className="text-[11px] font-mono text-neutral-500 block mb-0.5">Repos</span>
          <span className="text-base font-bold text-white font-mono">
            {user.public_repos.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-lg border border-neutral-900 bg-neutral-900/40 text-center">
          <span className="text-[11px] font-mono text-neutral-500 block mb-0.5">Stars</span>
          <span className="text-base font-bold text-white font-mono">
            {metrics ? metrics.totalStars.toLocaleString() : '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg border border-neutral-900 bg-neutral-900/40 text-center">
          <span className="text-[11px] font-mono text-neutral-500 block mb-0.5">Followers</span>
          <span className="text-base font-bold text-white font-mono">
            {user.followers >= 1000
              ? `${(user.followers / 1000).toFixed(1)}k`
              : user.followers.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-lg border border-neutral-900 bg-neutral-900/40 text-center">
          <span className="text-[11px] font-mono text-neutral-500 block mb-0.5">Following</span>
          <span className="text-base font-bold text-white font-mono">
            {user.following.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Meta details list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-400">
        {user.company && (
          <div className="flex items-center gap-2 truncate">
            <Building className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
            <span className="truncate">{user.company}</span>
          </div>
        )}
        {user.location && (
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
            <span className="truncate">{user.location}</span>
          </div>
        )}
        {blogUrl && (
          <div className="flex items-center gap-2 truncate">
            <LinkIcon className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
            <a
              href={blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 hover:text-white hover:underline truncate"
            >
              {user.blog.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {user.twitter_username && (
          <div className="flex items-center gap-2 truncate">
            <TwitterIcon className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
            <a
              href={`https://twitter.com/${user.twitter_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 hover:text-white hover:underline truncate"
            >
              @{user.twitter_username}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
