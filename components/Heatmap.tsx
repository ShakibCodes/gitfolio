'use client';

import { useMemo } from 'react';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface HeatMapProps {
  username: string;
}

// Generate mock heatmap data for the past year
function generateContributions(): ContributionDay[] {
  const days: ContributionDay[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setFullYear(start.getFullYear() - 1);

  // Align to Sunday
  while (start.getDay() !== 0) {
    start.setDate(start.getDate() - 1);
  }

  const current = new Date(start);
  while (current <= today) {
    const rand = Math.random();
    const count =
      rand < 0.35 ? 0 :
      rand < 0.55 ? Math.floor(Math.random() * 3) + 1 :
      rand < 0.75 ? Math.floor(Math.random() * 5) + 3 :
      rand < 0.90 ? Math.floor(Math.random() * 7) + 7 :
      Math.floor(Math.random() * 15) + 12;

    const level: 0 | 1 | 2 | 3 | 4 =
      count === 0 ? 0 :
      count <= 2 ? 1 :
      count <= 5 ? 2 :
      count <= 9 ? 3 : 4;

    days.push({
      date: current.toISOString().split('T')[0],
      count,
      level,
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
}

const CELL_COLORS = [
  'rgba(22,27,34,1)',            // 0 - empty
  'rgba(0,255,136,0.15)',        // 1 - very light
  'rgba(0,255,136,0.35)',        // 2 - light
  'rgba(0,255,136,0.65)',        // 3 - medium
  'rgba(0,255,136,0.9)',         // 4 - heavy
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function HeatMap({ username }: HeatMapProps) {
  const contributions = useMemo(() => generateContributions(), [username]);
  
  // Group into weeks
  const weeks = useMemo(() => {
    const w: ContributionDay[][] = [];
    for (let i = 0; i < contributions.length; i += 7) {
      w.push(contributions.slice(i, i + 7));
    }
    return w;
  }, [contributions]);

  const totalContributions = contributions.reduce((sum, d) => sum + d.count, 0);

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const month = new Date(week[0].date).getMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTHS[month], weekIndex: wi });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div
      className="animate-fade-up rounded-2xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
            Contribution Activity
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {totalContributions.toLocaleString()} contributions in the last year
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Less</span>
          {[0,1,2,3,4].map(l => (
            <div
              key={l}
              className="w-3 h-3 rounded-sm"
              style={{ background: CELL_COLORS[l], border: '1px solid rgba(255,255,255,0.05)' }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: '600px' }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ marginLeft: '24px' }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find(m => m.weekIndex === wi);
              return (
                <div key={wi} style={{ width: '14px', marginRight: '2px', flexShrink: 0 }}>
                  {ml && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px', whiteSpace: 'nowrap' }}>
                      {ml.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day labels + grid */}
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col" style={{ marginRight: '4px', width: '20px' }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{ height: '14px', marginBottom: '2px' }}>
                  <span className="text-xs leading-none" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{d}</span>
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-0.5">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      title={`${day.date}: ${day.count} contributions`}
                      className="rounded-sm cursor-default transition-all duration-150 hover:scale-110"
                      style={{
                        width: '12px',
                        height: '12px',
                        background: CELL_COLORS[day.level],
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {[
          { label: 'Longest Streak', value: `${Math.floor(Math.random() * 30) + 10}d` },
          { label: 'Current Streak', value: `${Math.floor(Math.random() * 10) + 1}d` },
          { label: 'Best Day', value: `${Math.floor(Math.random() * 20) + 10}` },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-xs font-semibold" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}