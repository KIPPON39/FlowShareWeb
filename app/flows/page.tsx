'use client';

import { Navbar } from '@/components/navbar';
import { HeroBackground } from '@/components/hero-background';
import { WorkflowCard } from '@/components/workflow-card';
import { useEffect, useState, useRef, useCallback } from 'react';
import { type WorkflowTemplate, CATEGORY_MAPPINGS } from '@/lib/workflows';
import { useI18n } from '@/lib/i18n';
import { Search, SlidersHorizontal, X, LayoutGrid, LayoutList } from 'lucide-react';



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
      </div>
    </div>
  );
}

export default function FlowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendWarning, setBackendWarning] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'downloads'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const { t, lang } = useI18n();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = CATEGORY_MAPPINGS.map((cat, index) => {
    let count;
    if (index === 0) {
      count = workflows.length;
    } else {
      count = workflows.filter(wf => wf.tags?.some(tag => cat.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()))).length;
    }
    return {
      name: index === 0 ? (lang === 'th' ? 'ทั้งหมด' : 'All') : (lang === 'th' ? cat.th : cat.en),
      tags: cat.tags,
      count
    };
  });

  // Multi-select tag filtering
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
      (wf.tags && wf.tags.some(tag => tag.toLowerCase().includes(query))) ||
      (wf.keys && wf.keys.some(key => key.toLowerCase().includes(query))) ||
      (wf.creators && wf.creators.some(c => c.name.toLowerCase().includes(query)))
    );
  });

  // Sort
  const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
    // newest: by updatedAt
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
  });

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
          setBackendWarning('Backend is not reachable.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadWorkflows();
    return () => { isMounted = false; };
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedTags, sortBy]);

  return (
    <main className="min-h-screen">
      <HeroBackground />
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* ═══════════ Page Header ═══════════ */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text)]">
            {lang === 'th' ? 'ค้นหา Flows' : 'Explore Flows'}
          </h1>
          <p className="text-[0.9rem] text-[var(--muted)] mt-2 max-w-xl">
            {lang === 'th' ? 'ค้นหาและเรียกดู workflow อัตโนมัติทั้งหมด กรองตามหมวดหมู่หรือค้นหาด้วยคีย์เวิร์ด' : 'Search and browse all automation workflows. Filter by category or search by keyword.'}
          </p>
        </div>

        {/* ═══════════ Search Bar ═══════════ */}
        <div className="mb-6">
          <div className="search-glow relative group rounded-2xl">
            <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors group-focus-within:text-[var(--accent)]">
              <Search size={20} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'th' ? "ค้นหา flow, tag, credentials เช่น 'Gmail', 'AI', 'Notion'..." : "Search flows, tags, credentials e.g. 'Gmail', 'AI', 'Notion'..."}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-4 pl-12 sm:pl-14 pr-12 text-base outline-none transition-all duration-200 placeholder:text-[var(--muted-soft)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-[var(--text)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Accordion Toggle */}
        <div className="flex sm:hidden items-center justify-between gap-3 mb-4 w-full">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[0.82rem] font-semibold text-[var(--text)] active:scale-95 transition-all ${showFilters ? 'border-[var(--accent)] text-[var(--accent)] ring-1 ring-[var(--accent)]/10' : ''
              }`}
          >
            <SlidersHorizontal size={16} />
            <span>{showFilters ? (lang === 'th' ? 'ซ่อนตัวกรอง' : 'Hide Filters') : (lang === 'th' ? 'แสดงตัวกรอง' : 'Show Filters')}</span>
          </button>
          <span className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2.5 text-[0.75rem] text-[var(--muted-strong)] font-mono tabular-nums whitespace-nowrap">
            {isLoading ? (lang === 'th' ? 'กำลังโหลด...' : 'Loading...') : `${sortedWorkflows.length} flows`}
          </span>
        </div>

        {/* ═══════════ Controls Row ═══════════ */}
        <div className={`flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 transition-all duration-200 ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
          {/* Category Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1 w-full sm:w-auto">
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

          {/* Sort + Count */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <span className="hidden sm:inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-[0.75rem] text-[var(--muted-strong)] font-mono tabular-nums whitespace-nowrap">
              {isLoading ? (lang === 'th' ? 'กำลังโหลด...' : 'Loading...') : `${sortedWorkflows.length} flows`}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[0.78rem] text-[var(--text)] outline-none focus:border-[var(--accent)] cursor-pointer w-full sm:w-auto"
            >
              <option value="newest">{lang === 'th' ? 'ใหม่ล่าสุด' : 'Newest'}</option>
              <option value="views">{lang === 'th' ? 'ยอดดูสูงสุด' : 'Most Viewed'}</option>
              <option value="downloads">{lang === 'th' ? 'ดาวน์โหลดสูงสุด' : 'Most Downloaded'}</option>
            </select>
          </div>
        </div>

        {backendWarning && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[0.82rem] text-[var(--muted-strong)] mb-6">
            {backendWarning}
          </div>
        )}

        {/* ═══════════ Results Grid ═══════════ */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <WorkflowCardSkeleton key={i} />
            ))}
          </div>
        ) : sortedWorkflows.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sortedWorkflows.slice(0, visibleCount).map((wf, i) => (
                <WorkflowCard key={i} {...wf} />
              ))}
            </div>
            {visibleCount < sortedWorkflows.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="futuristic-hover flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-[0.85rem] font-semibold text-[var(--text)] hover:bg-[var(--surface-alt)] hover:border-[var(--border-strong)] transition-all active:scale-[0.97] shadow-sm"
                >
                  {lang === 'th' ? 'โหลดเพิ่มเติม' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] px-6 py-20 text-center">
            <Search size={40} className="mx-auto text-[var(--muted-light)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text)]">
              {lang === 'th' ? 'ไม่พบ Flow ที่ตรงกัน' : 'No Flows Found'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[0.85rem] leading-relaxed text-[var(--muted)]">
              {lang === 'th' ? 'ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น' : 'Try adjusting your search terms or selecting a different category.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedTags([0]); }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-[0.82rem] font-medium text-[var(--text)] hover:bg-[var(--surface-alt)] transition-all"
              >
                <X size={14} />
                {lang === 'th' ? 'ล้างตัวกรอง' : 'Clear Filters'}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
