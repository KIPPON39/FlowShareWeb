'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { HeroBackground } from '@/components/hero-background';
import { WorkflowCard } from '@/components/workflow-card';
import { useEffect, useState, useRef, useCallback } from 'react';
import { type WorkflowTemplate, CATEGORY_MAPPINGS } from '@/lib/workflows';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { Zap, Users, Shield, Rocket, Code2, ArrowRight, ArrowUpRight, FileJson, Cpu, Database, Globe, ChevronLeft, ChevronRight, Download, Clock, TrendingUp, Eye, Mic, Mail, UserPlus, Crown } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

/* ─── Scroll reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.unobserve(el); } },
      { threshold: 0, rootMargin: '-10% 0px' }
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

/* ─── Animated Counter Hook ─── */
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const startAnimation = () => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        setCount(Math.floor(ease * target));
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setCount(target);
        }
      };
      animationFrameId = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return { count, ref };
}

function StatItem({ label, value }: { label: string; value: number }) {
  const { count, ref } = useCountUp(value, 2000);
  return (
    <div ref={ref} className="stat-item">
      <span className="block text-xl sm:text-3xl font-bold text-[var(--text)] tabular-nums">
        {count.toLocaleString()}
      </span>
      <span className="text-[0.7rem] sm:text-xs text-[var(--muted)] font-medium mt-0.5 block">
        {label}
      </span>
    </div>
  );
}

