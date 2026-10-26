'use client';

import { useState } from 'react';
import { GitHubUser, Repo, DevMetrics } from '@/types/github';
import { calculateMetrics } from '@/lib/github';
import { Swords, X } from 'lucide-react';

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
      setError('Could not locate user profile.');
    } finally {
      setLoading(false);
    }
  };

  const getWinner = (val1: number, val2: number) => {
    if (val1 > val2) return 1;
    if (val2 > val1) return 2;
    return 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
      <div
        className="relative w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-6">
          <Swords className="w-4 h-4 text-neutral-400" />
          <h2 className="text-base font-semibold text-white">
            Developer Versus Mode
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400">
            Head-to-Head
          </span>
        </div>

        {/* Search Opponent Box */}
        <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/50 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCompare(opponentName);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <input
              type="text"
              placeholder="Enter GitHub username to compare..."
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-500 outline-none focus:border-neutral-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-white hover:bg-neutral-200 text-black font-medium text-xs font-mono transition-colors"
            >
              {loading ? 'Evaluating...' : 'Compare'}
            </button>
          </form>

          {/* Presets */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[11px] font-mono text-neutral-500">Quick Match:</span>
            {PRESET_OPPONENTS.map((handle) => (
              <button
                key={handle}
                onClick={() => {
                  setOpponentName(handle);
                  handleCompare(handle);
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
              >
                @{handle}
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-neutral-400 mt-2 font-mono">{error}</p>}
        </div>

        {/* Comparison Arena */}
        {opponentUser && opponentMetrics ? (
          <div className="space-y-6">
            {/* Fighter Avatars Header */}
            <div className="grid grid-cols-2 gap-4 items-center relative">
              <div className="rounded-lg p-4 border border-neutral-800 bg-neutral-900/30 text-center">
                <div className="w-14 h-14 rounded-full overflow-hidden mx-auto border border-neutral-700 mb-2">
                  <img src={currentUser.avatar_url} alt={currentUser.login} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm font-semibold text-white truncate font-mono">@{currentUser.login}</h3>
                <span className="text-xs text-neutral-300 font-mono font-bold block">{currentMetrics.tier}-TIER</span>
                <span className="text-[11px] text-neutral-500 block truncate">{currentMetrics.archetype}</span>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-2 py-0.5 rounded bg-black border border-neutral-700 text-neutral-400 font-mono text-xs font-bold">
                VS
              </div>

              <div className="rounded-lg p-4 border border-neutral-800 bg-neutral-900/30 text-center">
                <div className="w-14 h-14 rounded-full overflow-hidden mx-auto border border-neutral-700 mb-2">
                  <img src={opponentUser.avatar_url} alt={opponentUser.login} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm font-semibold text-white truncate font-mono">@{opponentUser.login}</h3>
                <span className="text-xs text-neutral-300 font-mono font-bold block">{opponentMetrics.tier}-TIER</span>
                <span className="text-[11px] text-neutral-500 block truncate">{opponentMetrics.archetype}</span>
              </div>
            </div>

            {/* Metrics table */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 divide-y divide-neutral-800 overflow-hidden text-xs font-mono">
              <div className="p-3 grid grid-cols-3 items-center">
                <div className={`text-left font-bold ${getWinner(currentMetrics.score, opponentMetrics.score) === 1 ? 'text-white' : 'text-neutral-400'}`}>
                  {currentMetrics.score}/100 {getWinner(currentMetrics.score, opponentMetrics.score) === 1 && '✓'}
                </div>
                <div className="text-center text-neutral-500">Dev Score</div>
                <div className={`text-right font-bold ${getWinner(currentMetrics.score, opponentMetrics.score) === 2 ? 'text-white' : 'text-neutral-400'}`}>
                  {getWinner(currentMetrics.score, opponentMetrics.score) === 2 && '✓ '} {opponentMetrics.score}/100
                </div>
              </div>

              <div className="p-3 grid grid-cols-3 items-center">
                <div className={`text-left font-bold ${getWinner(currentMetrics.totalStars, opponentMetrics.totalStars) === 1 ? 'text-white' : 'text-neutral-400'}`}>
                  {currentMetrics.totalStars.toLocaleString()}★ {getWinner(currentMetrics.totalStars, opponentMetrics.totalStars) === 1 && '✓'}
                </div>
                <div className="text-center text-neutral-500">Total Stars</div>
                <div className={`text-right font-bold ${getWinner(currentMetrics.totalStars, opponentMetrics.totalStars) === 2 ? 'text-white' : 'text-neutral-400'}`}>
                  {getWinner(currentMetrics.totalStars, opponentMetrics.totalStars) === 2 && '✓ '} {opponentMetrics.totalStars.toLocaleString()}★
                </div>
              </div>

              <div className="p-3 grid grid-cols-3 items-center">
                <div className={`text-left font-bold ${getWinner(currentUser.public_repos, opponentUser.public_repos) === 1 ? 'text-white' : 'text-neutral-400'}`}>
                  {currentUser.public_repos} {getWinner(currentUser.public_repos, opponentUser.public_repos) === 1 && '✓'}
                </div>
                <div className="text-center text-neutral-500">Public Repos</div>
                <div className={`text-right font-bold ${getWinner(currentUser.public_repos, opponentUser.public_repos) === 2 ? 'text-white' : 'text-neutral-400'}`}>
                  {getWinner(currentUser.public_repos, opponentUser.public_repos) === 2 && '✓ '} {opponentUser.public_repos}
                </div>
              </div>

              <div className="p-3 grid grid-cols-3 items-center">
                <div className={`text-left font-bold ${getWinner(currentUser.followers, opponentUser.followers) === 1 ? 'text-white' : 'text-neutral-400'}`}>
                  {currentUser.followers.toLocaleString()} {getWinner(currentUser.followers, opponentUser.followers) === 1 && '✓'}
                </div>
                <div className="text-center text-neutral-500">Followers</div>
                <div className={`text-right font-bold ${getWinner(currentUser.followers, opponentUser.followers) === 2 ? 'text-white' : 'text-neutral-400'}`}>
                  {getWinner(currentUser.followers, opponentUser.followers) === 2 && '✓ '} {opponentUser.followers.toLocaleString()}
                </div>
              </div>

              <div className="p-3 grid grid-cols-3 items-center">
                <div className="text-left text-neutral-300">
                  {currentMetrics.primaryLanguage}
                </div>
                <div className="text-center text-neutral-500">Primary Stack</div>
                <div className="text-right text-neutral-300">
                  {opponentMetrics.primaryLanguage}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/50 text-center font-mono text-xs text-neutral-300">
              {currentMetrics.score > opponentMetrics.score
                ? `@${currentUser.login} holds the higher developer index rating.`
                : currentMetrics.score < opponentMetrics.score
                ? `@${opponentUser.login} holds the higher developer index rating.`
                : `Both developers hold equivalent index rating metrics.`}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-neutral-500 text-xs font-mono">
            Enter a GitHub handle above to benchmark against @{currentUser.login}.
          </div>
        )}
      </div>
    </div>
  );
}
