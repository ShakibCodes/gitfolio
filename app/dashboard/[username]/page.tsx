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
import { ArrowLeft, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';

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
        setError('Failed to load GitHub user data. User might not exist or GitHub API limit reached.');
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

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-2xl border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
            <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-mono">
              Indexing @{username}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Synthesizing repositories, activity graph, and developer scores...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error || !user || !metrics) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full border border-red-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Profile Not Found</h2>
            <p className="text-xs text-slate-400 mt-1">{error || 'Unable to locate user on GitHub.'}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs font-mono transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Search</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100">
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
        <div className="flex flex-col lg:flex-row h-[calc(100vh-53px)] overflow-hidden">
          {/* Main Content Area */}
          <main
            className={`flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 transition-all ${
              aiOpen ? 'lg:mr-0' : ''
            }`}
          >
            <div className="max-w-5xl mx-auto space-y-6">
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
              <section className="pt-2">
                <div className="mb-3">
                  <h2 className="text-base font-bold text-slate-100 font-mono">
                    Repository Explorer & Catalog
                  </h2>
                  <p className="text-xs text-slate-400">
                    Deep dive into all public repositories, filter by tech stack, and inspect dependencies.
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

          {/* AI Chat Right Drawer / Panel */}
          {aiOpen && (
            <aside className="w-full lg:w-96 xl:w-[420px] h-[calc(100vh-53px)] flex-shrink-0 animate-fade-in shadow-2xl z-30">
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
