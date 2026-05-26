'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Loader2, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { HeroBackground } from '@/components/hero-background';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/flows';
  const { t } = useI18n();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    if (!imageUrl.trim()) {
      setError('Image URL is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, imageUrl, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col">
      <HeroBackground />
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Form Container */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Decorative background blur */}
            <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-[var(--accent)]/10 blur-2xl pointer-events-none" />
            
            <div className="text-center mb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)] mb-4">
                <Zap size={20} fill="currentColor" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">{t('auth.register_title')}</h1>
              <p className="text-[0.85rem] text-[var(--muted)] mt-1.5">{t('auth.register_subtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[0.8rem] text-red-500 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">
                  {t('auth.username')}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/50 py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]"
                  placeholder={t('auth.register_username_placeholder')}
                  autoComplete="username"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/50 py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/50 py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/50 py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]"
                  placeholder={t('auth.password_placeholder')}
                  autoComplete="new-password"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">
                  {t('auth.confirm_password')}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/50 py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]"
                  placeholder={t('auth.password_placeholder')}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 futuristic-hover flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-[0.9rem] font-semibold text-white shadow-md shadow-[var(--accent-glow)] transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : t('auth.signup')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[0.8rem] text-[var(--muted)]">
                {t('auth.has_account')}{' '}
                <Link href={`/login${redirect !== '/flows' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-medium text-[var(--accent)] hover:underline">
                  {t('auth.signin_link')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
