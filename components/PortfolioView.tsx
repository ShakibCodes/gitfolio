'use client';

import { GitHubUser, Repo, DevMetrics } from '@/types/github';
import { getLangColor } from '@/lib/github';
import {
  Printer,
  ExternalLink,
  Star,
  GitFork,
  MapPin,
  Building,
  Globe,
  ArrowLeft,
} from 'lucide-react';
import { TwitterIcon } from '@/components/Icons';

interface PortfolioViewProps {
  user: GitHubUser;
  repos: Repo[];
  metrics: DevMetrics;
  onExitPortfolio: () => void;
}

export default function PortfolioView({
  user,
  repos,
  metrics,
  onExitPortfolio,
}: PortfolioViewProps) {
  const topProjects = [...repos]
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 6);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 font-sans">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between pb-4 border-b border-neutral-900">
        <button
          onClick={onExitPortfolio}
          className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Portfolio View</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF Resume</span>
        </button>
      </div>

      {/* Portfolio Header */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 flex-shrink-0">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400">
                {metrics.archetype}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-200 font-bold">
                {metrics.tier}-TIER ({metrics.score}/100)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {user.name || user.login}
            </h1>

            <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
              {user.bio ||
                `Software engineer specializing in ${metrics.primaryLanguage} and distributed web platforms.`}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-2 font-mono">
              {user.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                  {user.location}
                </span>
              )}
              {user.company && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-neutral-600" />
                  {user.company}
                </span>
              )}
              {user.blog && (
                <a
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-neutral-300 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5 text-neutral-600" />
                  {user.blog.replace(/^https?:\/\//, '')}
                </a>
              )}
              {user.twitter_username && (
                <a
                  href={`https://twitter.com/${user.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-neutral-300 hover:underline"
                >
                  <TwitterIcon className="w-3.5 h-3.5 text-neutral-600" />
                  @{user.twitter_username}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-center">
          <span className="text-[11px] text-neutral-500 font-mono block mb-1">Total Stars</span>
          <span className="text-xl sm:text-2xl font-bold text-white font-mono">
            {metrics.totalStars.toLocaleString()}★
          </span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-center">
          <span className="text-[11px] text-neutral-500 font-mono block mb-1">Public Repos</span>
          <span className="text-xl sm:text-2xl font-bold text-white font-mono">
            {user.public_repos.toLocaleString()}
          </span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-center">
          <span className="text-[11px] text-neutral-500 font-mono block mb-1">Best Streak</span>
          <span className="text-xl sm:text-2xl font-bold text-white font-mono">
            {metrics.longestStreak} Days
          </span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-center">
          <span className="text-[11px] text-neutral-500 font-mono block mb-1">Index Rating</span>
          <span className="text-xl sm:text-2xl font-bold text-white font-mono">
            {metrics.score}/100
          </span>
        </div>
      </div>

      {/* Core Technology Stack */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
        <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4">
          Core Engineering Competencies
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {metrics.languages.slice(0, 8).map((lang) => (
            <div
              key={lang.name}
              className="p-3 rounded-lg border border-neutral-900 bg-neutral-900/50 flex items-center gap-2.5 font-mono"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: lang.color }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-neutral-200 block truncate">
                  {lang.name}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {lang.percentage}% volume
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Projects Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
          <h2 className="text-sm font-semibold text-white">Featured Open Source Projects</h2>
          <span className="text-xs text-neutral-500 font-mono">Curated Portfolio</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topProjects.map((repo) => (
            <div
              key={repo.id}
              className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-white font-mono truncate">
                    {repo.name}
                  </h3>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded text-neutral-500 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed mb-4 line-clamp-3">
                  {repo.description || 'Public open source repository authored by developer.'}
                </p>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {repo.topics.slice(0, 4).map((topic) => (
                      <span
                        key={topic}
                        className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-900 font-mono">
                {repo.language && (
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: getLangColor(repo.language) }}
                    />
                    <span>{repo.language}</span>
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-neutral-300">
                    <Star className="w-3 h-3 text-neutral-400" />
                    <span>{repo.stargazers_count.toLocaleString()}</span>
                  </span>
                  {repo.forks_count > 0 && (
                    <span className="flex items-center gap-1 text-neutral-500">
                      <GitFork className="w-3 h-3" />
                      <span>{repo.forks_count}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="pt-6 border-t border-neutral-900 text-center text-xs text-neutral-600 font-mono">
        GitFolio Developer Intelligence • Data sourced via GitHub API for @{user.login}
      </footer>
    </div>
  );
}
