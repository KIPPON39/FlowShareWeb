'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useState, useEffect } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; email?: string; imageUrl?: string; role?: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setProfileOpen(false);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const navLinks = [
    { href: '/', label: t('nav.explore'), exact: true },
    { href: '/flows', label: t('nav.flows'), exact: true },
  ];

  if (user?.role?.toLowerCase() === 'admin') {
    navLinks.push({ href: '/upload', label: t('nav.create'), exact: true });
  }

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full px-4 sm:px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-[10px] overflow-hidden bg-[var(--surface-alt)] shadow-sm transition-transform duration-200 group-hover:scale-105 border border-[var(--border)]">
            <Image 
              src="/logo_flowshare_lightmode.svg" 
              alt="FlowShare Logo" 
              fill 
              className="object-cover logo-light" 
              sizes="36px"
            />
            <Image 
              src="/logo_flowshare_darkmode.svg" 
              alt="FlowShare Logo" 
              fill 
              className="object-cover logo-dark" 
              sizes="36px"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[1rem] font-bold tracking-tight navbar-brand-text leading-none mt-1">
              FlowShare
            </span>
            <span className="text-[0.65rem] text-[var(--muted-soft)] font-medium mt-0.5 tracking-wide">
              by KKU Library
            </span>
          </div>
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
          
          <div className="mx-1.5 h-4 w-px bg-[var(--border)]" />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="relative flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-500 text-white shadow-sm transition-transform hover:scale-105 active:scale-95 overflow-hidden"
              >
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.username}
                    fill
                    sizes="32px"
                    className="object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs font-bold uppercase">{user.username.charAt(0)}</span>
                )}
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl backdrop-blur-xl">
                  <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                    <p className="text-[0.75rem] text-[var(--muted)]">Signed in as</p>
                    <p className="text-[0.85rem] font-medium text-[var(--text)] truncate">{user.username}</p>
                    {user.email && <p className="text-[0.75rem] text-[var(--muted)] truncate">{user.email}</p>}
                  </div>
                  {user.role?.toLowerCase() === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="block w-full text-left rounded-lg px-3 py-2 text-[0.85rem] font-medium text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors mb-1"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left rounded-lg px-3 py-2 text-[0.85rem] font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-1 rounded-full bg-[var(--accent)] px-4 py-1.5 text-[0.8rem] font-semibold text-white shadow-sm shadow-[var(--accent-glow)] transition-all hover:opacity-90 active:scale-95"
            >
              Sign In
            </Link>
          )}
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

          <div className="mt-4 border-t border-[var(--border)] pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="relative flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-500 text-white shadow-sm overflow-hidden">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.username}
                        fill
                        sizes="32px"
                        className="object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-sm font-bold uppercase">{user.username.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-[var(--muted)]">Signed in as</p>
                    <p className="text-[0.9rem] font-medium text-[var(--text)]">{user.username}</p>
                    {user.email && <p className="text-[0.75rem] text-[var(--muted)] truncate">{user.email}</p>}
                  </div>
                </div>
                {user.role?.toLowerCase() === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left rounded-lg px-4 py-2.5 text-[0.85rem] font-medium text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-lg bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--accent-glow)] transition-all hover:opacity-90"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
