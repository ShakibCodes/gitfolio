'use client';

import { useState } from 'react';
import { GitHubUser, DevMetrics } from '@/types/github';
import {
  X,
  Copy,
  Check,
  FileCode,
  Share2,
  Download,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  user: GitHubUser;
  metrics: DevMetrics;
  onClose: () => void;
}

export default function ExportModal({ user, metrics, onClose }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'markdown' | 'embed' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://gitfolio.dev/dashboard/${user.login}`;

  const markdownSnippet = `<!-- GitFolio Developer Intelligence Badge -->
[![GitFolio Score](https://img.shields.io/badge/GitFolio_Score-${metrics.score}%2F100_(${metrics.tier}--Tier)-10b981?style=for-the-badge&logo=github)](${currentUrl})
[![Primary Stack](https://img.shields.io/badge/Stack-${encodeURIComponent(metrics.primaryLanguage)}-06b6d4?style=for-the-badge)](${currentUrl})
[![Developer Archetype](https://img.shields.io/badge/Archetype-${encodeURIComponent(metrics.archetype)}-8b5cf6?style=for-the-badge)](${currentUrl})

> 🚀 **${user.name || user.login}** is an **${metrics.archetype}** (${metrics.tier}-Tier) with ${metrics.totalStars.toLocaleString()}★ total stars and an active streak of ${metrics.longestStreak} days. [Explore full dashboard on GitFolio](${currentUrl})`;

  const embedSnippet = `<div style="border:1px solid #10b981;border-radius:12px;padding:16px;background:#0d111a;color:#f8fafc;font-family:sans-serif;max-width:400px;">
  <h3 style="margin:0;color:#10b981;">${user.name || user.login}</h3>
  <p style="margin:4px 0;font-size:12px;color:#94a3b8;">${metrics.archetype} • ${metrics.tier}-Tier (${metrics.score}/100)</p>
  <p style="font-size:13px;">${metrics.totalStars.toLocaleString()}★ Stars | ${metrics.primaryLanguage} | ${metrics.longestStreak}d Streak</p>
  <a href="${currentUrl}" style="color:#06b6d4;font-size:12px;text-decoration:none;">View GitFolio Dashboard →</a>
</div>`;

  const jsonSnippet = JSON.stringify(
    {
      user: user.login,
      name: user.name,
      score: metrics.score,
      tier: metrics.tier,
      archetype: metrics.archetype,
      totalStars: metrics.totalStars,
      primaryLanguage: metrics.primaryLanguage,
      longestStreak: metrics.longestStreak,
      topLanguages: metrics.languages.slice(0, 5),
      badges: metrics.badges.map((b) => b.label),
    },
    null,
    2
  );

  const getActiveContent = () => {
    switch (activeTab) {
      case 'markdown':
        return markdownSnippet;
      case 'embed':
        return embedSnippet;
      case 'json':
        return jsonSnippet;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-xl glass-card rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-emerald-400">
          <Share2 className="w-4 h-4" />
          <span>Export & Embed Studio</span>
        </div>

        <h3 className="text-xl font-bold text-slate-100 mb-1">
          Export Developer Profile Badges
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Embed your GitFolio metrics into your GitHub README, portfolio website, or resume.
        </p>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-white/10 mb-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'markdown'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GitHub README (Markdown)
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'embed'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            HTML Embed
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'json'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            JSON API
          </button>
        </div>

        {/* Snippet Display */}
        <div className="relative mb-5">
          <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-300 overflow-x-auto max-h-56">
            {getActiveContent()}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Live Preview Box */}
        {activeTab === 'markdown' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400">
            <span className="font-mono text-[10px] uppercase text-slate-500 block mb-1">
              Markdown Preview:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">
                Score: {metrics.score}/100 ({metrics.tier})
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold text-[10px]">
                Stack: {metrics.primaryLanguage}
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500 text-white font-bold text-[10px]">
                {metrics.archetype}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
