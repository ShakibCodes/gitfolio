'use client';

import Image from 'next/image';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  company: string;
  location: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface ProfileCardProps {
  user: GitHubUser;
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg border"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
      <span className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
        {typeof value === 'number' && value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
      </span>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const joinYear = new Date(user.created_at).getFullYear();

  return (
    <div
      className="animate-slide-left rounded-2xl border p-5 hover-lift"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-16 h-16 rounded-2xl overflow-hidden border-2"
            style={{ borderColor: 'var(--accent)', boxShadow: '0 0 20px rgba(0,255,136,0.2)' }}
          >
            <img
              src={user.avatar_url}
              alt={user.login}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 bg-green-400"
            style={{ borderColor: 'var(--surface)' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2
            className="text-lg font-bold truncate leading-tight"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
          >
            {user.name || user.login}
          </h2>
          <a
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors hover:opacity-80"
            style={{ color: 'var(--accent-blue)', fontFamily: 'DM Mono, monospace' }}
          >
            @{user.login}
          </a>
          <div className="mt-1">
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}>
              Since {joinYear}
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-xs leading-relaxed mb-4 pb-4 border-b" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
          {user.bio}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatPill label="Repos" value={user.public_repos} />
        <StatPill label="Followers" value={user.followers} />
        <StatPill label="Following" value={user.following} />
      </div>

      {/* Meta info */}
      <div className="space-y-2">
        {user.company && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>◈</span>
            <span className="truncate">{user.company}</span>
          </div>
        )}
        {user.location && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>◎</span>
            <span className="truncate">{user.location}</span>
          </div>
        )}
        {user.blog && (
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: 'var(--text-muted)' }}>⌘</span>
            <a
              href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:opacity-70 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              {user.blog.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {user.twitter_username && (
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: 'var(--text-muted)' }}>✕</span>
            <a
              href={`https://twitter.com/${user.twitter_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              @{user.twitter_username}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}