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
  fork: boolean;
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

interface RepoCardProps {
  repo: Repo;
  index: number;
}

export default function RepoCard({ repo, index }: RepoCardProps) {
  const updatedAt = new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border p-4 hover-lift transition-all duration-200 group"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--surface)',
        animationDelay: `${index * 0.05}s`,
        animationFillMode: 'both',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {repo.fork && (
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>⑂</span>
          )}
          <h3
            className="text-sm font-medium truncate group-hover:text-blue-400 transition-colors"
            style={{ color: 'var(--accent-blue)', fontFamily: 'DM Mono, monospace' }}
          >
            {repo.name}
          </h3>
        </div>
        {repo.stargazers_count > 0 && (
          <span className="flex-shrink-0 flex items-center gap-1 text-xs" style={{ color: '#f1c40f' }}>
            <span>★</span>
            <span>{repo.stargazers_count >= 1000 ? `${(repo.stargazers_count / 1000).toFixed(1)}k` : repo.stargazers_count}</span>
          </span>
        )}
      </div>

      {repo.description && (
        <p
          className="text-xs leading-relaxed mb-3 line-clamp-2"
          style={{ color: 'var(--text-muted)' }}
        >
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span className="lang-dot" style={{ background: getLangColor(repo.language) }} />
            <span>{repo.language}</span>
          </span>
        )}
        {repo.forks_count > 0 && (
          <span>⑂ {repo.forks_count}</span>
        )}
        <span className="ml-auto">{updatedAt}</span>
      </div>
    </a>
  );
}