'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleMount = () => {
      setMounted(true);
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setTheme(initial);
    };
    
    const timeoutId = setTimeout(handleMount, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-lg border border-[var(--border)] bg-[var(--surface)]" />
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-soft)] transition-colors duration-200 hover:text-[var(--text)] hover:border-[var(--border-strong)]"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
}
