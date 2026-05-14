'use client';

import { useI18n } from '@/lib/i18n';

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[0.7rem] font-medium text-[var(--muted)] transition-colors duration-200 hover:text-[var(--text)] hover:border-[var(--border-strong)]"
      aria-label="Toggle language"
    >
      <span className="text-xs">{lang === 'th' ? '🇹🇭' : '🇬🇧'}</span>
      <span className="uppercase tracking-wider">{lang === 'th' ? 'TH' : 'EN'}</span>
    </button>
  );
}
