'use client';

import {
  Download,
  UserPlus,
  Bot,
  ChevronDown,
  Database,
  Tag,
  X,
  Check,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import type { WorkflowTemplate } from '@/lib/workflows';

/* ─── Download Flow Form Modal ─── */
function DownloadFormModal({ onClose, flowTitle }: { onClose: () => void; flowTitle: string }) {
  const { t } = useI18n();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => {
      setFormState('success');
      setTimeout(() => {
        onClose();
        setFormState('idle');
        setName('');
        setEmail('');
        setReason('');
      }, 1500);
    }, 1000);
  };

  return typeof document !== 'undefined' ? createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors"><X size={18} /></button>
        {formState === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><Check size={32} /></div>
            <p className="text-lg font-semibold text-[var(--text)]">{t('form.success')}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">{t('form.download_title')}</h3>
              <p className="text-[0.82rem] text-[var(--muted)] mt-1">{t('form.download_desc')}</p>
              <p className="text-[0.75rem] text-[var(--accent)] font-semibold mt-2 truncate">{flowTitle}</p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_name')}</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder="John Doe" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_email')}</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder="you@example.com" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.reason')}</label>
                <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none placeholder:text-[var(--muted-soft)]" placeholder={t('form.reason_placeholder')} />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 text-[0.85rem] font-medium text-[var(--muted-strong)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-all">{t('form.cancel')}</button>
                <button type="submit" disabled={formState === 'submitting'} className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-[0.85rem] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60 shadow-sm shadow-[var(--accent-glow)]">{formState === 'submitting' ? t('form.submitting') : t('form.submit')}</button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  ) : null;
}

/* ─── Invite Speaker Form Modal ─── */
function SpeakerFormModal({ onClose, flowTitle }: { onClose: () => void; flowTitle: string }) {
  const { t } = useI18n();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => {
      setFormState('success');
      setTimeout(() => {
        onClose();
        setFormState('idle');
        setName('');
        setEmail('');
        setOrganization('');
      }, 1500);
    }, 1000);
  };

  return typeof document !== 'undefined' ? createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors"><X size={18} /></button>
        {formState === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><Check size={32} /></div>
            <p className="text-lg font-semibold text-[var(--text)]">{t('form.success')}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">{t('form.speaker_title')}</h3>
              <p className="text-[0.82rem] text-[var(--muted)] mt-1">{t('form.speaker_desc')}</p>
              <p className="text-[0.75rem] text-[var(--accent)] font-semibold mt-2 truncate">{flowTitle}</p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_name')}</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder="John Doe" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_email')}</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder="you@example.com" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.organization')}</label>
                <input type="text" required value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.org_placeholder')} />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 text-[0.85rem] font-medium text-[var(--muted-strong)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-all">{t('form.cancel')}</button>
                <button type="submit" disabled={formState === 'submitting'} className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-[0.85rem] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60 shadow-sm shadow-[var(--accent-glow)]">{formState === 'submitting' ? t('form.submitting') : t('form.submit')}</button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  ) : null;
}

