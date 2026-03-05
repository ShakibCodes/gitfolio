'use client';

import { useState, useEffect, useMemo } from 'react';

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface HeatMapProps {
  username: string;
}

const CELL_COLORS = [
  'rgba(22,27,34,1)',      // 0 - empty
  'rgba(0,255,136,0.15)',  // 1 - low
  'rgba(0,255,136,0.35)',  // 2 - medium-low
  'rgba(0,255,136,0.65)',  // 3 - medium-high
  'rgba(0,255,136,0.9)',   // 4 - high
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

/**
 * Fetches GitHub contribution data via the GitHub GraphQL API.
 * Requires a NEXT_PUBLIC_GITHUB_TOKEN env var OR falls back to
 * the unofficial github-contributions-api.vercel.app public proxy.
 */
async function fetchContributions(username: string): Promise<{ weeks: Week[]; totalContributions: number }> {
  // ── Strategy 1: GitHub GraphQL (works if NEXT_PUBLIC_GITHUB_TOKEN is set) ──
  const token =
    typeof process !== 'undefined'
      ? (process.env.NEXT_PUBLIC_GITHUB_TOKEN ?? '')
      : '';

  if (token) {
    const query = `
      query($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { login: username } }),
    });

    if (res.ok) {
      const json = await res.json();
      const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
      if (cal) return cal;
    }
  }

  // ── Strategy 2: Public proxy (no token needed) ──
  // Uses https://github-contributions-api.jogruber.de — a free, open-source proxy
  const proxyRes = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
    { next: { revalidate: 3600 } } // cache 1 h in Next.js
  );

  if (!proxyRes.ok) {
    throw new Error(`Proxy returned ${proxyRes.status}`);
  }

  const proxyData = await proxyRes.json();

  // The proxy returns: { total: { [year]: n, "lastYear": n }, contributions: [{date, count, level}] }
  const raw: { date: string; count: number }[] = proxyData.contributions ?? [];

  // Re-group into weeks (Sun→Sat) to match GitHub's layout
  const weeks: Week[] = [];
  let currentWeek: ContributionDay[] = [];

  // Sort ascending
  const sorted = [...raw].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach((entry) => {
    const dow = new Date(entry.date).getDay(); // 0 = Sun
    if (dow === 0 && currentWeek.length > 0) {
      weeks.push({ contributionDays: currentWeek });
      currentWeek = [];
    }
    currentWeek.push({ date: entry.date, contributionCount: entry.count });
  });
  if (currentWeek.length > 0) weeks.push({ contributionDays: currentWeek });

  const totalContributions: number = proxyData.total?.lastYear ?? raw.reduce((s, d) => s + d.count, 0);

  return { weeks, totalContributions };
}

// ─── Month label helper ────────────────────────────────────────────────────────
function getMonthLabels(weeks: Week[]) {
  const labels: { label: string; index: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date).getMonth();
    if (month !== lastMonth) {
      labels.push({ label: MONTHS[month], index: wi });
      lastMonth = month;
    }
  });
  return labels;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function HeatMap({ username }: HeatMapProps) {
  const [calendarData, setCalendarData] = useState<{ weeks: Week[]; totalContributions: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchContributions(username)
      .then((data) => {
        if (!cancelled) setCalendarData(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to fetch contribution data.');
        console.error('Heatmap Fetch Error:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [username]);

  const stats = useMemo(() => {
    if (!calendarData?.weeks) return { total: 0, currentStreak: 0, longestStreak: 0, bestDay: 0 };

    const allDays = calendarData.weeks.flatMap((w) => w.contributionDays ?? []);
    let longest = 0, tempStreak = 0, best = 0;

    allDays.forEach((day) => {
      const count = day.contributionCount ?? 0;
      if (count > best) best = count;
      if (count > 0) { tempStreak++; if (tempStreak > longest) longest = tempStreak; }
      else tempStreak = 0;
    });

    let current = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      const count = allDays[i]?.contributionCount ?? 0;
      if (count > 0) current++;
      else if (i !== allDays.length - 1) break;
    }

    return { total: calendarData.totalContributions ?? 0, currentStreak: current, longestStreak: longest, bestDay: best };
  }, [calendarData]);

  const monthLabels = useMemo(
    () => (calendarData?.weeks ? getMonthLabels(calendarData.weeks) : []),
    [calendarData]
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className="rounded-2xl border p-10 flex flex-col items-center justify-center space-y-3"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent animate-spin rounded-full"
          style={{ borderColor: 'var(--accent) var(--border) var(--border) var(--border)' }} />
        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>FETCHING CONTRIBUTION GRAPH…</p>
      </div>
    );
  }

  // ── Error ──
  if (error || !calendarData) {
    return (
      <div className="rounded-2xl border p-10 text-center"
        style={{ borderColor: 'rgba(248,81,73,0.2)', background: 'var(--surface)' }}>
        <p className="text-xs font-mono" style={{ color: '#f85149' }}>[!] ERROR: {(error ?? 'NO DATA').toUpperCase()}</p>
        <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
          Optionally set NEXT_PUBLIC_GITHUB_TOKEN for higher rate limits.
        </p>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="animate-fade-up rounded-2xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
            Contribution Activity
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {stats.total.toLocaleString()} contributions in the last year
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Less</span>
          {CELL_COLORS.map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm"
              style={{ background: c, border: '1px solid rgba(255,255,255,0.05)' }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div style={{ minWidth: '600px' }}>

          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 pl-[28px]">
            {calendarData.weeks.map((_, wi) => {
              const labelEntry = monthLabels.find((m) => m.index === wi);
              return (
                <div key={wi} className="w-[12px] flex-shrink-0">
                  {labelEntry && (
                    <span className="text-[9px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {labelEntry.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-[3px]">
            {/* Day labels */}
            <div className="flex flex-col justify-between pr-2 pt-0" style={{ height: '96px' }}>
              {DAYS.map((d, i) => (
                <span key={i} className="text-[9px]" style={{ color: 'var(--text-muted)', height: '12px', lineHeight: '12px' }}>
                  {d}
                </span>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-[3px]">
              {calendarData.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.contributionDays.map((day, di) => {
                    const count = day.contributionCount ?? 0;
                    const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
                    return (
                      <div
                        key={di}
                        title={`${day.date}: ${count} contribution${count !== 1 ? 's' : ''}`}
                        className="w-[12px] h-[12px] rounded-[2px] transition-all hover:scale-125 cursor-help"
                        style={{ background: CELL_COLORS[level] }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{stats.longestStreak}d</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Longest Streak</p>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{stats.currentStreak}d</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Current Streak</p>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{stats.bestDay}</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Best Day</p>
        </div>
      </div>
    </div>
  );
}