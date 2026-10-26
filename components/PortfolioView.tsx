'use client';

import { GitHubUser, Repo, DevMetrics } from '@/types/github';
import { getLangColor } from '@/lib/github';
import {
  Printer,
  ExternalLink,
  Star,
  GitFork,
  Mail,
  MapPin,
  Building,
  Globe,
  Award,
  Sparkles,
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
  // Top 6 showcase projects
  const topProjects = [...repos]
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 6);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fade-up">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between pb-4 border-b border-white/10">
        <button
          onClick={onExitPortfolio}
          className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Showcase Mode</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF Resume</span>
          </button>
        </div>
      </div>

      {/* Portfolio Hero */}
      <div className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-2xl shadow-emerald-500/20">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-slate-950 border border-emerald-400 text-emerald-400 text-[10px] font-mono font-bold">
              {metrics.tier}-TIER
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              <span>{metrics.archetype}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              {user.name || user.login}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {user.bio ||
                `Experienced software engineer and active open-source creator specializing in ${metrics.primaryLanguage} and distributed modern software.`}
            </p>

            {/* Quick contact / metadata chips */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
              {user.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {user.location}
                </span>
              )}
              {user.company && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  {user.company}
                </span>
              )}
              {user.blog && (
                <a
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-cyan-400 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {user.blog.replace(/^https?:\/\//, '')}
                </a>
              )}
              {user.twitter_username && (
                <a
                  href={`https://twitter.com/${user.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sky-400 hover:underline"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                  @{user.twitter_username}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/10 text-center">
          <span className="text-xs text-slate-400 font-mono block mb-1">Total Stars</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {metrics.totalStars.toLocaleString()}★
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Community peer recognition</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 text-center">
          <span className="text-xs text-slate-400 font-mono block mb-1">Public Repos</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
            {user.public_repos.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {metrics.totalOriginalRepos} original codebases
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 text-center">
          <span className="text-xs text-slate-400 font-mono block mb-1">Best Streak</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {metrics.longestStreak} Days
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Continuous shipping record</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 text-center">
          <span className="text-xs text-slate-400 font-mono block mb-1">Engineer Score</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
            {metrics.score}/100
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">GitFolio Verified</span>
        </div>
      </div>

      {/* Core Technology Stack */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Core Engineering Competencies</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.languages.slice(0, 8).map((lang) => (
            <div
              key={lang.name}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-3"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: lang.color }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {lang.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {lang.percentage}% volume ({lang.count} repos)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Projects Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Featured Open-Source Work</h2>
          <span className="text-xs text-slate-400 font-mono">Curated Portfolio</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topProjects.map((repo) => (
            <div
              key={repo.id}
              className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors font-mono truncate">
                    {repo.name}
                  </h3>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {repo.description || 'Public open source repository authored by developer.'}
                </p>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {repo.topics.slice(0, 4).map((topic) => (
                      <span
                        key={topic}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-white/5 text-cyan-300 font-mono"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5 font-mono">
                {repo.language && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: getLangColor(repo.language) }}
                    />
                    <span>{repo.language}</span>
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{repo.stargazers_count.toLocaleString()}</span>
                  </span>
                  {repo.forks_count > 0 && (
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-slate-500" />
                      <span>{repo.forks_count}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10 text-center text-xs text-slate-500 font-mono">
        <p>
          Generated with GitFolio Developer Intelligence • Data sourced via GitHub API for @{user.login}
        </p>
      </footer>
    </div>
  );
}
