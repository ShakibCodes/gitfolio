'use client';

import { useRouter } from 'next/navigation';
import { GitHubUser } from '@/types/github';
import {
  Search,
  Sparkles,
  Swords,
  Share2,
  Bot,
  ExternalLink,
  ArrowLeft,
  LayoutDashboard,
  Briefcase,
  Command,
} from 'lucide-react';

interface NavbarProps {
  user: GitHubUser;
  viewMode: 'dashboard' | 'portfolio';
  setViewMode: (mode: 'dashboard' | 'portfolio') => void;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  onOpenVersus: () => void;
  onOpenExport: () => void;
  onOpenCommandPalette: () => void;
}

export default function Navbar({
  user,
  viewMode,
  setViewMode,
  aiOpen,
  setAiOpen,
  onOpenVersus,
  onOpenExport,
  onOpenCommandPalette,
}: NavbarProps) {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-40 glass-card border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
      {/* Left: Brand + Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/25 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
            Git<span className="text-emerald-400">Folio</span>
          </span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-4 h-4 rounded-full"
          />
          <span className="text-slate-200 font-semibold truncate max-w-[120px] sm:max-w-[180px]">
            @{user.login}
          </span>
        </div>
      </div>

      {/* Center: View Switcher (Dashboard vs Portfolio) */}
      <div className="hidden md:flex rounded-xl bg-slate-900/90 p-1 border border-white/10 text-xs font-mono">
        <button
          onClick={() => setViewMode('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            viewMode === 'dashboard'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setViewMode('portfolio')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            viewMode === 'portfolio'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Showcase Portfolio</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Cmd+K trigger button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-mono transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search or Command</span>
          <kbd className="px-1.5 py-0.2 rounded bg-slate-900 border border-white/10 text-[10px] text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Versus Battle Button */}
        <button
          onClick={onOpenVersus}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono transition-all font-medium"
          title="Battle another developer"
        >
          <Swords className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Versus</span>
        </button>

        {/* Export Badges Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono transition-all"
          title="Export profile badges & embeds"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* AI Chat Button */}
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
            aiOpen
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>{aiOpen ? 'Close AI' : 'AI Assistant'}</span>
        </button>
      </div>
    </nav>
  );
}
