'use client';

import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { HeroBackground } from '@/components/hero-background';
import { WorkflowCard } from '@/components/workflow-card';
import { useEffect, useState, useRef, useCallback } from 'react';
import { type WorkflowTemplate, CATEGORY_MAPPINGS } from '@/lib/workflows';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { Zap, Users, Shield, Rocket, Code2, ArrowRight, ArrowUpRight, FileJson, Cpu, Database, Globe, ChevronLeft, ChevronRight, Download, Clock, TrendingUp, Eye, Mic, Mail, UserPlus } from 'lucide-react';
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
                {filteredWorkflows.map((wf, i) => (
                  <div key={i} className="w-[82vw] max-w-[82vw] sm:w-[380px] sm:max-w-[380px] md:w-[400px] md:max-w-[400px] flex-shrink-0 snap-start">
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
            <div className="grid grid-cols-2 sm:grid-cols-4">
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
                  {totalDownloads.toLocaleString()}
                </span>
                <span className="text-[0.7rem] sm:text-xs text-[var(--muted)] font-medium mt-0.5 block">
                  {lang === 'th' ? 'ดาวน์โหลดรวม' : 'Total Downloads'}
                </span>
              </div>
              <div className="stat-item">
                <span className="block text-xl sm:text-3xl font-bold text-[var(--text)] tabular-nums">
                  {totalViews.toLocaleString()}
                </span>
                <span className="text-[0.7rem] sm:text-xs text-[var(--muted)] font-medium mt-0.5 block">
                  {lang === 'th' ? 'ยอดดูรวม' : 'Total Views'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ Top Creators Section ═══════════════ */}
        {topCreators.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
                {lang === 'th' ? 'ผู้สร้างยอดนิยม' : 'Top Creators'}
              </h2>
              <p className="mt-2 text-[0.85rem] text-[var(--muted)]">
                {lang === 'th' ? 'สมาชิกที่มีส่วนร่วมมากที่สุดในชุมชน' : 'Most active contributors in the community'}
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
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[0.55rem] font-black text-white shadow-sm">🏆</span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-[0.85rem] font-semibold text-[var(--text)] truncate max-w-[120px]">{creator.name}</div>
                    <div className="text-[0.7rem] text-[var(--accent)] font-semibold mt-0.5">
                      {creator.flowCount} {lang === 'th' ? 'Flows' : 'Flows'}
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
                {lang === 'th' ? 'เพิ่มล่าสุด' : 'Recently Added'}
              </h2>
              <p className="mt-2 text-[0.85rem] text-[var(--muted)]">
                {lang === 'th' ? 'Workflow ที่เพิ่มเข้ามาล่าสุดในชุมชน' : 'Latest workflows shared by the community'}
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
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">{lang === 'th' ? '1. การนำเข้าข้อมูล' : '1. Data Import'}</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">{lang === 'th' ? 'อัปโหลดไฟล์ JSON จาก n8n' : 'Import JSON from n8n'}</div>
                </div>
              </div>

              <ArrowRight size={16} className="text-[var(--muted-light)] rotate-90 sm:rotate-0 bg-[var(--surface)] relative z-10" />

              {/* Node 2 */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-32 group cursor-default">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-amber-600 dark:text-amber-400 transition-transform group-hover:-translate-y-1">
                  <Cpu size={24} />
                </div>
                <div className="text-center bg-[var(--surface)] px-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">{lang === 'th' ? '2. ประมวลผลอัตโนมัติ' : '2. Data Extraction'}</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">{lang === 'th' ? 'สกัดข้อมูลโหนดและสิทธิ์' : 'Parse Nodes & Access'}</div>
                </div>
              </div>

              <ArrowRight size={16} className="text-[var(--muted-light)] rotate-90 sm:rotate-0 bg-[var(--surface)] relative z-10" />

              {/* Node 3 */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-32 group cursor-default">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-purple-600 dark:text-purple-400 transition-transform group-hover:-translate-y-1">
                  <Database size={24} />
                </div>
                <div className="text-center bg-[var(--surface)] px-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">{lang === 'th' ? '3. จัดเก็บส่วนกลาง' : '3. Central Storage'}</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">{lang === 'th' ? 'บันทึกลงฐานข้อมูลองค์กร' : 'Save to Central DB'}</div>
                </div>
              </div>

              <ArrowRight size={16} className="text-[var(--muted-light)] rotate-90 sm:rotate-0 bg-[var(--surface)] relative z-10" />

              {/* Node 4 */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-32 group cursor-default">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-emerald-600 dark:text-emerald-400 transition-transform group-hover:-translate-y-1">
                  <Globe size={24} />
                </div>
                <div className="text-center bg-[var(--surface)] px-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--text)]">{lang === 'th' ? '4. พร้อมให้บริการ' : '4. Service Ready'}</div>
                  <div className="text-[0.65rem] text-[var(--muted)]">{lang === 'th' ? 'ดาวน์โหลดและใช้งานได้ทันที' : 'Available for Deployment'}</div>
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
              {lang === 'th' ? 'ขั้นตอนการทำงานของ FlowShare' : 'How FlowShare Works'}
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-[1rem] text-[var(--muted)] leading-relaxed">
              {lang === 'th' 
                ? 'กระบวนการที่ออกแบบมาเพื่อลดความซับซ้อน ตั้งแต่การค้นหาไปจนถึงการนำไปใช้งานจริง' 
                : 'A streamlined process designed to simplify everything from discovery to deployment.'}
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
                  {lang === 'th' ? '1. สำรวจและเรียนรู้ Workflow' : '1. Explore and Learn Workflows'}
                </h3>
                <p className="text-[0.95rem] text-[var(--muted-strong)] max-w-md leading-relaxed font-medium">
                  {lang === 'th'
                    ? 'ศึกษาโครงสร้างการทำงานและ Pipeline ของโฟลวที่ถูกสร้างโดยบุคลากรในองค์กร เพื่อนำมาประยุกต์ใช้กับงานของคุณ (ข้อมูลโครงสร้างเชิงลึกสงวนสิทธิ์เฉพาะผู้ดูแลระบบ)'
                    : 'Study the structure and pipeline of flows created by personnel in the organization. (Deep structural data is reserved for administrators).'}
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
                  {lang === 'th' ? '2. ส่งคำขอดาวน์โหลด' : '2. Submit Download Request'}
                </h3>
                <p className="text-[0.85rem] text-[var(--muted-strong)] leading-relaxed">
                  {lang === 'th'
                    ? 'เมื่อพบโฟลวที่เหมาะสม สามารถส่งคำขอดาวน์โหลดผ่านระบบได้ทันที โดยระบุวัตถุประสงค์ ระบบจะดำเนินการแจ้งเตือนไปยังผู้สร้างอัตโนมัติ'
                    : 'When you find a suitable flow, instantly submit a download request through the system. The creator will be automatically notified.'}
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
                  {lang === 'th' ? '3. เชิญเป็นวิทยากร' : '3. Invite as a Speaker'}
                </h3>
                <p className="text-[0.85rem] text-[var(--muted-strong)] leading-relaxed">
                  {lang === 'th'
                    ? 'หากต้องการเชิญผู้เชี่ยวชาญเจ้าของโฟลวมาบรรยายให้แก่ทีมของคุณ ระบบสามารถสร้างและส่งเอกสารคำเชิญได้อย่างเป็นทางการ'
                    : 'If you wish to invite the expert creator to lecture your team, the system will generate and send a formal invitation document.'}
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
                  {lang === 'th' ? '4. รอรับการอนุมัติทางอีเมล' : '4. Await Email Approval'}
                </h3>
                <p className="text-[0.95rem] text-[var(--muted-strong)] max-w-md leading-relaxed font-medium">
                  {lang === 'th'
                    ? 'หลังจากส่งคำขอ ระบบจะติดตามสถานะให้โดยอัตโนมัติ เมื่อได้รับการอนุมัติ ไฟล์ JSON หรือเอกสารยืนยันจะถูกจัดส่งตรงไปยังอีเมลของคุณทันที'
                    : 'After submission, the system tracks the status automatically. Upon approval, the JSON file or confirmation is delivered directly to your email.'}
                </p>
              </div>
            </motion.div>
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
