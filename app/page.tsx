'use client';

import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { HeroBackground } from '@/components/hero-background';
import { WorkflowCard } from '@/components/workflow-card';
import { useEffect, useState, useRef, useCallback } from 'react';
import { type WorkflowTemplate, CATEGORY_MAPPINGS } from '@/lib/workflows';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { Zap, Users, Shield, Rocket, Code2, ArrowRight, ArrowUpRight, FileJson, Cpu, Database, Globe, ChevronLeft, ChevronRight } from 'lucide-react';



/* ─── Scroll reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─── Feature card spotlight ─── */
function FeatureCard({ icon: Icon, title, desc, delay }: { icon: React.ElementType; title: string; desc: string; delay: number }) {
  const ref = useReveal();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div ref={ref} className={`reveal reveal-delay-${delay}`}>
      <div ref={cardRef} onMouseMove={handleMouseMove} className="feature-card h-full">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] transition-colors duration-200">
          <Icon size={20} />
        </div>
        <h3 className="text-[0.95rem] font-semibold text-[var(--text)] mb-1.5">{title}</h3>
        <p className="text-[0.82rem] leading-relaxed text-[var(--muted)]">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Skeleton Card ─── */
function WorkflowCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 h-full min-h-[220px] flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="h-10 w-10 shrink-0 rounded-lg shimmer" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 w-3/4 rounded shimmer" />
          <div className="h-3 w-1/2 rounded shimmer" />
        </div>
      </div>
      <div className="mt-2 space-y-2.5">
        <div className="h-3 w-full rounded shimmer" />
        <div className="h-3 w-5/6 rounded shimmer" />
      </div>
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border)]">
        <div className="flex gap-2">
          <div className="h-6 w-14 rounded-full shimmer" />
          <div className="h-6 w-14 rounded-full shimmer" />
        </div>
        <div className="flex -space-x-1.5">
          <div className="h-6 w-6 rounded-full shimmer border-2 border-[var(--surface)]" />
          <div className="h-6 w-6 rounded-full shimmer border-2 border-[var(--surface)]" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendWarning, setBackendWarning] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(4);
  const { t, lang } = useI18n();

  const featuresRef = useReveal();
  const ctaRef = useReveal();
  const statsRef = useReveal();

  const categories = CATEGORY_MAPPINGS.map((cat, index) => {
    let count;
    if (index === 0) {
      count = workflows.length;
    } else {
      count = workflows.filter(wf => wf.tags?.some(tag => cat.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()))).length;
    }
    return {
      name: lang === 'th' ? cat.th : cat.en,
      tags: cat.tags,
      count
    };
  });

  // Multi-select tag filtering: if [0] (All) is selected, show everything
  const filteredByCategory = selectedTags.includes(0)
    ? workflows
    : workflows.filter(wf => {
      const allSelectedCatTags = selectedTags.flatMap(idx => CATEGORY_MAPPINGS[idx]?.tags || []).map(t => t.toLowerCase());
      return wf.tags?.some(tag => allSelectedCatTags.includes(tag.toLowerCase()));
    });

  const filteredWorkflows = filteredByCategory.filter(wf => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      wf.title.toLowerCase().includes(query) ||
      wf.description.toLowerCase().includes(query) ||
      (wf.tags && wf.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  // Derive real stats from workflows
  const uniqueCreators = new Set(workflows.flatMap(wf => wf.creators?.map(c => c.name) || [])).size;
  const uniqueTags = new Set(workflows.flatMap(wf => wf.tags || [])).size;

  useEffect(() => {
    setVisibleCount(4);
  }, [searchQuery, selectedTags]);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkflows() {
      try {
        const response = await fetch('/api/workflows', { cache: 'no-store' });
        const data = await response.json();

        if (!isMounted) return;
        if (Array.isArray(data.workflows) && data.workflows.length) {
          setWorkflows(data.workflows);
        }
        setBackendWarning(data.warning || '');
      } catch {
        if (isMounted) {
          setBackendWarning('Backend is not reachable. Check your n8n list webhook or Google Sheet CSV URL.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadWorkflows();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen">
      <HeroBackground />
      <Navbar />

      <Hero workflows={workflows} isLoading={isLoading} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-0">
        {/* ═══════════════ Flows Landing Section ═══════════════ */}
        <div id="browse" className="pt-12 sm:pt-16 scroll-mt-20">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
                Flows
              </h2>
              <p className="text-[0.85rem] text-[var(--muted)] mt-1">{t('main.browse_desc')}</p>
            </div>
            <Link
              href="/flows"
              className="futuristic-hover hidden sm:inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-[0.82rem] font-medium text-[var(--text)] hover:bg-[var(--surface-alt)] hover:border-[var(--border-strong)] transition-all active:scale-95 shadow-xs"
            >
              {lang === 'th' ? 'ดู Flows ทั้งหมด' : 'View All Flows'}
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Tag Filter Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
            {categories.map((cat, i) => {
              const isSelected = selectedTags.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (i === 0) {
                      setSelectedTags([0]);
                    } else {
                      setSelectedTags(prev => {
                        const withoutAll = prev.filter(t => t !== 0);
                        if (prev.includes(i)) {
                          const next = withoutAll.filter(t => t !== i);
                          return next.length === 0 ? [0] : next;
                        } else {
                          return [...withoutAll, i];
                        }
                      });
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-4 py-2 text-[0.78rem] font-semibold tracking-wide border transition-all duration-200 ${isSelected
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm shadow-[var(--accent-glow)]'
                      : 'bg-[var(--surface)] text-[var(--muted-strong)] border-[var(--border)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
                    }`}
                >
                  {cat.name}
                  <span className={`text-[0.65rem] font-mono tabular-nums ${isSelected ? 'text-white/80' : 'text-[var(--muted-soft)]'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {backendWarning && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[0.82rem] text-[var(--muted-strong)] mb-4">
              {backendWarning}
            </div>
          )}

          {/* Horizontal Scroll Cards */}
          {isLoading ? (
            <div className="flex gap-5 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[82vw] sm:min-w-[380px] md:min-w-[400px] flex-shrink-0">
                  <WorkflowCardSkeleton />
                </div>
              ))}
            </div>
          ) : filteredWorkflows.length > 0 ? (
            <div className="relative group/scroll">
              {/* Left Arrow */}
              <button
                onClick={() => {
                  const container = document.getElementById('flow-scroll-container');
                  if (container) container.scrollBy({ left: -400, behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 hidden sm:flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-lg text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40 transition-all duration-200 opacity-0 group-hover/scroll:opacity-100 active:scale-90 backdrop-blur-md"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Scrollable Container */}
              <div
                id="flow-scroll-container"
                className="flex gap-5 overflow-x-auto py-2 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide -mx-2 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredWorkflows.map((wf, i) => (
                  <div key={i} className="min-w-[82vw] sm:min-w-[380px] md:min-w-[400px] flex-shrink-0 snap-start">
                    <WorkflowCard {...wf} />
                  </div>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => {
                  const container = document.getElementById('flow-scroll-container');
                  if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 hidden sm:flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-lg text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40 transition-all duration-200 opacity-0 group-hover/scroll:opacity-100 active:scale-90 backdrop-blur-md"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
              <h3 className="text-base font-medium text-[var(--text)]">{t('main.no_workflows')}</h3>
              <p className="mx-auto mt-2 max-w-md text-[0.82rem] leading-relaxed text-[var(--muted)]">
                {t('main.no_workflows_desc')}
              </p>
            </div>
          )}

          {/* Mobile: View All Button */}
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/flows"
              className="futuristic-hover inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-[0.85rem] font-medium text-[var(--text)] hover:bg-[var(--surface-alt)] transition-all active:scale-95 shadow-xs"
            >
              {lang === 'th' ? 'ดู Flows ทั้งหมด' : 'View All Flows'}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ═══════════════ Stats Bar ═══════════════ */}
        <div ref={statsRef} className="reveal mt-20 sm:mt-28">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-3 sm:py-5">
            <div className="grid grid-cols-3">
              <div className="stat-item">
                <span className="block text-xl sm:text-3xl font-bold text-[var(--text)] tabular-nums">
                  {workflows.length}
                </span>
                <span className="text-[0.7rem] sm:text-xs text-[var(--muted)] font-medium mt-0.5 block">
                  {lang === 'th' ? 'เทมเพลต' : 'Templates'}
                </span>
              </div>
              <div className="stat-item">
                <span className="block text-xl sm:text-3xl font-bold text-[var(--text)] tabular-nums">
                  {uniqueCreators}
                </span>
                <span className="text-[0.7rem] sm:text-xs text-[var(--muted)] font-medium mt-0.5 block">
                  {lang === 'th' ? 'ผู้สร้าง' : 'Creators'}
                </span>
              </div>
              <div className="stat-item">
                <span className="block text-xl sm:text-3xl font-bold text-[var(--text)] tabular-nums">
                  {uniqueTags}
                </span>
                <span className="text-[0.7rem] sm:text-xs text-[var(--muted)] font-medium mt-0.5 block">
                  {lang === 'th' ? 'หมวดหมู่' : 'Categories'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ Features Section ═══════════════ */}
        <section className="mt-20 sm:mt-28">
          <div ref={featuresRef} className="reveal text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">{t('features.title')}</h2>
            <p className="mt-3 mx-auto max-w-lg text-[0.9rem] text-[var(--muted)] leading-relaxed">{t('features.subtitle')}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard icon={Users} title={t('features.community.title')} desc={t('features.community.desc')} delay={1} />
            <FeatureCard icon={Shield} title={t('features.secure.title')} desc={t('features.secure.desc')} delay={2} />
            <FeatureCard icon={Rocket} title={t('features.deploy.title')} desc={t('features.deploy.desc')} delay={3} />
            <FeatureCard icon={Code2} title={t('features.open.title')} desc={t('features.open.desc')} delay={4} />
          </div>

          {/* ════ Flow Diagram Preview ════ */}
          <div className="mt-20 pt-12 border-t border-[var(--border)] relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] px-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted-soft)] whitespace-nowrap">
              {lang === 'th' ? 'สถาปัตยกรรมระบบ' : 'System Architecture'}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative">
              {/* Horizontal connecting line (hidden on mobile) */}
              <div className="hidden sm:block absolute left-[10%] right-[10%] top-[28px] h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />

              {/* Vertical connecting line (mobile only) */}
              <div className="sm:hidden absolute top-[10%] bottom-[10%] left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-[var(--border-strong)] to-transparent" />

              {/* Node 1 */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-32 group cursor-default">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-blue-600 dark:text-blue-400 transition-transform group-hover:-translate-y-1">
                  <FileJson size={24} />
                </div>
                <div className="text-center bg-[var(--surface)] px-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">1. Upload JSON</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">From n8n local</div>
                </div>
              </div>

              <ArrowRight size={16} className="text-[var(--muted-light)] rotate-90 sm:rotate-0 bg-[var(--surface)] relative z-10" />

              {/* Node 2 */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-32 group cursor-default">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-amber-600 dark:text-amber-400 transition-transform group-hover:-translate-y-1">
                  <Cpu size={24} />
                </div>
                <div className="text-center bg-[var(--surface)] px-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">2. Auto-Extract</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">Parse Nodes & Creds</div>
                </div>
              </div>

              <ArrowRight size={16} className="text-[var(--muted-light)] rotate-90 sm:rotate-0 bg-[var(--surface)] relative z-10" />

              {/* Node 3 */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-32 group cursor-default">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-purple-600 dark:text-purple-400 transition-transform group-hover:-translate-y-1">
                  <Database size={24} />
                </div>
                <div className="text-center bg-[var(--surface)] px-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">3. Backend Sync</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">Google Sheets DB</div>
                </div>
              </div>

              <ArrowRight size={16} className="text-[var(--muted-light)] rotate-90 sm:rotate-0 bg-[var(--surface)] relative z-10" />

              {/* Node 4 */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-32 group cursor-default">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-emerald-600 dark:text-emerald-400 transition-transform group-hover:-translate-y-1">
                  <Globe size={24} />
                </div>
                <div className="text-center bg-[var(--surface)] px-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">4. FlowShare</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">Ready to Deploy</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ CTA Section ═══════════════ */}
        <section className="mt-20 sm:mt-28 relative">
          <div ref={ctaRef} className="reveal relative">
            {/* Decorative Blobs */}
            <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-[var(--accent-soft)] blur-[80px] opacity-70 dark:bg-[var(--accent-glow)] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
            <div className="absolute -right-12 bottom-0 h-64 w-64 rounded-full bg-[var(--accent-soft)] blur-[80px] opacity-70 dark:bg-[var(--accent-glow)] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

            <div className="cta-glow rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 sm:px-12 py-12 sm:py-16 text-center relative z-10">
              <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[var(--accent)]/20 animate-ping [animation-duration:3s]" />
                <div className="absolute inset-2 rounded-full border border-[var(--accent)]/30" />
                <div className="absolute inset-4 rounded-full border border-[var(--accent)]/40" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),#d9563c)] text-white shadow-xl shadow-[var(--accent-glow)] ring-4 ring-[var(--surface)]">
                  <Zap size={28} fill="currentColor" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">{t('cta.title')}</h2>
              <p className="mt-3 mx-auto max-w-md text-[0.9rem] text-[var(--muted)] leading-relaxed">{t('cta.desc')}</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/upload"
                  className="futuristic-hover flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-[0.95rem] font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97] shadow-md shadow-[var(--accent-glow)]"
                >
                  {t('cta.button')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer className="mt-20 sm:mt-28 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 py-12 sm:py-16">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 group mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition-transform duration-200 group-hover:scale-105">
                  <Zap size={15} fill="currentColor" />
                </div>
                <span className="text-[0.95rem] font-semibold tracking-tight text-[var(--text)]">FlowShare</span>
              </Link>
              <p className="text-[0.8rem] leading-relaxed text-[var(--muted)] max-w-[240px]">
                {t('footer.brand_desc')}
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-[0.85rem] font-semibold text-[var(--text)] mb-4">{t('footer.product')}</h4>
              <nav className="grid gap-2.5">
                <Link href="/" className="text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">{t('footer.explore')}</Link>
                <Link href="/flows" className="text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">Flows</Link>
                <Link href="/upload" className="text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">{t('footer.create')}</Link>
              </nav>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-[0.85rem] font-semibold text-[var(--text)] mb-4">{t('footer.resources')}</h4>
              <nav className="grid gap-2.5">
                <span className="text-[0.82rem] text-[var(--muted)] cursor-default">{t('footer.docs')}</span>
                <span className="text-[0.82rem] text-[var(--muted)] cursor-default">{t('footer.api')}</span>
                <span className="text-[0.82rem] text-[var(--muted)] cursor-default">{t('footer.changelog')}</span>
              </nav>
            </div>

            {/* Community */}
            <div>
              <h4 className="text-[0.85rem] font-semibold text-[var(--text)] mb-4">{t('footer.community')}</h4>
              <nav className="grid gap-2.5">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                  {t('footer.github')} <ArrowUpRight size={12} className="text-[var(--muted-soft)]" />
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                  {t('footer.discord')} <ArrowUpRight size={12} className="text-[var(--muted-soft)]" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                  {t('footer.twitter')} <ArrowUpRight size={12} className="text-[var(--muted-soft)]" />
                </a>
              </nav>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border)]" />

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6">
            <p className="text-[0.72rem] text-[var(--muted-soft)]">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[0.72rem] text-[var(--muted-soft)] cursor-default">{t('footer.privacy')}</span>
              <span className="text-[0.72rem] text-[var(--muted-soft)] cursor-default">{t('footer.terms')}</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
