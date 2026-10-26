'use client';

import { useState } from 'react';
import { GitHubUser, DevMetrics } from '@/types/github';
import { X, Copy, Check, Share2 } from 'lucide-react';

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
[![GitFolio Score](https://img.shields.io/badge/GitFolio_Score-${metrics.score}%2F100_(${metrics.tier}--Tier)-000000?style=for-the-badge&logo=github)](${currentUrl})
[![Primary Stack](https://img.shields.io/badge/Stack-${encodeURIComponent(metrics.primaryLanguage)}-111111?style=for-the-badge)](${currentUrl})
[![Developer Archetype](https://img.shields.io/badge/Archetype-${encodeURIComponent(metrics.archetype)}-222222?style=for-the-badge)](${currentUrl})

> **${user.name || user.login}** is an **${metrics.archetype}** (${metrics.tier}-Tier) with ${metrics.totalStars.toLocaleString()}★ total stars. [Inspect profile on GitFolio](${currentUrl})`;

  const embedSnippet = `<div style="border:1px solid #333;border-radius:8px;padding:16px;background:#000;color:#ededed;font-family:sans-serif;max-width:380px;">
  <h3 style="margin:0;color:#fff;">${user.name || user.login}</h3>
  <p style="margin:4px 0;font-size:12px;color:#888;">${metrics.archetype} • ${metrics.tier}-Tier (${metrics.score}/100)</p>
  <p style="font-size:13px;">${metrics.totalStars.toLocaleString()}★ Stars | ${metrics.primaryLanguage} | ${metrics.longestStreak}d Streak</p>
  <a href="${currentUrl}" style="color:#ededed;font-size:12px;text-decoration:underline;">View GitFolio Profile →</a>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
      <div
        className="relative w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-neutral-400">
          <Share2 className="w-3.5 h-3.5" />
          <span>Export Studio</span>
        </div>

        <h3 className="text-base font-semibold text-white mb-1">
          Export Profile Badges & Embeds
        </h3>
        <p className="text-xs text-neutral-500 mb-5">
          Embed verified GitFolio metrics into GitHub READMEs, portfolios, or documentation.
        </p>

        {/* Tab Selection */}
        <div className="flex rounded-md bg-neutral-900 p-0.5 border border-neutral-800 mb-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex-1 py-1.5 rounded transition-colors ${
              activeTab === 'markdown'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Markdown (README)
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`flex-1 py-1.5 rounded transition-colors ${
              activeTab === 'embed'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            HTML Embed
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-1.5 rounded transition-colors ${
              activeTab === 'json'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            JSON
          </button>
        </div>

        {/* Snippet Display */}
        <div className="relative mb-4">
          <pre className="p-4 rounded-lg bg-black border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto max-h-56">
            {getActiveContent()}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-neutral-200 text-black font-medium text-xs transition-colors font-mono"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
