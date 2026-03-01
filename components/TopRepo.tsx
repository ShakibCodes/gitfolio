'use client';

interface Repo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  topics: string[];
  updated_at: string;
  open_issues_count: number;
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

function getLangColor(lang: string) {
  return LANG_COLORS[lang] || '#8b949e';
}

interface TopRepoProps {
  repo: Repo;
}

export default function TopRepo({ repo }: TopRepoProps) {
  const updatedAt = new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div
      className="animate-slide-left delay-200 rounded-2xl border p-5 hover-lift relative overflow-hidden"
      style={{ borderColor: 'rgba(0,255,136,0.3)', background: 'var(--surface)' }}
    >
      {/* Crown badge */}
      <div
        className="absolute top-0 right-0 px-3 py-1 text-xs font-medium rounded-bl-xl"
        style={{ background: 'rgba(0,255,136,0.15)', color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}
      >
        ★ Top Repo
      </div>

      {/* Subtle glow bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 80%, rgba(0,255,136,0.04) 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        {/* Repo name */}
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-semibold mb-1 hover:opacity-70 transition-opacity truncate pr-16"
          style={{ color: 'var(--accent-blue)', fontFamily: 'DM Mono, monospace' }}
        >
          {repo.name}
        </a>

        {/* Description */}
        {repo.description && (
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            {repo.description.length > 100 ? repo.description.slice(0, 100) + '...' : repo.description}
          </p>
        )}

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {repo.topics.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(88,166,255,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(88,166,255,0.2)' }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span className="lang-dot" style={{ background: getLangColor(repo.language) }} />
              <span style={{ color: 'var(--text-secondary)' }}>{repo.language}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <span style={{ color: '#f1c40f' }}>★</span>
            <span>{repo.stargazers_count.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>⑂</span>
            <span>{repo.forks_count.toLocaleString()}</span>
          </span>
          <span className="ml-auto">{updatedAt}</span>
        </div>
      </div>
    </div>
  );
}