'use client';

import { DevMetrics } from '@/types/github';
import { Award, Zap, Star, ShieldCheck, Flame } from 'lucide-react';

interface DevScoreCardProps {
  metrics: DevMetrics;
  username: string;
}

export default function DevScoreCard({ metrics, username }: DevScoreCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-900">
        <div className="flex items-center gap-2.5">
          <Award className="w-4 h-4 text-neutral-400" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Developer Evaluation Index
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400">
            v2.0 Algorithmic
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-200 font-bold">
            {metrics.tier}-TIER
          </span>
        </div>
      </div>

      {/* Main Score + Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
        {/* Score Number */}
        <div className="md:col-span-5 flex items-center gap-5">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-bold tracking-tight text-white font-mono">
                {metrics.score}
              </span>
              <span className="text-sm font-mono text-neutral-500">/ 100</span>
            </div>
            <span className="text-xs font-mono text-neutral-500 mt-1">
              Overall Rating
            </span>
          </div>

          <div className="h-12 w-[1px] bg-neutral-800 hidden sm:block" />

          <div className="flex-1">
            <h4 className="text-sm font-semibold text-neutral-200">{metrics.archetype}</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{metrics.archetypeDesc}</p>
          </div>
        </div>

        {/* 5 Pillars (Clean minimalist bars) */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Star className="w-3 h-3 text-neutral-400" /> Star Power
              </span>
              <span className="text-neutral-300">{metrics.pillars.starPower}%</span>
            </div>
            <div className="h-1 rounded-full bg-neutral-900 overflow-hidden">
              <div
                className="h-full bg-neutral-300 rounded-full transition-all duration-500"
                style={{ width: `${metrics.pillars.starPower}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-neutral-400" /> Code Output & Velocity
              </span>
              <span className="text-neutral-300">{metrics.pillars.activity}%</span>
            </div>
            <div className="h-1 rounded-full bg-neutral-900 overflow-hidden">
              <div
                className="h-full bg-neutral-300 rounded-full transition-all duration-500"
                style={{ width: `${metrics.pillars.activity}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-neutral-400" /> Consistency Streak
              </span>
              <span className="text-neutral-300">{metrics.pillars.consistency}%</span>
            </div>
            <div className="h-1 rounded-full bg-neutral-900 overflow-hidden">
              <div
                className="h-full bg-neutral-300 rounded-full transition-all duration-500"
                style={{ width: `${metrics.pillars.consistency}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-neutral-400" /> Polyglot Breadth
              </span>
              <span className="text-neutral-300">{metrics.pillars.polyglot}%</span>
            </div>
            <div className="h-1 rounded-full bg-neutral-900 overflow-hidden">
              <div
                className="h-full bg-neutral-300 rounded-full transition-all duration-500"
                style={{ width: `${metrics.pillars.polyglot}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="pt-4 border-t border-neutral-900">
        <div className="flex flex-wrap gap-2">
          {metrics.badges.map((b) => (
            <div
              key={b.id}
              title={b.desc}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-900/60 text-xs font-mono text-neutral-300"
            >
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