/* ─── Tech Marquee ─── */
function TechMarquee() {
  const techs = [
    { name: 'n8n', icon: <Zap size={20} /> },
    { name: 'Google Sheets', icon: <Database size={20} /> },
    { name: 'Next.js', icon: <Globe size={20} /> },
    { name: 'React', icon: <Cpu size={20} /> },
    { name: 'TypeScript', icon: <Code2 size={20} /> },
    { name: 'Tailwind CSS', icon: <Zap size={20} /> },
    { name: 'Node.js', icon: <Database size={20} /> },
  ];

  return (
    <div className="w-full overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]/30 backdrop-blur-sm py-4 flex items-center pointer-events-none select-none">
      <div className="flex animate-scroll whitespace-nowrap w-max">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-around min-w-[100vw] gap-8 px-4">
            {techs.map((tech, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[var(--muted-strong)] opacity-50">
                {tech.icon}
                <span className="font-semibold text-[0.75rem] tracking-widest uppercase">{tech.name}</span>
              </div>
            ))}
          </div>
        ))}
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
  }).sort((a, b) => (b.views || 0) - (a.views || 0));

  // Derive real stats from workflows
  const uniqueCreators = new Set(workflows.flatMap(wf => wf.creators?.map(c => c.name) || [])).size;
  const uniqueTags = new Set(workflows.flatMap(wf => wf.tags || [])).size;
  const totalDownloads = workflows.reduce((sum, wf) => sum + (wf.downloads || 0), 0);
  const totalViews = workflows.reduce((sum, wf) => sum + (wf.views || 0), 0);

  // Top creators: group by creator name, count flows
  const creatorMap = new Map<string, { name: string; imageUrl?: string; flowCount: number }>();
  workflows.forEach(wf => {
    const c = wf.creators?.[0];
    if (!c) return;
    const existing = creatorMap.get(c.name);
    if (existing) {
      existing.flowCount++;
    } else {
      creatorMap.set(c.name, { name: c.name, imageUrl: (c as any).imageUrl, flowCount: 1 });
    }
  });
  const topCreators = Array.from(creatorMap.values()).sort((a, b) => b.flowCount - a.flowCount).slice(0, 5);

  // Recent workflows (latest 5 by createdAt)
  const recentWorkflows = [...workflows]
    .filter(wf => wf.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  // Global top 3 workflows by views for "Popular" badge
  const globalTop3Ids = [...workflows]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3)
    .map(w => w.id);

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
      <TechMarquee />

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
              {t('main.view_all_flows')}
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
                <div key={i} className="w-[82vw] max-w-[82vw] sm:w-[380px] sm:max-w-[380px] md:w-[400px] md:max-w-[400px] flex-shrink-0">
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
                {filteredWorkflows.map((wf, i) => {
                  const rankIndex = globalTop3Ids.indexOf(wf.id);
                  const rank = rankIndex !== -1 ? rankIndex + 1 : undefined;
                  return (
                    <div key={i} className="w-[82vw] max-w-[82vw] sm:w-[380px] sm:max-w-[380px] md:w-[400px] md:max-w-[400px] flex-shrink-0 snap-start">
                      <WorkflowCard {...wf} rank={rank} />
                    </div>
                  );
                })}
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
              {t('main.view_all_flows')}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ═══════════════ Stats Bar ═══════════════ */}
        <div ref={statsRef} className="reveal mt-20 sm:mt-28">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-3 sm:py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              <StatItem label={t('stats.templates')} value={workflows.length} />
              <StatItem label={t('stats.creators')} value={uniqueCreators} />
              <StatItem label={t('stats.total_downloads')} value={totalDownloads} />
              <StatItem label={t('stats.total_views')} value={totalViews} />
            </div>
          </div>
        </div>

        {/* ═══════════════ Top Creators Section ═══════════════ */}
        {topCreators.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
                {t('creators.title')}
              </h2>
              <p className="mt-2 text-[0.85rem] text-[var(--muted)]">
                {t('creators.desc')}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {topCreators.map((creator, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 min-w-[140px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--accent)]/30"
                >
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#f4d7d0] to-[#e5a79a] border-2 border-[var(--surface)] overflow-hidden shadow-md">
                      {creator.imageUrl ? (
                        <img src={creator.imageUrl} alt={creator.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Image
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name}`}
                          alt={creator.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    {i === 0 && (
                      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm border border-[var(--surface)]"><Crown size={12} fill="currentColor" /></span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-[0.85rem] font-semibold text-[var(--text)] truncate max-w-[120px]">{creator.name}</div>
                    <div className="text-[0.7rem] text-[var(--accent)] font-semibold mt-0.5">
                      {creator.flowCount} {t('creators.flows')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════ Recent Activity Section ═══════════════ */}
        {recentWorkflows.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
                {t('recent.title')}
              </h2>
              <p className="mt-2 text-[0.85rem] text-[var(--muted)]">
                {t('recent.desc')}
              </p>
            </div>
            <div className="grid gap-3">
              {recentWorkflows.map((wf, i) => (
                <Link
                  key={wf.id}
                  href={`/workflow/${wf.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all duration-200 hover:border-[var(--accent)]/30 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] text-[0.75rem] font-black">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.9rem] font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">{wf.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-[0.7rem] text-[var(--muted)]">
                      <span className="flex items-center gap-1"><Users size={10} /> {wf.creators?.[0]?.name || 'Unknown'}</span>
                      {wf.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(wf.createdAt).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {(wf.downloads ?? 0) > 0 && (
                        <span className="flex items-center gap-1"><Download size={10} /> {wf.downloads}</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1.5 max-w-[200px]">
                    {wf.tags?.slice(0, 2).map((tag, j) => (
                      <span key={j} className="inline-flex px-2 py-0.5 rounded-full text-[0.6rem] font-semibold uppercase tracking-wide bg-[var(--tag-alt-bg)] text-[var(--tag-alt-text)] border border-[var(--border)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowRight size={14} className="text-[var(--muted-light)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

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
              {t('arch.title')}
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
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">{t('arch.step1_title')}</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">{t('arch.step1_desc')}</div>
                </div>
              </div>

              <ArrowRight size={16} className="text-[var(--muted-light)] rotate-90 sm:rotate-0 bg-[var(--surface)] relative z-10" />

              {/* Node 2 */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-32 group cursor-default">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-amber-600 dark:text-amber-400 transition-transform group-hover:-translate-y-1">
                  <Cpu size={24} />
                </div>
                <div className="text-center bg-[var(--surface)] px-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">{t('arch.step2_title')}</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">{t('arch.step2_desc')}</div>
                </div>
              </div>

              <ArrowRight size={16} className="text-[var(--muted-light)] rotate-90 sm:rotate-0 bg-[var(--surface)] relative z-10" />

              {/* Node 3 */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-32 group cursor-default">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-purple-600 dark:text-purple-400 transition-transform group-hover:-translate-y-1">
                  <Database size={24} />
                </div>
                <div className="text-center bg-[var(--surface)] px-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">{t('arch.step3_title')}</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">{t('arch.step3_desc')}</div>
                </div>
              </div>

              <ArrowRight size={16} className="text-[var(--muted-light)] rotate-90 sm:rotate-0 bg-[var(--surface)] relative z-10" />

              {/* Node 4 */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-32 group cursor-default">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-emerald-600 dark:text-emerald-400 transition-transform group-hover:-translate-y-1">
                  <Globe size={24} />
                </div>
                <div className="text-center bg-[var(--surface)] px-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">{t('arch.step4_title')}</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">{t('arch.step4_desc')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ═══════════════ Creative Bento Info Section ═══════════════ */}
        <section className="mt-20 sm:mt-32 mb-10 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text)]">
              {t('bento.title')}
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-[1rem] text-[var(--muted)] leading-relaxed">
              {t('bento.desc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 auto-rows-[280px]">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="md:col-span-2 relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 group hover:border-[var(--accent)]/40 transition-all duration-300 hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <Eye size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  {t('bento.step1_title')}
                </h3>
                <p className="text-[0.95rem] text-[var(--muted-strong)] max-w-md leading-relaxed font-medium">
                  {t('bento.step1_desc')}
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-8 group hover:border-[var(--accent)]/40 transition-all duration-300 hover:shadow-lg"
            >
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                  <Download size={24} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                  {t('bento.step2_title')}
                </h3>
                <p className="text-[0.85rem] text-[var(--muted-strong)] leading-relaxed">
                  {t('bento.step2_desc')}
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-8 group hover:border-[var(--accent)]/40 transition-all duration-300 hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--accent-soft),transparent_70%)] opacity-50" />
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                  <Mic size={24} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                  {t('bento.step3_title')}
                </h3>
                <p className="text-[0.85rem] text-[var(--muted-strong)] leading-relaxed">
                  {t('bento.step3_desc')}
                </p>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="md:col-span-2 relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 group hover:border-[var(--accent)]/40 transition-all duration-300 hover:shadow-lg"
            >
              <div className="absolute bottom-0 right-0 -mr-10 -mb-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  {t('bento.step4_title')}
                </h3>
                <p className="text-[0.95rem] text-[var(--muted-strong)] max-w-md leading-relaxed font-medium">
                  {t('bento.step4_desc')}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
