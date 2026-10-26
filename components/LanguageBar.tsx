'use client';

import { Repo } from '@/types/github';
import { getLangColor } from '@/lib/github';
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
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 font-sans">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-neutral-400" />
          <span>Languages</span>
        </h3>
        <span className="text-[11px] font-mono text-neutral-500">
          {sorted.length} languages
        </span>
      </div>

      {/* Segmented bar */}
      <div className="flex rounded-full overflow-hidden h-2 mb-4 bg-neutral-900 p-0.5 gap-0.5">
        {sorted.map(([lang, data]) => {
          const pct = Math.max(2, (data.count / total) * 100);
          return (
            <div
              key={lang}
              title={`${lang}: ${((data.count / total) * 100).toFixed(1)}%`}
              className="h-full rounded-sm transition-opacity hover:opacity-80 cursor-pointer"
              style={{
                width: `${pct}%`,
                background: getLangColor(lang),
              }}
              onClick={() => onSelectLanguage?.(lang)}
            />
          );
        })}
      </div>

      {/* Language Pills / Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sorted.map(([lang, data]) => {
          const pct = Math.round((data.count / total) * 100);
          const isSelected = selectedLanguage === lang;

          return (
            <button
              key={lang}
              onClick={() => onSelectLanguage?.(isSelected ? 'All' : lang)}
              className={`flex items-center gap-2 p-2 rounded-md border text-left transition-colors font-mono ${
                isSelected
                  ? 'bg-neutral-800 border-neutral-600 text-white'
                  : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: getLangColor(lang) }}
              />
              <span className="text-xs truncate flex-1">{lang}</span>
              <span className="text-[10px] text-neutral-500">{pct}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
