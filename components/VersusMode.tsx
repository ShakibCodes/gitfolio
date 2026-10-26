'use client';

import { useState } from 'react';
import { GitHubUser, Repo, DevMetrics } from '@/types/github';
import { calculateMetrics, getLangColor } from '@/lib/github';
import {
  Swords,
  Trophy,
  ArrowRight,
  Star,
  Users,
  FolderGit2,
  Award,
  ExternalLink,
  X,
} from 'lucide-react';

interface VersusModeProps {
  currentUser: GitHubUser;
  currentRepos: Repo[];
  currentMetrics: DevMetrics;
  onClose: () => void;
}

const PRESET_OPPONENTS = ['shadcn', 'torvalds', 'gaearon', 'antfu', 'leerob'];

export default function VersusMode({
  currentUser,
  currentRepos,
  currentMetrics,
  onClose,
}: VersusModeProps) {
  const [opponentName, setOpponentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [opponentUser, setOpponentUser] = useState<GitHubUser | null>(null);
  const [opponentMetrics, setOpponentMetrics] = useState<DevMetrics | null>(null);

  const handleCompare = async (targetUser: string) => {
    const val = targetUser.trim();
    if (!val) return;
    setLoading(true);
    setError('');

    try {
      const [uRes, rRes] = await Promise.all([
        fetch(`https://api.github.com/users/${val}`),
        fetch(`https://api.github.com/users/${val}/repos?per_page=100&sort=updated`),
      ]);

      if (!uRes.ok) throw new Error('Opponent not found');
      const uData: GitHubUser = await uRes.json();
      const rData: Repo[] = await rRes.json();

      const opponentRepos = Array.isArray(rData) ? rData : [];
      const metrics = calculateMetrics(uData, opponentRepos, null);

      setOpponentUser(uData);
      setOpponentMetrics(metrics);
    } catch {
      setError('Could not fetch opponent profile. Please check the username.');
    } finally {
      setLoading(false);
    }
  };

  const getWinner = (val1: number, val2: number) => {
    if (val1 > val2) return 1;
    if (val2 > val1) return 2;
    return 0; // tie
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-4xl glass-card rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 text-amber-400 border border-amber-500/30">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Developer Versus Mode (1v1)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                BATTLE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Benchmark two GitHub developers head-to-head on score, stars, output, and impact.
            </p>
          </div>
        </div>

        {/* Search Opponent Box */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCompare(opponentName);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <input
              type="text"
              placeholder="Enter GitHub username to battle..."
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>{loading ? 'Analyzing...' : 'Start Battle'}</span>
            </button>
          </form>

          {/* Quick presets */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[11px] font-mono text-slate-500">Quick Match:</span>
            {PRESET_OPPONENTS.map((handle) => (
              <button
                key={handle}
                onClick={() => {
                  setOpponentName(handle);
                  handleCompare(handle);
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all"
              >
                @{handle}
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>

        {/* Comparison Arena */}
        {opponentUser && opponentMetrics ? (
          <div className="space-y-6">
            {/* Fighter Avatars Header */}
            <div className="grid grid-cols-2 gap-4 items-center relative">
              {/* Left Fighter */}
              <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 text-center relative overflow-hidden">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mx-auto border-2 border-emerald-400 shadow-lg shadow-emerald-500/10 mb-2">
                  <img src={currentUser.avatar_url} alt={currentUser.login} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-base font-bold text-white truncate font-mono">@{currentUser.login}</h3>
                <span className="text-xs text-emerald-400 font-mono font-bold block">{currentMetrics.tier}-TIER</span>
                <span className="text-[10px] text-slate-400 block truncate">{currentMetrics.archetype}</span>
              </div>

              {/* Center VS Stamp */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-950 border-2 border-amber-500 text-amber-400 flex items-center justify-center font-black text-xs shadow-xl font-mono">
                VS
              </div>

              {/* Right Fighter */}
              <div className="glass-card rounded-2xl p-4 border border-red-500/30 text-center relative overflow-hidden">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mx-auto border-2 border-red-400 shadow-lg shadow-red-500/10 mb-2">
                  <img src={opponentUser.avatar_url} alt={opponentUser.login} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-base font-bold text-white truncate font-mono">@{opponentUser.login}</h3>
                <span className="text-xs text-red-400 font-mono font-bold block">{opponentMetrics.tier}-TIER</span>
                <span className="text-[10px] text-slate-400 block truncate">{opponentMetrics.archetype}</span>
              </div>
            </div>

            {/* Head-to-head metrics battle table */}
            <div className="glass-card rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden text-xs font-mono">
              {/* Score */}
              <div className="p-3.5 grid grid-cols-3 items-center">
                <div className={`text-left font-bold text-sm ${getWinner(currentMetrics.score, opponentMetrics.score) === 1 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {currentMetrics.score}/100 {getWinner(currentMetrics.score, opponentMetrics.score) === 1 && '👑'}
                </div>
                <div className="text-center text-slate-400">Dev Score</div>
                <div className={`text-right font-bold text-sm ${getWinner(currentMetrics.score, opponentMetrics.score) === 2 ? 'text-red-400' : 'text-slate-300'}`}>
                  {getWinner(currentMetrics.score, opponentMetrics.score) === 2 && '👑 '} {opponentMetrics.score}/100
                </div>
              </div>

              {/* Stars */}
              <div className="p-3.5 grid grid-cols-3 items-center">
                <div className={`text-left font-bold ${getWinner(currentMetrics.totalStars, opponentMetrics.totalStars) === 1 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {currentMetrics.totalStars.toLocaleString()}★ {getWinner(currentMetrics.totalStars, opponentMetrics.totalStars) === 1 && '👑'}
                </div>
                <div className="text-center text-slate-400">Total Stars</div>
                <div className={`text-right font-bold ${getWinner(currentMetrics.totalStars, opponentMetrics.totalStars) === 2 ? 'text-red-400' : 'text-slate-300'}`}>
                  {getWinner(currentMetrics.totalStars, opponentMetrics.totalStars) === 2 && '👑 '} {opponentMetrics.totalStars.toLocaleString()}★
                </div>
              </div>

              {/* Repos */}
              <div className="p-3.5 grid grid-cols-3 items-center">
                <div className={`text-left font-bold ${getWinner(currentUser.public_repos, opponentUser.public_repos) === 1 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {currentUser.public_repos} {getWinner(currentUser.public_repos, opponentUser.public_repos) === 1 && '👑'}
                </div>
                <div className="text-center text-slate-400">Public Repos</div>
                <div className={`text-right font-bold ${getWinner(currentUser.public_repos, opponentUser.public_repos) === 2 ? 'text-red-400' : 'text-slate-300'}`}>
                  {getWinner(currentUser.public_repos, opponentUser.public_repos) === 2 && '👑 '} {opponentUser.public_repos}
                </div>
              </div>

              {/* Followers */}
              <div className="p-3.5 grid grid-cols-3 items-center">
                <div className={`text-left font-bold ${getWinner(currentUser.followers, opponentUser.followers) === 1 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {currentUser.followers.toLocaleString()} {getWinner(currentUser.followers, opponentUser.followers) === 1 && '👑'}
                </div>
                <div className="text-center text-slate-400">Followers</div>
                <div className={`text-right font-bold ${getWinner(currentUser.followers, opponentUser.followers) === 2 ? 'text-red-400' : 'text-slate-300'}`}>
                  {getWinner(currentUser.followers, opponentUser.followers) === 2 && '👑 '} {opponentUser.followers.toLocaleString()}
                </div>
              </div>

              {/* Primary Language */}
              <div className="p-3.5 grid grid-cols-3 items-center">
                <div className="text-left text-slate-200">
                  {currentMetrics.primaryLanguage}
                </div>
                <div className="text-center text-slate-400">Primary Stack</div>
                <div className="text-right text-slate-200">
                  {opponentMetrics.primaryLanguage}
                </div>
              </div>
            </div>

            {/* Verdict Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-red-500/10 border border-amber-500/30 text-center">
              <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold block mb-1">
                Battle Outcome
              </span>
              <p className="text-sm text-slate-200 font-medium">
                {currentMetrics.score > opponentMetrics.score
                  ? `🏆 @${currentUser.login} holds the higher GitFolio developer index with superior overall output and tier ranking!`
                  : currentMetrics.score < opponentMetrics.score
                  ? `🏆 @${opponentUser.login} takes the lead with higher overall developer metrics!`
                  : `⚔️ It's a dead heat! Both developers match in index scoring and engineering capability.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            Type an opponent username above or pick one of the quick presets to initiate the comparison.
          </div>
        )}
      </div>
    </div>
  );
}
