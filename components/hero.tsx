'use client';

import { Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const FILTERS = ['AI', 'Email', 'Finance', 'Scraping', 'Data', 'Integration', 'Marketing', 'Analytics', 'CRM', 'DevOps'];

interface HeroProps {
  flowCount?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Hero({ flowCount = 0, searchQuery = '', onSearchChange }: HeroProps) {
  const { t, lang } = useI18n();

  return (
    <section id="explore" className="grid gap-8 px-4 sm:px-4 py-14 text-center sm:py-20 lg:py-24 overflow-hidden">
      <div className="grid gap-5">
        <h1 className="mx-auto max-w-3xl text-[1.6rem] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold leading-[1.2] sm:leading-[1.12] tracking-tight text-[var(--text)] break-words">
          {lang === 'th' ? (
            <>
              <span className="text-[var(--accent)]">{t('hero.title.1')}</span>{' '}
              {t('hero.title.2')} <br className="hidden sm:inline" />
              {t('hero.title.3')}
            </>
          ) : (
            <>
              {t('hero.title.1')} <span className="text-[var(--accent)]">{t('hero.title.2')}</span>{' '}
              <br className="hidden sm:inline" />
              {t('hero.title.3')}
            </>
          )}
        </h1>
        <p className="mx-auto max-w-xl text-[0.95rem] sm:text-base text-[var(--muted)] leading-relaxed px-2">
          {lang === 'th'
            ? 'เริ่มต้น flow ถัดไปของคุณด้วยเทมเพลตสำเร็จรูปจากชุมชน เชื่อถือได้ ปลอดภัย พร้อมใช้งานในทุกสแต็ค'
            : 'Jumpstart your next flow with pre-built templates from the community. Reliable, secure, and ready to deploy in any stack.'}
        </p>
      </div>

      {/* Search */}
      <div className="search-glow group relative mx-auto w-full max-w-[520px] transition-all duration-300 sm:focus-within:max-w-[600px]">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-all duration-200 group-focus-within:border-[var(--accent)] group-focus-within:shadow-[var(--ring)]">
          <Search size={18} className="text-[var(--muted-light)] transition-colors group-focus-within:text-[var(--accent)]" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={t('hero.search')}
            className="flex-1 bg-transparent text-sm sm:text-[0.95rem] outline-hidden placeholder:text-[var(--muted-light)] text-[var(--text)]"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--surface-alt)] px-1.5 font-mono text-[10px] text-[var(--muted-soft)]">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Filter tags */}
      <div className="relative mt-2 flex flex-col items-center gap-5">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-soft)]">
          {t('hero.ecosystem')}
        </span>
        <div className="relative flex w-full max-w-3xl items-center overflow-hidden">
          <div className="absolute top-0 left-0 z-10 h-full w-16 sm:w-24 bg-linear-to-r from-[var(--bg)] to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 z-10 h-full w-16 sm:w-24 bg-linear-to-l from-[var(--bg)] to-transparent pointer-events-none" />
          
          <div className="animate-scroll flex w-max gap-2.5 px-4 sm:px-8 hover:[animation-play-state:paused]">
            {[...FILTERS, ...FILTERS].map((filter, i) => (
              <button 
                key={i} 
                onClick={() => onSearchChange?.(filter)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[0.75rem] font-medium text-[var(--muted-strong)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] active:scale-95 whitespace-nowrap"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {/* Live count */}
        <div className="flex items-center gap-2 text-[0.7rem] text-[var(--muted-soft)]">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono font-medium tabular-nums">{flowCount.toLocaleString()}</span>
          <span className="font-medium">{t('hero.flows_live')}</span>
        </div>
      </div>
    </section>
  );
}
