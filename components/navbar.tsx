'use client';

import Link from 'next/link';
import { Zap, Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        
        {/* Floating Minimal Pill - Desktop */}
        <div className="hidden min-[720px]:flex items-center gap-1 rounded-full border border-[var(--border)] bg-white/40 dark:bg-black/20 px-1 py-1 backdrop-blur-md shadow-sm">
          <Link 
            href="/" 
            className={`rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${pathname === '/' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10'}`}
          >
            {t('nav.explore')}
          </Link>
          <Link 
            href="/upload" 
            className={`rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${pathname === '/upload' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10'}`}
          >
            {t('nav.create')}
          </Link>
          <div className="mx-2 h-4 w-px bg-[var(--border)] opacity-50" />
          <ThemeToggle />
          <LanguageToggle />
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 min-[720px]:hidden">
          <ThemeToggle />
          <LanguageToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-soft)] transition-all hover:text-[var(--text)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="min-[720px]:hidden mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl backdrop-blur-xl">
          <div className="grid gap-2">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all ${pathname === '/' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'}`}
            >
              {t('nav.explore')}
            </Link>
            <Link 
              href="/upload" 
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all ${pathname === '/upload' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'}`}
            >
              {t('nav.create')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
