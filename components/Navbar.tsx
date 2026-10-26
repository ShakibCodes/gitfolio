'use client';

import { useRouter } from 'next/navigation';
import { GitHubUser } from '@/types/github';
import {
  Search,
  Swords,
  Share2,
  Bot,
  ArrowLeft,
  LayoutDashboard,
  Briefcase,
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
    <nav className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 font-sans">
      {/* Left: Brand + Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          title="Back to search"
        >
          <div className="w-6 h-6 rounded border border-neutral-800 bg-neutral-950 flex items-center justify-center text-neutral-300 hover:border-neutral-700">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <svg viewBox="0 0 76 65" fill="currentColor" className="w-3 h-3 text-white">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            <span className="font-semibold text-xs tracking-tight text-white">
              GitFolio
            </span>
          </div>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-950 text-xs font-mono">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-3.5 h-3.5 rounded-full"
          />
          <span className="text-neutral-200 truncate max-w-[120px] sm:max-w-[180px]">
            {user.login}
          </span>
        </div>
      </div>

      {/* Center: View Switcher (Dashboard vs Portfolio) */}
      <div className="flex rounded-md bg-neutral-950 p-0.5 border border-neutral-800 text-xs font-mono">
        <button
          onClick={() => setViewMode('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
            viewMode === 'dashboard'
              ? 'bg-neutral-800 text-white font-medium'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <LayoutDashboard className="w-3 h-3" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setViewMode('portfolio')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
            viewMode === 'portfolio'
              ? 'bg-neutral-800 text-white font-medium'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Briefcase className="w-3 h-3" />
          <span>Portfolio</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Search / Command trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-mono transition-colors"
        >
          <Search className="w-3 h-3" />
          <span className="text-[11px]">Command</span>
          <kbd className="px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400">
            ⌘K
          </kbd>
        </button>

        {/* Versus Battle Button */}
        <button
          onClick={onOpenVersus}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono transition-colors"
        >
          <Swords className="w-3 h-3 text-neutral-400" />
          <span className="hidden sm:inline">Versus</span>
        </button>

        {/* Export Badges Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono transition-colors"
        >
          <Share2 className="w-3 h-3 text-neutral-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
            aiOpen
              ? 'bg-white text-black font-medium'
              : 'border border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-300 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>{aiOpen ? 'Close AI' : 'AI Assistant'}</span>
        </button>
      </div>
    </nav>
  );
}
