'use client';

import { Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const FILTERS = ['AI', 'Email', 'Finance', 'Scraping', 'Data', 'Integration', 'Marketing', 'Analytics', 'CRM', 'DevOps'];

interface HeroProps {
  flowCount?: number;
}

export function Hero({ flowCount = 0 }: HeroProps) {
  const { t, lang } = useI18n();

  return (
    <section id="explore" className="grid gap-6 px-2 sm:px-4 py-10 text-center sm:py-16 lg:py-20 border-b border-[var(--border)]">
      <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] tracking-tight">
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
      <p className="mx-auto max-w-2xl text-base sm:text-lg text-[var(--muted-strong)] leading-relaxed font-medium px-2">
        {lang === 'th'
          ? 'เริ่มต้น flow ถัดไปของคุณด้วยเทมเพลตสำเร็จรูปจากชุมชน เชื่อถือได้ ปลอดภัย พร้อมใช้งานในทุกสแต็ค'
          : 'Jumpstart your next flow with pre-built templates from the community. Reliable, secure, and ready to deploy in any stack.'}
      </p>

      <div className="search-glow group relative mx-auto w-full max-w-full px-0 transition-all duration-500 sm:max-w-[560px] sm:focus-within:max-w-[680px]">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 sm:px-5 py-3 sm:py-4 shadow-2xl shadow-black/[0.02] ring-[var(--accent-soft)] transition-all group-focus-within:border-[var(--accent)] group-focus-within:ring-8 sm:group-focus-within:scale-[1.03]">
          <Search size={22} className="text-[var(--muted-soft)] transition-colors group-focus-within:text-[var(--accent)]" />
          <input 
            type="text" 
            placeholder={t('hero.search')}
            className="flex-1 bg-transparent text-base sm:text-lg font-medium outline-hidden placeholder:text-[var(--muted-light)] text-[var(--text)]"
          />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-[var(--border)] bg-[var(--surface-alt)] px-2 font-mono text-[10px] font-bold text-[var(--muted-strong)]">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <div className="relative mt-6 sm:mt-8 flex flex-col items-center">
        <span className="mb-4 text-[0.65rem] sm:text-[0.7rem] font-black uppercase tracking-[0.3em] text-[var(--muted-strong)]">
          {t('hero.ecosystem')}
        </span>
        <div className="relative flex w-full max-w-4xl items-center overflow-hidden py-2">
          <div className="absolute top-0 left-0 z-10 h-full w-16 sm:w-32 bg-linear-to-r from-[var(--bg)] to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 z-10 h-full w-16 sm:w-32 bg-linear-to-l from-[var(--bg)] to-transparent pointer-events-none" />
          
          <div className="animate-scroll flex w-max gap-3 sm:gap-4 px-4 sm:px-10 hover:[animation-play-state:paused]">
            {[...FILTERS, ...FILTERS].map((filter, i) => (
              <button 
                key={i} 
                className="group/tag flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-[var(--muted-strong)] transition-all hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent-soft)] active:scale-95 whitespace-nowrap"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {/* Live Stats - Dynamic count */}
        <div className="mt-6 sm:mt-8 flex items-center gap-2 text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-widest text-[var(--muted-soft)]">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span>{flowCount.toLocaleString()} {t('hero.flows_live')}</span>
        </div>
      </div>
    </section>
  );
}
