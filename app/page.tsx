'use client';

import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { WorkflowCard } from '@/components/workflow-card';
import { useEffect, useState } from 'react';
import { type WorkflowTemplate } from '@/lib/workflows';
import { useI18n } from '@/lib/i18n';

const CATEGORY_MAPPINGS = [
  { en: 'All Templates', th: 'เทมเพลตทั้งหมด', tags: [] },
  { en: 'AI Automation', th: 'AI อัตโนมัติ', tags: ['AI'] },
  { en: 'Customer Operations', th: 'ปฏิบัติการลูกค้า', tags: ['CRM', 'Email', 'Customer'] },
  { en: 'Sales & Marketing', th: 'การขายและการตลาด', tags: ['Marketing', 'Sales'] },
  { en: 'Data Engineering', th: 'วิศวกรรมข้อมูล', tags: ['Data', 'Scraping', 'Analytics'] },
  { en: 'DevOps & Git', th: 'DevOps & Git', tags: ['DevOps', 'Git', 'Integration'] },
  { en: 'Financial Ops', th: 'การเงิน', tags: ['Finance'] },
];

export default function Home() {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendWarning, setBackendWarning] = useState('');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { t, lang } = useI18n();

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
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <Hero flowCount={workflows.length} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="border-t border-[var(--border)] pt-10 sm:pt-14 lg:grid lg:grid-cols-[220px_1fr] gap-12 lg:gap-16">
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
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-[0.82rem] transition-colors duration-150 ${activeCategoryIndex === i ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium' : 'text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]'}`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className={`font-mono text-[0.65rem] tabular-nums ${activeCategoryIndex === i ? 'text-[var(--accent)]' : 'text-[var(--muted-soft)] group-hover:text-[var(--muted)]'}`}>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-[var(--text)]">
                  {activeCategoryIndex === 0 ? t('main.browse_templates') : categories[activeCategoryIndex].name}
                </h2>
                <p className="text-[0.82rem] text-[var(--muted)] mt-0.5">{t('main.browse_desc')}</p>
              </div>
              
              <div className="flex items-center">
                <span className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.75rem] text-[var(--muted)] font-mono tabular-nums">
                  {isLoading ? t('main.syncing') : `${filteredWorkflows.length} ${t('main.templates')}`}
                </span>
              </div>
            </div>

            {backendWarning && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[0.82rem] text-[var(--muted-strong)]">
                {backendWarning}
              </div>
            )}

            {filteredWorkflows.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {filteredWorkflows.map((wf, i) => (
                  <WorkflowCard key={i} {...wf} />
                ))}
              </div>
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

        <footer className="mt-24 pt-8 border-t border-[var(--border)] text-center">
          <p className="text-[0.78rem] text-[var(--muted-soft)]">
            {t('main.footer')}
          </p>
        </footer>
      </div>
    </main>
  );
}
