'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GitHubUser, Repo, ContributionData, DevMetrics } from '@/types/github';
import { calculateMetrics } from '@/lib/github';
import Navbar from '@/components/Navbar';
import DevScoreCard from '@/components/DevScoreCard';
import ProfileCard from '@/components/ProfileCard';
import TopRepo from '@/components/TopRepo';
import LanguageBar from '@/components/LanguageBar';
import HeatMap from '@/components/Heatmap';
import RepoExplorer from '@/components/RepoExplorer';
import RepoDetailModal from '@/components/RepoDetailModal';
import PortfolioView from '@/components/PortfolioView';
import VersusMode from '@/components/VersusMode';
import ExportModal from '@/components/ExportModal';
import CommandPalette from '@/components/CommandPalette';
import AiChat from '@/components/Aichat';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [contributions, setContributions] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [viewMode, setViewMode] = useState<'dashboard' | 'portfolio'>('dashboard');
  const [aiOpen, setAiOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [versusOpen, setVersusOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        const [userRes, repoRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
        ]);

        if (!userRes.ok) throw new Error('Developer profile not found');
        const userData: GitHubUser = await userRes.json();
        const repoData: Repo[] = await repoRes.json();

        setUser(userData);
        setRepos(Array.isArray(repoData) ? repoData : []);
      } catch (err) {
        setError('Failed to load GitHub user data. User may not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  // Derived metrics
  const metrics: DevMetrics | null = useMemo(() => {
    if (!user) return null;
    return calculateMetrics(user, repos, contributions);
  }, [user, repos, contributions]);

  const topRepo = useMemo(() => {
    return repos.reduce<Repo | null>((best, r) => {
      if (!best || (r.stargazers_count || 0) > (best.stargazers_count || 0)) return r;
      return best;
    }, null);
  }, [repos]);

  // Loading Screen (Vercel minimal spinner)
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
        <div className="text-center space-y-3">
          <div className="w-5 h-5 border-2 border-neutral-400 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-500 font-mono">
            Evaluating @{username}...
          </p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error || !user || !metrics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center mx-auto text-neutral-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Profile Not Found</h2>
            <p className="text-xs text-neutral-400 mt-1">{error || 'Unable to locate user on GitHub.'}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white hover:bg-neutral-200 text-black font-medium text-xs font-mono transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Search</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans">
      {/* Top Navbar */}
      <Navbar
        user={user}
        viewMode={viewMode}
        setViewMode={setViewMode}
        aiOpen={aiOpen}
        setAiOpen={setAiOpen}
        onOpenVersus={() => setVersusOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main View Mode Selector */}
      {viewMode === 'portfolio' ? (
        <PortfolioView
          user={user}
          repos={repos}
          metrics={metrics}
          onExitPortfolio={() => setViewMode('dashboard')}
        />
      ) : (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-49px)] overflow-hidden">
          {/* Main Content Area */}
          <main
            className={`flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 transition-all ${
              aiOpen ? 'lg:mr-0' : ''
            }`}
          >
            <div className="max-w-5xl mx-auto space-y-5">
              {/* Dev Score Card */}
              <DevScoreCard metrics={metrics} username={username} />

              {/* Profile Card & Top Repo in 2 cols */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6">
                  <ProfileCard user={user} metrics={metrics} />
                </div>
                <div className="lg:col-span-6 space-y-4">
                  {topRepo && (
                    <TopRepo repo={topRepo} onSelectRepo={setSelectedRepo} />
                  )}
                  <LanguageBar
                    repos={repos}
                    selectedLanguage={selectedLanguage}
                    onSelectLanguage={setSelectedLanguage}
                  />
                </div>
              </div>

              {/* Annual Activity Heatmap */}
              <HeatMap
                username={username}
                onDataLoaded={(data) => setContributions(data)}
              />

              {/* Repository Explorer Section */}
              <section className="pt-2 pb-8">
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-white">
                    Repositories
                  </h2>
                  <p className="text-xs text-neutral-500 font-mono">
                    Filter by language, inspect clone endpoints, or search topics.
                  </p>
                </div>

                <RepoExplorer
                  repos={repos}
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                  onSelectRepo={setSelectedRepo}
                />
              </section>
            </div>
          </main>

          {/* AI Chat Right Panel */}
          {aiOpen && (
            <aside className="w-full lg:w-96 xl:w-[400px] h-[calc(100vh-49px)] flex-shrink-0 animate-fade-in shadow-2xl z-30">
              <AiChat
                username={username}
                user={user}
                repos={repos}
                metrics={metrics}
                onClose={() => setAiOpen(false)}
              />
            </aside>
          )}
        </div>
      )}

      {/* Modals */}
      <RepoDetailModal
        repo={selectedRepo}
        onClose={() => setSelectedRepo(null)}
      />

      {versusOpen && (
        <VersusMode
          currentUser={user}
          currentRepos={repos}
          currentMetrics={metrics}
          onClose={() => setVersusOpen(false)}
        />
      )}

      {exportOpen && (
        <ExportModal
          user={user}
          metrics={metrics}
          onClose={() => setExportOpen(false)}
        />
      )}

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        repos={repos}
        onToggleAi={() => setAiOpen(!aiOpen)}
        onOpenVersus={() => setVersusOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onTogglePortfolio={() =>
          setViewMode(viewMode === 'dashboard' ? 'portfolio' : 'dashboard')
        }
      />
    </div>
  );
}