export function TimelineStep({ index, title, nodeName }: { index: number, title: string, nodeName: string }) {
  return (
    <div className="timeline-step flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-transform hover:translate-x-1">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface-alt)] text-[0.8rem] font-black text-[var(--accent)] border border-[var(--border)] shadow-sm">
        {String(index).padStart(2, '0')}
      </div>
      <div className="grid gap-0.5 flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text)] tracking-tight leading-tight">{title}</div>
        <div className="flex items-center gap-2 text-[0.65rem] text-[var(--muted-strong)] mt-0.5">
          <Bot size={12} className="text-[var(--accent)]" />
          <span className="rounded-md border border-[var(--border)] bg-[var(--surface-alt)] px-2 py-0.5 text-[0.6rem] font-semibold text-[var(--text-subtle)]">
            {nodeName}
          </span>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <section className="grid gap-8 my-8 sm:my-14 animate-pulse">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8">
        <div className="h-8 w-3/4 rounded-lg bg-[var(--skeleton-base)]" />
        <div className="mt-4 flex gap-2">
          <div className="h-6 w-20 rounded-full bg-[var(--skeleton-base)]" />
          <div className="h-6 w-24 rounded-full bg-[var(--skeleton-base)]" />
        </div>
        <div className="mt-8 h-20 rounded-lg bg-[var(--skeleton-base)]" />
        <div className="mt-6 grid gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-xl bg-[var(--skeleton-base)]" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkflowDetail() {
  const [workflow, setWorkflow] = useState<WorkflowTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [showAllPipeline, setShowAllPipeline] = useState(false);
  const [showAllCreds, setShowAllCreds] = useState(false);
  const [isBriefExpanded, setIsBriefExpanded] = useState(false);
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [showSpeakerForm, setShowSpeakerForm] = useState(false);
  const { t } = useI18n();
  const params = useParams();

  useEffect(() => {
    async function loadWorkflow() {
      try {
        const response = await fetch('/api/workflows', { cache: 'no-store' });
        const data = await response.json();
        const allWorkflows: WorkflowTemplate[] = data.workflows || [];
        const found = allWorkflows.find(wf => wf.id === params.id);
        setWorkflow(found || null);
      } catch {
        setWorkflow(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkflow();
  }, [params.id]);

  if (isLoading) return <DetailSkeleton />;

  if (!workflow) {
    return (
      <section className="grid gap-8 my-8 sm:my-14">
        <div className="rounded-xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
          <h3 className="text-base font-medium text-[var(--text)]">Workflow not found</h3>
          <p className="mx-auto mt-2 max-w-md text-[0.82rem] leading-relaxed text-[var(--muted)]">
            This workflow may have been removed or the ID is incorrect.
          </p>
        </div>
      </section>
    );
  }

  const steps = workflow.steps || [];
  const keys = workflow.keys || [];
  const tags = workflow.tags || [];
  const creators = workflow.creators || [];
  const description = workflow.description || '';

  const shortBrief = description.length > 150 ? description.slice(0, 150) + '...' : description;
  const hasLongBrief = description.length > 150;

  const displayedPipeline = showAllPipeline ? steps : steps.slice(0, 5);
  const displayedCreds = showAllCreds ? keys : keys.slice(0, 6);

  return (
    <>
      <section id="detail" className="grid gap-8 my-8 sm:my-14">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 bg-[var(--accent)] opacity-[0.03] blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-8 text-left">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)] leading-tight">{workflow.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="rounded-lg bg-[var(--accent-soft)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--accent)]">
                    {tag}
                  </span>
                ))}
                {workflow.nodes && (
                  <div className="ml-2 flex items-center gap-1.5 text-[0.75rem] text-[var(--muted-strong)]">
                    <Bot size={14} />
                    <span className="font-medium">{workflow.nodes} nodes</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 self-center sm:self-start">
              <button onClick={() => setShowDownloadForm(true)} className="futuristic-hover flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-[0.75rem] font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-sm shadow-[var(--accent-glow)]">
                <Download size={14} />
                <span>{t('detail.download')}</span>
              </button>
              <button onClick={() => setShowSpeakerForm(true)} className="futuristic-hover flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-2.5 text-[0.75rem] font-bold text-[var(--text)] transition-all hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] hover:border-[var(--accent)] active:scale-95">
                <UserPlus size={14} />
                <span>{t('detail.invite')}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px] relative z-10">
            <div className="grid gap-10">
              {/* Brief */}
              <section className="text-left">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--accent)] flex items-center gap-2">
                    <div className="h-px w-4 bg-[var(--accent)]" />
                    {t('detail.brief')}
                  </h2>
                  {hasLongBrief && (
                    <button
                      onClick={() => setIsBriefExpanded(!isBriefExpanded)}
                      className="text-[0.65rem] font-medium text-[var(--accent)] hover:underline"
                    >
                      {isBriefExpanded ? t('detail.collapse') : t('detail.read_more')}
                    </button>
                  )}
                </div>
                <motion.div
                  layout
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/30 p-5 leading-relaxed text-[0.9rem] text-[var(--text-subtle)] font-medium"
                >
                  {isBriefExpanded || !hasLongBrief ? description : shortBrief}
                </motion.div>
              </section>

              {/* Pipeline */}
              {steps.length > 0 && (
                <section className="grid gap-4 text-left">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--accent)] flex items-center gap-2">
                      <div className="h-px w-4 bg-[var(--accent)]" />
                      {t('detail.pipeline')}
                    </h2>
                    {steps.length > 5 && (
                      <button
                        onClick={() => setShowAllPipeline(!showAllPipeline)}
                        className="text-[0.65rem] font-medium text-[var(--accent)] hover:underline"
                      >
                        {showAllPipeline ? t('detail.show_less') : `${t('detail.view_full')} (${steps.length})`}
                      </button>
                    )}
                  </div>
                  <div className="grid gap-2.5 sm:max-h-[500px] sm:overflow-y-auto sm:pr-2 sm:custom-scrollbar">
                    {displayedPipeline.map((step, i) => (
                      <TimelineStep key={i} index={i + 1} title={step.title} nodeName={step.nodeName} />
                    ))}
                  </div>
                </section>
              )}

              {/* No pipeline fallback */}
              {steps.length === 0 && (
                <section className="text-left">
                  <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--accent)] flex items-center gap-2 mb-4">
                    <div className="h-px w-4 bg-[var(--accent)]" />
                    {t('detail.pipeline')}
                  </h2>
                  <div className="rounded-xl border border-dashed border-[var(--border)] px-5 py-8 text-center text-[0.82rem] text-[var(--muted)] font-medium">
                    {t('upload.define_steps')}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="grid gap-4 self-start text-left">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/50 p-5 backdrop-blur-sm">
                  <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--muted-soft)] mb-4 flex items-center gap-2">
                    <Tag size={12} />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span key={i} className="rounded-lg bg-[var(--accent-soft)] px-3 py-1.5 text-[0.7rem] font-bold text-[var(--accent)] border border-[var(--accent)]/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Credentials */}
              {keys.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/50 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--muted-soft)]">{t('detail.credentials')}</h3>
                    {keys.length > 6 && (
                      <button
                        onClick={() => setShowAllCreds(!showAllCreds)}
                        className="text-[0.6rem] font-medium text-[var(--accent)]"
                      >
                        {showAllCreds ? t('detail.less') : t('detail.all')}
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {displayedCreds.map((key, i) => (
                      <div key={i} className="flex items-center gap-3 group/item">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-sm group-hover/item:border-[var(--accent)] transition-colors">
                          <Database size={14} className="text-[var(--accent)]" />
                        </div>
                        <span className="text-xs font-bold text-[var(--text-subtle)] tracking-tight">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team */}
              {creators.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/50 p-5 backdrop-blur-sm">
                  <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--muted-soft)] mb-4">{t('detail.team')}</h3>
                  <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {creators.map((creator, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-[var(--surface)] bg-[var(--surface-alt)] shadow-sm">
                          <Image
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name}`}
                            alt={creator.name}
                            width={36}
                            height={36}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[var(--text)] tracking-tight leading-tight">{creator.name}</span>
                          <span className="text-[0.6rem] font-medium text-[var(--muted)] uppercase tracking-wider mt-0.5">
                            {i === 0 ? t('upload.creator') : t('upload.contributor')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* JSON Preview */}
          {workflow.rawJson && (
            <div className="mt-8 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/30 backdrop-blur-md">
              <button
                onClick={() => setIsJsonOpen(!isJsonOpen)}
                className="flex w-full items-center gap-3 px-6 py-4 font-medium uppercase tracking-[0.15em] text-[0.75rem] transition-colors hover:text-[var(--accent)] text-[var(--muted-strong)]"
              >
                <ChevronDown size={18} className={`transition-transform duration-300 ${isJsonOpen ? '' : '-rotate-90'}`} />
                <span>{t('detail.json_preview')}</span>
              </button>

              <AnimatePresence>
                {isJsonOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6 pt-0 text-left">
                      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[0.8rem] text-[var(--muted-strong)] leading-relaxed shadow-inner max-h-[400px] overflow-y-auto custom-scrollbar">
                        <pre className="font-mono text-[0.75rem]">
                          {JSON.stringify(workflow.rawJson, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Form Modals */}
      <AnimatePresence>
        {showDownloadForm && (
          <DownloadFormModal onClose={() => setShowDownloadForm(false)} flowTitle={workflow.title} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSpeakerForm && (
          <SpeakerFormModal onClose={() => setShowSpeakerForm(false)} flowTitle={workflow.title} />
        )}
      </AnimatePresence>
    </>
  );
}
