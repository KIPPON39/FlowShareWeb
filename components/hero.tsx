'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Download, Eye, FileJson, Play, Pause, ChevronLeft, ChevronRight, Zap, Component, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { type WorkflowTemplate } from '@/lib/workflows';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeroProps {
  workflows?: WorkflowTemplate[];
  isLoading?: boolean;
}

export function Hero({ workflows = [], isLoading = false }: HeroProps) {
  const { t, lang } = useI18n();
  const items = isLoading ? Array.from({ length: 5 }).map((_, i) => ({ id: `skeleton-${i}`, isSkeleton: true } as any)) : workflows;

  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goNext = useCallback(() => {
    if (isAnimating || items.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % items.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, items.length]);

  const goPrev = useCallback(() => {
    if (isAnimating || items.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, items.length]);

  // Touch swipe gesture handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrev();
    }
  };

  // Auto-advance every 4.5 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(goNext, 4500); // Slide chronologically left-to-right
    return () => clearInterval(timer);
  }, [goNext, items.length]);

  // Compute position for each item relative to activeIndex
  const getPosition = (itemIndex: number): number | null => {
    if (items.length === 0) return null;
    const len = items.length;
    let diff = itemIndex - activeIndex;
    // Wrap around
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    // Only show items within -2..+2
    if (diff < -2 || diff > 2) return null;
    return diff + 2; // 0=far-left, 1=left, 2=center, 3=right, 4=far-right
  };

  // Card position configs — 3D carousel feel
  const getCardStyle = (position: number): React.CSSProperties => {
    const desktopConfigs: Record<number, { x: string; scale: number; opacity: number; z: number; rotateY: number; y: number }> = {
      0: { x: '-280%', scale: 0.55, opacity: 0, z: 1, rotateY: 35, y: 10 },
      1: { x: '-125%', scale: 0.82, opacity: 0.6, z: 2, rotateY: 12, y: 6 },
      2: { x: '0%', scale: 1.05, opacity: 1, z: 4, rotateY: 0, y: -4 },
      3: { x: '125%', scale: 0.82, opacity: 0.6, z: 2, rotateY: -12, y: 6 },
      4: { x: '280%', scale: 0.55, opacity: 0, z: 1, rotateY: -35, y: 10 },
    };

    const mobileConfigs: Record<number, { x: string; scale: number; opacity: number; z: number; rotateY: number; y: number }> = {
      0: { x: '-200%', scale: 0.55, opacity: 0, z: 1, rotateY: 20, y: 10 },
      1: { x: '-102%', scale: 0.8, opacity: 0.35, z: 2, rotateY: 8, y: 6 },
      2: { x: '0%', scale: 1.02, opacity: 1, z: 4, rotateY: 0, y: -4 },
      3: { x: '102%', scale: 0.8, opacity: 0.35, z: 2, rotateY: -8, y: 6 },
      4: { x: '200%', scale: 0.55, opacity: 0, z: 1, rotateY: -20, y: 10 },
    };

    const cfg = isMobile ? mobileConfigs[position] : desktopConfigs[position];
    return {
      transform: `translateX(calc(-50% + ${cfg.x})) translateY(${cfg.y}px) scale(${cfg.scale}) perspective(800px) rotateY(${cfg.rotateY}deg)`,
      opacity: cfg.opacity,
      zIndex: cfg.z,
      transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginTop: '-85px',
    };
  };

  // Hidden style for items not in the visible 5
  const hiddenStyle: React.CSSProperties = {
    transform: 'translateX(-50%) scale(0.4)',
    opacity: 0,
    zIndex: 0,
    transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginTop: '-85px',
    pointerEvents: 'none' as const,
  };

  return (
    <section id="explore" className="relative flex flex-col justify-center min-h-[calc(100vh-64px)] w-full overflow-hidden border-b border-[var(--border)]">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80 dark:opacity-60">
        {/* Fade to bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)] opacity-90 pointer-events-none" />
      </div>

      <div className="relative z-10 grid gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-10 sm:py-16 lg:py-20 text-center">
        <div className="grid gap-5">
          <h1 className="mx-auto max-w-3xl text-[1.6rem] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold leading-[1.2] sm:leading-[1.12] tracking-tight text-[var(--hero-title)] break-words">
            {lang === 'th' ? (
              <>
                <span className="hero-gradient-text">{t('hero.title.1')}</span>{' '}
                {t('hero.title.2')} <br className="hidden sm:inline" />
                {t('hero.title.3')}
              </>
            ) : (
              <>
                {t('hero.title.1')} <span className="hero-gradient-text">{t('hero.title.2')}</span>{' '}
                <br className="hidden sm:inline" />
                {t('hero.title.3')}
              </>
            )}
          </h1>
          <p className="mx-auto max-w-xl text-[0.95rem] sm:text-base text-[var(--hero-desc)] leading-relaxed px-2">
            {lang === 'th'
              ? 'เริ่มต้นการสร้างระบบอัตโนมัติของคุณด้วยเทมเพลตที่ได้รับการตรวจสอบแล้วจากส่วนกลาง มั่นใจในความปลอดภัยและพร้อมใช้งานทันทีสำหรับบุคลากรในองค์กร'
              : 'Jumpstart your automation with verified templates from the central repository. Secure, reliable, and ready to deploy for your organization.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#browse"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="futuristic-hover flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-[0.95rem] font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97] shadow-lg shadow-[var(--accent-glow)]"
          >
            {t('cta.browse')}
          </a>
        </div>

        {/* Flow Cards Slideshow */}
        {(items.length > 0 || isLoading) && (
          <div className="relative mt-6 w-full flex flex-col items-center">
            {/* Carousel container */}
            <div
              className="relative w-full h-[190px] flex items-center justify-center overflow-hidden touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {items.map((flow, itemIndex) => {
                const position = getPosition(itemIndex);
                const isCenter = position === 2;
                const style = position !== null ? getCardStyle(position) : hiddenStyle;

                if (isLoading) {
                  return (
                    <div
                      key={`skeleton-${itemIndex}`}
                      className="block w-[260px] sm:w-[280px] select-none"
                      style={style}
                    >
                      <div className="h-[170px] rounded-2xl border p-5 flex flex-col text-left backdrop-blur-xl border-[var(--border)] shadow-lg bg-[var(--surface)]/70">
                        <div className="h-5 w-3/4 bg-[var(--border)] rounded animate-pulse mb-3" />
                        <div className="flex gap-1.5 mb-3">
                          <div className="h-4 w-12 bg-[var(--border)] rounded-full animate-pulse" />
                          <div className="h-4 w-16 bg-[var(--border)] rounded-full animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]/60">
                          <div className="h-3 w-16 bg-[var(--border)] rounded animate-pulse" />
                          <div className="h-3 w-12 bg-[var(--border)] rounded animate-pulse" />
                          <div className="h-3 w-10 bg-[var(--border)] rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={`${flow.id}-${itemIndex}`}
                    href={`/workflow/${flow.id}`}
                    className="block w-[260px] sm:w-[280px] cursor-pointer select-none"
                    style={style}
                    tabIndex={isCenter ? 0 : -1}
                    onClick={(e) => { if (!isCenter) e.preventDefault(); }}
                  >
                    <div
                      className={`
                        h-[170px] rounded-2xl border p-5 flex flex-col text-left
                        backdrop-blur-xl transition-all duration-500
                        ${isCenter
                          ? 'border-[var(--accent)]/40 shadow-2xl shadow-[var(--accent-glow)] bg-[var(--surface)] ring-1 ring-[var(--accent)]/10'
                          : 'border-[var(--border)] shadow-lg bg-[var(--surface)]/70'
                        }
                      `}
                    >
                      {/* Title — BIG and prominent */}
                      <h3 className={`
                        font-bold tracking-tight leading-snug line-clamp-3 flex-1
                        ${isCenter
                          ? 'text-[1.15rem] text-[var(--text)]'
                          : 'text-[0.95rem] text-[var(--text)]/80'
                        }
                        mb-2
                      `}>
                        {flow.title}
                      </h3>

                      {/* Tags row */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {flow.tags?.slice(0, 3).map((tag: string, tagIdx: number) => (
                          <span
                            key={tagIdx}
                            className={`
                              inline-flex items-center whitespace-nowrap shrink-0 rounded-full px-2.5 h-[20px] text-[0.6rem] font-semibold uppercase tracking-wide
                              ${isCenter
                                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/15'
                                : 'bg-[var(--tag-alt-bg)] text-[var(--muted-strong)] border border-[var(--border)]'
                              }
                            `}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Bottom stats */}
                      <div className="flex items-center justify-between text-[0.65rem] text-[var(--muted)] mt-auto pt-3 border-t border-[var(--border)]/60 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Component size={11} className="opacity-60" />
                          <span>{flow.nodes || 1} nodes</span>
                        </div>

                        <span className="truncate max-w-[80px] opacity-70 text-center">{flow.keys?.[0] || '—'}</span>

                        <div className="flex items-center gap-1.5">
                          <Download size={11} className="opacity-60" />
                          <span>{flow.downloads || 0}</span>
                        </div>
                      </div>

                      {/* View detail hint on center card */}
                      {isCenter && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full pt-3 flex items-center gap-1 text-[0.65rem] text-[var(--accent)] font-semibold opacity-70">
                          <span>{t('hero.view_details')}</span>
                          <ArrowRight size={10} />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Navigation: arrows + dots */}
            <div className="flex items-center gap-5 mt-10">
              <button
                onClick={goPrev}
                className="p-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-md text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40 transition-all duration-200 active:scale-90"
                aria-label="Previous"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (isAnimating || isLoading) return;
                      setIsAnimating(true);
                      setActiveIndex(i);
                      setTimeout(() => setIsAnimating(false), 600);
                    }}
                    className={`
                      rounded-full transition-all duration-400 ease-out
                      ${i === activeIndex
                        ? 'w-7 h-2 bg-[var(--accent)]'
                        : 'w-2 h-2 bg-[var(--muted-light)] hover:bg-[var(--muted-soft)]'
                      }
                    `}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                className="p-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-md text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40 transition-all duration-200 active:scale-90"
                aria-label="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer text-[var(--muted)] hover:text-[var(--text)] transition-colors animate-bounce"
        onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em]">{t('hero.scroll_down')}</span>
        <ChevronDown size={20} />
      </div>
    </section>
  );
}
