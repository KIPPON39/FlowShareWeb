'use client';

import Link from 'next/link';
import { CloudUpload, Zap } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="glass sticky top-0 z-50 w-full px-4 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Futuristic Brand */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-[0_0_20px_rgba(167,59,36,0.35)] transition-all group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(167,59,36,0.5)]">
            <Zap size={20} fill="currentColor" className="relative z-10" />
            <div className="absolute -inset-1 rounded-2xl border border-[rgba(167,59,36,0.25)] opacity-30 group-hover:opacity-60 transition-opacity" />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="text-lg font-black tracking-tighter bg-linear-to-r from-[var(--text)] via-[var(--text-subtle)] to-[var(--muted-strong)] bg-clip-text text-transparent italic">
              FLOWSHARE
            </span>
          </div>
        </Link>
        
        {/* Floating Minimal Pill (Restored) */}
        <div className="hidden min-[720px]:flex items-center gap-1 rounded-full border border-[var(--border)] bg-white/40 dark:bg-black/20 px-1 py-1 backdrop-blur-md shadow-sm">
          <Link 
            href="/" 
            className={`rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${pathname === '/' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10'}`}
          >
            Explore
          </Link>
          <Link 
            href="/upload" 
            className={`rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${pathname === '/upload' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10'}`}
          >
            Create
          </Link>
          <div className="mx-2 h-4 w-px bg-[var(--border)] opacity-50" />
          <ThemeToggle />
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <div className="min-[720px]:hidden">
            <ThemeToggle />
          </div>
          <Link 
            href="/upload" 
            className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-[var(--accent)] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-[1.05] shadow-lg shadow-[var(--accent-glow)] active:scale-95"
          >
            <CloudUpload size={18} className="transition-transform group-hover:-translate-y-0.5" />
            <span className="relative z-10">Ship Flow</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
