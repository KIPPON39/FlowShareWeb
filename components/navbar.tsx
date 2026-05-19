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

  const navLinks = [
    { href: '/', label: t('nav.explore'), exact: true },
    { href: '/flows', label: t('nav.flows'), exact: true },
    { href: '/upload', label: t('nav.create'), exact: true },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full px-4 sm:px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition-transform duration-200 group-hover:scale-105">
            <Zap size={16} fill="currentColor" />
          </div>
          <span className="text-[0.95rem] font-semibold tracking-tight text-[var(--text)]">
            FlowShare
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden min-[720px]:flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-1 py-1 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-1.5 text-[0.8rem] font-medium transition-all duration-200 ${isActive(link.href, link.exact) ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mx-1.5 h-4 w-px bg-[var(--border)]" />
          <ThemeToggle />
          <LanguageToggle />
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-1.5 min-[720px]:hidden">
          <ThemeToggle />
          <LanguageToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="min-[720px]:hidden mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 backdrop-blur-xl">
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive(link.href, link.exact) ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
