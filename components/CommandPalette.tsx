'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Repo } from '@/types/github';
import {
  Search,
  User,
  FolderGit2,
  Swords,
  Share2,
  Bot,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  repos: Repo[];
  onToggleAi: () => void;
  onOpenVersus: () => void;
  onOpenExport: () => void;
  onTogglePortfolio: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  repos,
  onToggleAi,
  onOpenVersus,
  onOpenExport,
  onTogglePortfolio,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLookupUser = () => {
    const clean = query.trim().replace(/^@/, '');
    if (clean) {
      onClose();
      router.push(`/dashboard/${clean}`);
    }
  };

  const filteredRepos = repos
    .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            autoFocus
            placeholder="Type a GitHub username or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLookupUser();
            }}
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-600 outline-none font-mono"
          />
          <kbd className="px-1.5 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-[10px] text-neutral-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Options List */}
        <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
          {query.trim() && (
            <div
              onClick={handleLookupUser}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-900 text-neutral-200 cursor-pointer transition-colors"
            >
              <User className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-mono">
                Inspect <strong>@{query.trim().replace(/^@/, '')}</strong>
              </span>
              <span className="ml-auto text-[10px] text-neutral-500 font-mono">↵</span>
            </div>
          )}

          <div className="px-2 pt-2 pb-1 text-[10px] uppercase font-mono text-neutral-500 tracking-wider">
            Quick Actions
          </div>

          <div
            onClick={() => {
              onClose();
              onTogglePortfolio();
            }}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-900 text-neutral-300 cursor-pointer transition-colors text-xs font-mono"
          >
            <Sparkles className="w-4 h-4 text-neutral-400" />
            <span>Switch to Portfolio / Resume Mode</span>
          </div>

          <div
            onClick={() => {
              onClose();
              onOpenVersus();
            }}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-900 text-neutral-300 cursor-pointer transition-colors text-xs font-mono"
          >
            <Swords className="w-4 h-4 text-neutral-400" />
            <span>Launch Developer Versus (1v1)</span>
          </div>

          <div
            onClick={() => {
              onClose();
              onOpenExport();
            }}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-900 text-neutral-300 cursor-pointer transition-colors text-xs font-mono"
          >
            <Share2 className="w-4 h-4 text-neutral-400" />
            <span>Export README Badges & Embeds</span>
          </div>

          <div
            onClick={() => {
              onClose();
              onToggleAi();
            }}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-900 text-neutral-300 cursor-pointer transition-colors text-xs font-mono"
          >
            <Bot className="w-4 h-4 text-neutral-400" />
            <span>Toggle AI Assistant</span>
          </div>

          {filteredRepos.length > 0 && (
            <>
              <div className="px-2 pt-3 pb-1 text-[10px] uppercase font-mono text-neutral-500 tracking-wider">
                Matching Repositories
              </div>
              {filteredRepos.map((r) => (
                <a
                  key={r.id}
                  href={r.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-900 text-neutral-300 transition-colors text-xs font-mono"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FolderGit2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="truncate">{r.name}</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-neutral-500" />
                </a>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
