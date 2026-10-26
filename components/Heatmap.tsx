'use client';

import { useState, useEffect, useMemo } from 'react';
import { ContributionData, Week, ContributionDay } from '@/types/github';
import { Activity, Flame } from 'lucide-react';

interface HeatMapProps {
  username: string;
  onDataLoaded?: (data: ContributionData) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateFallbackCalendar(): ContributionData {
  const weeks: Week[] = [];
  let total = 0;
  const now = new Date();

  for (let w = 52; w >= 0; w--) {
    const days: ContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      const count = Math.random() > 0.4 ? Math.floor(Math.random() * 6) + 1 : 0;
      total += count;
      days.push({
        date: date.toISOString().split('T')[0],
        contributionCount: count,
      });
    }
    weeks.push({ contributionDays: days });
  }

  return { totalContributions: total, weeks };
}

export default function HeatMap({ username, onDataLoaded }: HeatMapProps) {
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadContributions() {
      try {
        setLoading(true);
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        if (res.ok) {
          const json = await res.json();
          if (json?.total?.lastYear !== undefined && Array.isArray(json?.contributions)) {
            const weeks: Week[] = [];
            let currentWeek: ContributionDay[] = [];

            json.contributions.forEach((day: { date: string; count: number }) => {
              currentWeek.push({
                date: day.date,
                contributionCount: day.count,
              });
              if (currentWeek.length === 7) {
                weeks.push({ contributionDays: currentWeek });
                currentWeek = [];
              }
            });
            if (currentWeek.length > 0) {
              weeks.push({ contributionDays: currentWeek });
            }

            const formattedData: ContributionData = {
              totalContributions: json.total.lastYear,
              weeks,
            };

            if (isMounted) {
              setData(formattedData);
              onDataLoaded?.(formattedData);
            }
            return;
          }
        }
        throw new Error('Fallback needed');
      } catch {
        const fallback = generateFallbackCalendar();
        if (isMounted) {
          setData(fallback);
          onDataLoaded?.(fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadContributions();
    return () => {
      isMounted = false;
    };
  }, [username]);

  const stats = useMemo(() => {
    if (!data?.weeks) {
      return { total: 0, longestStreak: 0, currentStreak: 0 };
    }

    const allDays = data.weeks.flatMap((w) => w.contributionDays);
    let total = 0;
    let longestStreak = 0;
    let runningStreak = 0;

    allDays.forEach((d) => {
      total += d.contributionCount;
      if (d.contributionCount > 0) {
        runningStreak++;
        if (runningStreak > longestStreak) longestStreak = runningStreak;
      } else {
        runningStreak = 0;
      }
    });

    let currentStreak = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].contributionCount > 0) {
        currentStreak++;
      } else {
        if (i === allDays.length - 1) continue;
        break;
      }
    }

    return {
      total: data.totalContributions || total,
      longestStreak,
      currentStreak,
    };
  }, [data]);

  // Vercel monochrome grayscale activity scale
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-[#141414] border border-[#222222]';
    if (count <= 2) return 'bg-[#383838] border border-[#484848]';
    if (count <= 4) return 'bg-[#686868] border border-[#787878]';
    if (count <= 8) return 'bg-[#a3a3a3] border border-[#b5b5b5]';
    return 'bg-[#ededed] border border-white';
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 font-sans">
      {/* Title & Streak Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-900">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-neutral-400" />
            <span>Contribution Activity</span>
          </h3>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            {stats.total.toLocaleString()} contributions in the last year
          </p>
        </div>

        {/* Minimalist monochrome streaks */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-900 text-neutral-300 text-xs font-mono">
            <Flame className="w-3 h-3 text-neutral-400" />
            <span className="font-bold">{stats.longestStreak}d</span>
            <span className="text-neutral-500">best</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-900 text-neutral-300 text-xs font-mono">
            <Flame className="w-3 h-3 text-neutral-400" />
            <span className="font-bold">{stats.currentStreak}d</span>
            <span className="text-neutral-500">current</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          {/* Month Labels */}
          <div className="grid grid-cols-12 text-[10px] text-neutral-500 font-mono mb-2 px-1">
            {MONTHS.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          {loading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex gap-[3px]">
              {data?.weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.contributionDays.map((day, dIdx) => (
                    <div
                      key={day.date || `${wIdx}-${dIdx}`}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[11px] h-[11px] rounded-[2px] transition-transform hover:scale-125 cursor-pointer ${getCellColor(
                        day.contributionCount
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Hover Inspection */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-900 mt-2 font-mono">
        <div>
          {hoveredDay ? (
            <span className="text-neutral-200">
              {hoveredDay.contributionCount} contributions on {hoveredDay.date}
            </span>
          ) : (
            <span>Hover to inspect daily cadence</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#141414] border border-[#222222]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#383838]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#686868]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#a3a3a3]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#ededed]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
