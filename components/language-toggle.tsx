'use client';

import { useI18n } from '@/lib/i18n';

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
      className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--muted-strong)] transition-all hover:translate-y-[-2px] hover:shadow-md hover:text-[var(--text)] hover:border-[var(--accent)]"
      aria-label="Toggle language"
    >
      <span className="text-sm">{lang === 'th' ? '🇹🇭' : '🇬🇧'}</span>
      <span className="uppercase tracking-wider">{lang === 'th' ? 'TH' : 'EN'}</span>
    </button>
  );
}
