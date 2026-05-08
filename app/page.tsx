'use client';

import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { WorkflowCard } from '@/components/workflow-card';
import { useEffect, useState } from 'react';
import { type WorkflowTemplate } from '@/lib/workflows';

const CATEGORIES = [
  { name: 'All Templates', active: true },
  { name: 'AI Automation', count: 12 },
  { name: 'Customer Operations', count: 8 },
  { name: 'Sales & Marketing', count: 15 },
  { name: 'Data Engineering', count: 5 },
  { name: 'DevOps & Git', count: 7 },
  { name: 'Financial Ops', count: 4 },
];

export default function Home() {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendWarning, setBackendWarning] = useState('');

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
        <Hero />

        <div className="mt-12 lg:grid lg:grid-cols-[240px_1fr] gap-16">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-10">
              <div className="space-y-4">
                <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[var(--accent)] pl-4">Collections</h3>
                <nav className="grid gap-1">
                  {CATEGORIES.map((cat, i) => (
                    <button 
                      key={i} 
                      className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all border-l-2 ${cat.active ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]' : 'text-[var(--muted-strong)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)] border-transparent'}`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat.count && (
                        <span className="inline-flex items-center justify-center rounded-full bg-[var(--surface)] px-2 py-0.5 text-[0.6rem] font-black tabular-nums border border-[var(--border)] opacity-60 group-hover:opacity-100 transition-opacity">
                          {cat.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-br from-[var(--accent)] to-transparent opacity-10 blur-sm group-hover:opacity-20 transition-opacity" />
                <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/40 p-5 backdrop-blur-sm">
                  <h4 className="text-[0.8rem] font-bold text-[var(--text)] mb-2">Build Together</h4>
                  <p className="text-[0.7rem] text-[var(--muted-soft)] font-medium leading-relaxed mb-4">FlowShare is built on community-driven automation patterns.</p>
                  <button className="w-full rounded-xl bg-[var(--accent)] py-2.5 text-[0.75rem] font-bold text-white shadow-lg shadow-[var(--accent-glow)] hover:brightness-110 transition-all">Submit Template</button>
                </div>
              </div>
            </div>
          </aside>

          <div className="grid gap-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border)] pb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text)] uppercase">Browse Templates</h2>
                <p className="text-sm text-[var(--muted-soft)] font-medium mt-1">Ready-to-use building blocks for your stack.</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-[0.75rem] font-bold text-[var(--muted-strong)]">
                  <span>{isLoading ? 'Syncing templates...' : `Showing ${workflows.length} templates`}</span>
                </div>
              </div>
            </div>

            {backendWarning && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-4 text-sm font-bold text-[var(--muted-strong)]">
                {backendWarning}
              </div>
            )}

            {workflows.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2">
                {workflows.map((wf, i) => (
                  <WorkflowCard key={i} {...wf} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)]/30 px-6 py-12 text-center">
                <h3 className="text-lg font-black text-[var(--text)]">No workflows from Google Sheet yet</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-[var(--muted)]">
                  Upload a JSON workflow from the Create page, or check that your n8n list webhook returns a workflows array.
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-32 text-center">
          <p className="text-sm font-medium text-[var(--muted)]">
            Workspace-ready, developer-first templates with FlowShare.
          </p>
        </footer>
      </div>
    </main>
  );
}
