'use client';

import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { WorkflowCard } from '@/components/workflow-card';
import { useEffect, useState, useRef, useCallback } from 'react';
import { type WorkflowTemplate } from '@/lib/workflows';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { Zap, Users, Shield, Rocket, Code2, ArrowRight, ArrowUpRight, FileJson, Cpu, Database, Globe } from 'lucide-react';

const CATEGORY_MAPPINGS = [
  { en: 'All Templates', th: 'เทมเพลตทั้งหมด', tags: [] },
  { en: 'AI Automation', th: 'AI อัตโนมัติ', tags: ['AI'] },
  { en: 'Customer Operations', th: 'ปฏิบัติการลูกค้า', tags: ['CRM', 'Email', 'Customer'] },
  { en: 'Sales & Marketing', th: 'การขายและการตลาด', tags: ['Marketing', 'Sales'] },
  { en: 'Data Engineering', th: 'วิศวกรรมข้อมูล', tags: ['Data', 'Scraping', 'Analytics'] },
  { en: 'DevOps & Git', th: 'DevOps & Git', tags: ['DevOps', 'Git', 'Integration'] },
  { en: 'Financial Ops', th: 'การเงิน', tags: ['Finance'] },
];

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
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAECE7] dark:bg-[var(--accent-soft)] text-[var(--accent)] transition-colors duration-200">
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
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
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

  const filteredByCategory = activeCategoryIndex === 0
    ? workflows
    : workflows.filter(wf => 
        wf.tags?.some(tag => 
          CATEGORY_MAPPINGS[activeCategoryIndex].tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
        )
      );

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
  }, [searchQuery, activeCategoryIndex]);

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
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-0">
        <Hero flowCount={workflows.length} />

        {/* ═══════════════ Templates Grid ═══════════════ */}
        <div id="browse" className="border-t border-[var(--border)] mt-4 sm:mt-8 pt-8 sm:pt-12 lg:grid lg:grid-cols-[220px_1fr] gap-12 lg:gap-16 scroll-mt-20">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 grid gap-10">
              <div className="grid gap-2">
                <h3 className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-soft)] mb-1 pl-3">{t('main.collections')}</h3>
                <nav className="grid gap-0.5">
                  {categories.map((cat, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveCategoryIndex(i)}
                      className={`${activeCategoryIndex !== i ? 'futuristic-hover' : ''} group flex w-full items-center justify-between rounded-lg px-3 py-2 text-[0.82rem] transition-colors duration-150 ${activeCategoryIndex === i ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium' : 'text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]'}`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full font-mono text-[0.65rem] tabular-nums transition-colors duration-200 ${activeCategoryIndex === i ? 'bg-[var(--accent)] text-white shadow-xs' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted-soft)] group-hover:text-[var(--muted)] group-hover:border-[var(--border-strong)]'}`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          <div className="grid gap-8">
            {/* Section header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-[var(--text)]">
                  {activeCategoryIndex === 0 ? t('main.browse_templates') : categories[activeCategoryIndex].name}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1.5">
                  <p className="text-[0.82rem] text-[var(--muted)]">{t('main.browse_desc')}</p>
                  <span className="hidden sm:inline-block text-[var(--border)]">|</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    <span className="text-[0.7rem] text-[var(--muted)] whitespace-nowrap">Try:</span>
                    {['Gmail', 'Notion', 'AI', 'Slack'].map(tag => (
                      <button 
                        key={tag} 
                        onClick={() => setSearchQuery(tag)} 
                        className="text-[0.65rem] bg-[var(--surface-alt)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white border border-[var(--border)] rounded-md px-2 py-0.5 text-[var(--muted-strong)] transition-colors whitespace-nowrap"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                <div className="futuristic-hover focus-glow relative group flex-1 sm:flex-none rounded-xl">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-light)] transition-colors group-focus-within:text-[var(--accent)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'th' ? "ลองค้นหา 'Gmail' หรือ 'AI'..." : "Try 'Gmail automation' or 'AI'..."}
                    className="w-full sm:w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-4 text-[0.85rem] outline-hidden transition-all duration-200 placeholder:text-[var(--muted-light)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--text)]"
                  />
                </div>
                <span className="hidden sm:inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-[0.75rem] text-[var(--muted-strong)] font-mono tabular-nums whitespace-nowrap">
                  {isLoading ? t('main.syncing') : `${filteredWorkflows.length} ${t('main.templates')}`}
                </span>
              </div>
            </div>

            {backendWarning && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[0.82rem] text-[var(--muted-strong)]">
                {backendWarning}
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <WorkflowCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredWorkflows.length > 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  {filteredWorkflows.slice(0, visibleCount).map((wf, i) => (
                    <WorkflowCard key={i} {...wf} />
                  ))}
                </div>
                {filteredWorkflows.length > visibleCount && (
                  <div className="mt-8 text-center">
                    <button 
                      onClick={() => setVisibleCount(prev => prev + 4)}
                      className="futuristic-hover inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-[0.85rem] font-medium text-[var(--text)] transition-all hover:bg-[var(--surface-alt)] hover:border-[var(--border-strong)] active:scale-95 shadow-xs"
                    >
                      {lang === 'th' ? 'โหลดเพิ่มเติม' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
                <h3 className="text-base font-medium text-[var(--text)]">{t('main.no_workflows')}</h3>
                <p className="mx-auto mt-2 max-w-md text-[0.82rem] leading-relaxed text-[var(--muted)]">
                  {t('main.no_workflows_desc')}
                </p>
              </div>
            )}
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
            <FeatureCard icon={Users}   title={t('features.community.title')} desc={t('features.community.desc')} delay={1} />
            <FeatureCard icon={Shield}  title={t('features.secure.title')}    desc={t('features.secure.desc')}    delay={2} />
            <FeatureCard icon={Rocket}  title={t('features.deploy.title')}    desc={t('features.deploy.desc')}    delay={3} />
            <FeatureCard icon={Code2}   title={t('features.open.title')}      desc={t('features.open.desc')}      delay={4} />
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-blue-500 transition-transform group-hover:-translate-y-1">
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-amber-500 transition-transform group-hover:-translate-y-1">
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-purple-500 transition-transform group-hover:-translate-y-1">
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm text-emerald-500 transition-transform group-hover:-translate-y-1">
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
            <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-[#FAECE7] blur-[80px] opacity-70 dark:bg-[var(--accent-glow)] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
            <div className="absolute -right-12 bottom-0 h-64 w-64 rounded-full bg-[#FAECE7] blur-[80px] opacity-70 dark:bg-[var(--accent-glow)] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
            
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
