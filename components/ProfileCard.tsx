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
    <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
      {/* Top Header / Avatar + Names */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0 group">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10 transition-transform duration-300 group-hover:scale-105">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Active Status Beacon */}
          <span
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 bg-emerald-400"
            title="Active GitHub User"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 truncate">
              {user.name || user.login}
            </h2>
            {user.hireable && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Briefcase className="w-2.5 h-2.5" /> Available for Hire
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <a
              href={user.html_url || `https://github.com/${user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
            >
              @{user.login}
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Joined {joinDate}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied Link!' : 'Share'}</span>
            </button>
            <a
              href={`https://github.com/${user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all font-medium"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 pb-4 border-b border-white/5">
          {user.bio}
        </p>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Repos</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-100 font-mono">
            {user.public_repos.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Stars</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-100 font-mono">
            {metrics ? metrics.totalStars.toLocaleString() : '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Followers</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-100 font-mono">
            {user.followers >= 1000
              ? `${(user.followers / 1000).toFixed(1)}k`
              : user.followers.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Following</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-100 font-mono">
            {user.following.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Meta details list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
        {user.company && (
          <div className="flex items-center gap-2 truncate">
            <Building className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate">{user.company}</span>
          </div>
        )}
        {user.location && (
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate">{user.location}</span>
          </div>
        )}
        {blogUrl && (
          <div className="flex items-center gap-2 truncate">
            <LinkIcon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <a
              href={blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline truncate"
            >
              {user.blog.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {user.twitter_username && (
          <div className="flex items-center gap-2 truncate">
            <TwitterIcon className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
            <a
              href={`https://twitter.com/${user.twitter_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline truncate"
            >
              @{user.twitter_username}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
