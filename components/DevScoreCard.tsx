'use client';

import { DevMetrics } from '@/types/github';
import confetti from 'canvas-confetti';
import { Award, Zap, Star, ShieldCheck, Flame, Sparkles } from 'lucide-react';

interface DevScoreCardProps {
  metrics: DevMetrics;
  username: string;
}

export default function DevScoreCard({ metrics, username }: DevScoreCardProps) {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b'],
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S+':
        return 'from-amber-400 via-emerald-400 to-cyan-400 text-amber-300 border-amber-400/40';
      case 'S':
        return 'from-emerald-400 to-teal-300 text-emerald-400 border-emerald-400/40';
      case 'A':
        return 'from-blue-400 to-cyan-400 text-blue-400 border-blue-400/40';
      case 'B':
        return 'from-purple-400 to-pink-400 text-purple-400 border-purple-400/40';
      default:
        return 'from-slate-400 to-slate-200 text-slate-300 border-slate-400/30';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden border border-white/10">
      {/* Decorative top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 opacity-80" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              GitFolio Intelligence Score
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                v2.0 Algorithmic
              </span>
            </h3>
            <p className="text-xs text-slate-400">{metrics.archetype}</p>
          </div>
        </div>

        <button
          onClick={triggerConfetti}
          title="Celebrate rating"
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-400 border border-white/10 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Celebrate</span>
        </button>
      </div>

      {/* Main Score + Tier Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mb-5 pb-5 border-b border-white/5">
        {/* Score Radial representation */}
        <div className="sm:col-span-5 flex items-center gap-4">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-slate-900/80 border border-white/10 shadow-inner">
            <div className="text-center">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                {metrics.score}
              </span>
              <span className="text-[10px] block text-slate-400 -mt-1 font-mono">/ 100</span>
            </div>
            {/* Tier Stamp badge */}
            <div
              className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-md text-xs font-black border bg-slate-950 shadow-lg ${getTierColor(
                metrics.tier
              )}`}
            >
              {metrics.tier}
            </div>
          </div>

          <div className="flex-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
              Archetype Verdict
            </span>
            <h4 className="text-base font-bold text-slate-100 leading-snug">{metrics.archetype}</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{metrics.archetypeDesc}</p>
          </div>
        </div>

        {/* 5 Pillars Breakdown */}
        <div className="sm:col-span-7 space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" /> Star Power
              </span>
              <span className="font-mono text-slate-200">{metrics.pillars.starPower}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700"
                style={{ width: `${metrics.pillars.starPower}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> Code Output & Velocity
              </span>
              <span className="font-mono text-slate-200">{metrics.pillars.activity}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${metrics.pillars.activity}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> Consistency Streak
              </span>
              <span className="font-mono text-slate-200">{metrics.pillars.consistency}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-700"
                style={{ width: `${metrics.pillars.consistency}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" /> Polyglot Breadth
              </span>
              <span className="font-mono text-slate-200">{metrics.pillars.polyglot}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${metrics.pillars.polyglot}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Earned Badges Row */}
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <span>Earned Engineering Badges</span>
          <span className="text-slate-600">({metrics.badges.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {metrics.badges.map((b) => (
            <div
              key={b.id}
              title={b.desc}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-white/10 hover:border-emerald-500/40 text-xs text-slate-300 transition-all cursor-help"
            >
              <span>{b.icon}</span>
              <span className="font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
