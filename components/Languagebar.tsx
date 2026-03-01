'use client';

interface Repo {
  language: string | null;
  stargazers_count: number;
}

interface LanguageBarProps {
  repos: Repo[];
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Dart: '#00B4AB',
};

export default function LanguageBar({ repos }: LanguageBarProps) {
  const counts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) {
      counts[r.language] = (counts[r.language] || 0) + 1;
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (sorted.length === 0) return null;

  return (
    <div
      className="rounded-2xl border p-5 animate-fade-up"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
        Languages
      </h3>

      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-2 mb-4 gap-px">
        {sorted.map(([lang, count]) => (
          <div
            key={lang}
            title={`${lang}: ${((count / total) * 100).toFixed(1)}%`}
            style={{
              width: `${(count / total) * 100}%`,
              background: LANG_COLORS[lang] || '#8b949e',
              transition: 'width 0.6s ease',
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {sorted.map(([lang, count]) => (
          <div key={lang} className="flex items-center gap-2">
            <span
              className="lang-dot flex-shrink-0"
              style={{ background: LANG_COLORS[lang] || '#8b949e' }}
            />
            <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{lang}</span>
            <span className="text-xs ml-auto flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {((count / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}