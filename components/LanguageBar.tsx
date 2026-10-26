'use client';

import { Repo } from '@/types/github';
import { LANG_COLORS, getLangColor } from '@/lib/github';
import { Code2 } from 'lucide-react';

interface LanguageBarProps {
  repos: Repo[];
  selectedLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
}

export default function LanguageBar({
  repos,
  selectedLanguage = 'All',
  onSelectLanguage,
}: LanguageBarProps) {
  const counts: Record<string, { count: number; stars: number }> = {};

  repos.forEach((r) => {
    if (r.language) {
      if (!counts[r.language]) {
        counts[r.language] = { count: 0, stars: 0 };
      }
      counts[r.language].count += 1;
      counts[r.language].stars += r.stargazers_count || 0;
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b.count, 0);
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);

  if (sorted.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>Technology & Language Stack</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          {sorted.length} active languages
        </span>
      </div>

      {/* Segmented bar */}
      <div className="flex rounded-full overflow-hidden h-2.5 mb-4 bg-slate-800/80 p-0.5 gap-0.5">
        {sorted.map(([lang, data]) => {
          const pct = Math.max(2, (data.count / total) * 100);
          return (
            <div
              key={lang}
              title={`${lang}: ${((data.count / total) * 100).toFixed(1)}% (${data.count} repos)`}
              className="h-full rounded-sm transition-all duration-500 hover:opacity-80 cursor-pointer"
              style={{
                width: `${pct}%`,
                background: getLangColor(lang),
              }}
              onClick={() => onSelectLanguage?.(lang)}
            />
          );
        })}
      </div>

      {/* Interactive Language Badges / Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sorted.map(([lang, data]) => {
          const pct = Math.round((data.count / total) * 100);
          const isSelected = selectedLanguage === lang;

          return (
            <button
              key={lang}
              onClick={() => onSelectLanguage?.(isSelected ? 'All' : lang)}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm'
                  : 'bg-slate-900/40 border-white/5 hover:border-white/20 text-slate-300'
              }`}
            >
              <span
                className="lang-dot flex-shrink-0"
                style={{ background: getLangColor(lang) }}
              />
              <span className="text-xs font-medium truncate flex-1">{lang}</span>
              <span className="text-[11px] font-mono text-slate-500">{pct}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
