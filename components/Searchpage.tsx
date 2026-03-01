'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const [username, setUsername] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = username.trim();
    if (!val) return;
    setError('');
    setLoading(true);
    // Validate username exists
    try {
      const res = await fetch(`https://api.github.com/users/${val}`);
      if (!res.ok) throw new Error('User not found');
      router.push(`/dashboard/${val}`);
    } catch {
      setError('GitHub user not found. Try another username.');
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-grid flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Radial glow background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,136,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-syne text-sm font-700 tracking-widest uppercase text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.15em' }}>
            Git<span style={{ color: 'var(--accent)' }}>Folio</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent)' }}>●</span>
          <span>GitHub Developer Dashboard</span>
        </div>
      </header>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full">
        {/* Badge */}
        <div
          className="animate-fade-up mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border"
          style={{ borderColor: 'rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.06)', color: 'var(--accent)', animationFillMode: 'both' }}
        >
          <span>◆</span>
          <span>AI-Powered GitHub Profiles</span>
          <span>◆</span>
        </div>

        {/* Title */}
        <h1
          className="animate-fade-up delay-100 mb-3 text-5xl sm:text-7xl font-800 leading-none tracking-tight"
          style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, animationFillMode: 'both' }}
        >
          Git<span style={{ color: 'var(--accent)' }}>Folio</span>
        </h1>

        <p
          className="animate-fade-up delay-200 mb-10 text-sm sm:text-base leading-relaxed"
          style={{ color: 'var(--text-secondary)', animationFillMode: 'both', fontFamily: 'DM Mono, monospace' }}
        >
          Transform any GitHub profile into a sleek developer dashboard.<br />
          <span style={{ color: 'var(--text-muted)' }}>Repositories · Heatmaps · AI Insights · Social Presence</span>
        </p>

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="animate-fade-up delay-300 w-full"
          style={{ animationFillMode: 'both' }}
        >
          <div
            className="relative flex items-center rounded-xl border transition-all duration-300"
            style={{
              borderColor: focused ? 'var(--accent)' : 'var(--border)',
              background: 'var(--surface)',
              boxShadow: focused ? '0 0 0 1px rgba(0,255,136,0.3), 0 0 30px rgba(0,255,136,0.08)' : 'none',
            }}
          >
            {/* GitHub icon */}
            <div className="pl-4 pr-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter GitHub username..."
              className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-opacity-40"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'DM Mono, monospace',
              }}
              disabled={loading}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={!username.trim() || loading}
              className="mr-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                background: username.trim() && !loading ? 'var(--accent)' : 'var(--surface-3)',
                color: username.trim() && !loading ? '#000' : 'var(--text-muted)',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                cursor: username.trim() && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  <span>Loading</span>
                </>
              ) : (
                <>
                  <span>Explore</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 text-xs text-red-400 animate-fade-in" style={{ fontFamily: 'DM Mono, monospace' }}>
              ✕ {error}
            </p>
          )}

          {/* Hint */}
          {!error && (
            <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              Try: <button type="button" onClick={() => setUsername('torvalds')} className="hover:text-white transition-colors" style={{ color: 'var(--accent-blue)', fontFamily: 'DM Mono' }}>torvalds</button>,{' '}
              <button type="button" onClick={() => setUsername('gaearon')} className="hover:text-white transition-colors" style={{ color: 'var(--accent-blue)', fontFamily: 'DM Mono' }}>gaearon</button>,{' '}
              <button type="button" onClick={() => setUsername('sindresorhus')} className="hover:text-white transition-colors" style={{ color: 'var(--accent-blue)', fontFamily: 'DM Mono' }}>sindresorhus</button>
            </p>
          )}
        </form>

        {/* Feature chips */}
        <div className="animate-fade-up delay-400 flex flex-wrap justify-center gap-2 mt-10" style={{ animationFillMode: 'both' }}>
          {['Repo Analytics', 'Contribution Heatmap', 'Top Repository', 'AI Chat', 'Social Discovery', 'Auto Resume'].map((f) => (
            <span
              key={f}
              className="px-3 py-1 text-xs rounded-full border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }}
      />
    </main>
  );
}