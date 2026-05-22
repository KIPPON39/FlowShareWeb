'use client';

import { Download, UserPlus, Eye, Database, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface WorkflowCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  keys: string[];
  creators: { name: string; email?: string; avatar?: string }[];
  nodes?: number;
  views?: number;
  downloads?: number;
  updatedAt?: string;
}

/* ─── Download Flow Form Modal ─── */
function DownloadFormModal({
  isOpen,
  onClose,
  flowTitle,
  ownerEmail,
  workflowId,  // เพิ่ม
}: {
  isOpen: boolean;
  onClose: () => void;
  flowTitle: string;
  ownerEmail?: string;
  workflowId: string;  // เพิ่ม
}) {
  const { t } = useI18n();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormState('submitting');

  try {
    const response = await fetch('/api/workflows/download', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workflowId: workflowId,        // ต้องส่ง id เข้ามาใน props ด้วย
        requesterName: name,
        requesterEmail: email,
        ownerEmail,
        reason,
      }),
    });

    if (!response.ok) throw new Error('Failed');

    setFormState('success');
    setTimeout(() => {
      onClose();
      setFormState('idle');
      setName('');
      setEmail('');
      setReason('');
    }, 1500);
  } catch {
    setFormState('idle');
    alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
  }
};

  return typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors">
              <X size={18} />
            </button>

            {formState === 'success' ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Check size={32} />
                </div>
                <p className="text-lg font-semibold text-[var(--text)]">{t('form.success')}</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">{t('form.download_title')}</h3>
                  <p className="text-[0.82rem] text-[var(--muted)] mt-1">{t('form.download_desc')}</p>
                  <div className="mt-4 grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/60 p-3">
                    <div className="grid gap-1">
                      <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted-soft)]">Flow name</span>
                      <span className="text-[0.82rem] font-semibold leading-snug text-[var(--text)]">{flowTitle}</span>
                    </div>
                    <div className="grid gap-1">
                      <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted-soft)]">Owner email</span>
                      <span className="break-all font-mono text-[0.76rem] font-semibold text-[var(--accent)]">{ownerEmail || '-'}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_name')}</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-light)]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_email')}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-light)]"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.reason')}</label>
                    <textarea
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none placeholder:text-[var(--muted-light)]"
                      placeholder={t('form.reason_placeholder')}
                    />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 text-[0.85rem] font-medium text-[var(--muted-strong)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-all"
                    >
                      {t('form.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-[0.85rem] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60 shadow-sm shadow-[var(--accent-glow)]"
                    >
                      {formState === 'submitting' ? t('form.submitting') : t('form.submit')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  , document.body) : null;
}

/* ─── Invite Speaker Form Modal ─── */
function SpeakerFormModal({ isOpen, onClose, flowTitle }: { isOpen: boolean; onClose: () => void; flowTitle: string }) {
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors">
              <X size={18} />
            </button>

            {formState === 'success' ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Check size={32} />
                </div>
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
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-light)]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_email')}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-light)]"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.organization')}</label>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-light)]"
                      placeholder={t('form.org_placeholder')}
                    />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 text-[0.85rem] font-medium text-[var(--muted-strong)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-all"
                    >
                      {t('form.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-[0.85rem] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60 shadow-sm shadow-[var(--accent-glow)]"
                    >
                      {formState === 'submitting' ? t('form.submitting') : t('form.submit')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  , document.body) : null;
}

export function WorkflowCard({ id, title, description, tags, keys, creators, nodes = 4, views, downloads, updatedAt }: WorkflowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [showSpeakerForm, setShowSpeakerForm] = useState(false);
  const ownerEmail = creators[0]?.email || '';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <>
      <div className="card-glow-wrapper futuristic-hover rounded-xl h-full">
        <article 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="workflow-card h-full group rounded-xl p-5 sm:p-6 flex flex-col gap-5 border border-[var(--border)] bg-[var(--surface)]"
        >
          {/* Header */}
          <div className="grid gap-3 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[var(--surface-alt)] px-2 py-0.5 text-[0.65rem] font-mono tabular-nums text-[var(--muted-strong)] border border-[var(--border)]">
                  {nodes} {t('card.nodes')}
                </span>
                {views !== undefined && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-alt)] px-2 py-0.5 text-[0.65rem] font-mono tabular-nums text-[var(--muted-strong)] border border-[var(--border)]">
                    <Eye size={10} /> {views.toLocaleString()}
                  </span>
                )}
              </div>
            
            {/* Creators */}
            <div className="group/creator relative flex items-center gap-1.5">
              <div className="flex items-center -space-x-1.5">
                {creators.slice(0, 2).map((c, i) => (
                  <div 
                    key={i} 
                    className="h-6 w-6 rounded-full border-2 border-[var(--surface)] bg-linear-to-br from-[#f4d7d0] to-[#e5a79a] overflow-hidden"
                  >
                    <Image 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} 
                      alt={c.name}
                      width={24}
                      height={24}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
              {creators.length > 2 && (
                <span className="text-[0.65rem] font-mono text-[var(--muted-soft)]">+{creators.length - 2}</span>
              )}

              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg opacity-0 pointer-events-none group-hover/creator:opacity-100 group-hover/creator:translate-y-0 translate-y-[-4px] transition-all duration-200 z-20 backdrop-blur-md">
                <strong className="text-[0.7rem] font-medium uppercase tracking-wider text-[var(--accent)] mb-3 block">{t('card.contributors')}</strong>
                <div className="grid gap-2.5">
                  {creators.map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-linear-to-br from-[#f4d7d0] to-[#e5a79a] border border-[var(--border)] overflow-hidden flex-shrink-0">
                        <Image 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} 
                          alt={c.name}
                          width={28}
                          height={28}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[0.8rem] font-medium text-[var(--text)] truncate">{c.name}</span>
                        <span className="text-[0.65rem] text-[var(--muted)]">{t('upload.contributor')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Title & description — BIGGER title */}
          <div className="grid gap-1.5">
            <h3 className="text-xl font-bold tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200 line-clamp-2 leading-snug">{title}</h3>
            
            <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-[var(--muted-soft)] font-medium mt-0.5 mb-1">
              <span>By {creators[0]?.name || 'Community'}</span>
              {updatedAt && (
                <>
                  <span className="w-0.5 h-0.5 rounded-full bg-[var(--muted-light)]" />
                  <span>Updated {new Date(updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </>
              )}
              {downloads !== undefined && (
                <>
                  <span className="w-0.5 h-0.5 rounded-full bg-[var(--muted-light)]" />
                  <span className="flex items-center gap-1"><Download size={10} /> {downloads.toLocaleString()}</span>
                </>
              )}
            </div>

            <p className="text-[0.82rem] text-[var(--muted)] line-clamp-2 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Tags & Keys */}
        <div className="grid gap-3 text-left">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => {
              const cleanTag = tag.replace(/^["'\[]+|["'\]]+$/g, '').trim();
              return (
                <span key={i} className="inline-flex items-center whitespace-nowrap shrink-0 px-3 py-0.5 rounded-full text-[0.7rem] font-semibold tracking-wide bg-[var(--tag-alt-bg)] text-[var(--tag-alt-text)] border border-[var(--border)] uppercase">
                  {cleanTag}
                </span>
              );
            })}
          </div>
          <div className="grid gap-2 bg-[var(--surface-alt)]/50 p-3.5 rounded-lg border border-[var(--border)]">
            <span className="text-[0.6rem] font-medium uppercase tracking-wider text-[var(--muted-soft)]">{t('card.required_env')}</span>
            <div className="flex flex-wrap gap-3">
              {keys.map((key, i) => {
                const cleanKey = key.replace(/^["'\[]+|["'\]]+$/g, '').trim();
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-80" />
                    <span className="text-[0.75rem] text-[var(--muted-strong)]">{cleanKey}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1 mt-auto z-10">
          <button 
            onClick={() => setShowDownloadForm(true)}
            className="futuristic-hover flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[0.78rem] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm shadow-[var(--accent-glow)]"
          >
            <Download size={14} /> <span>{t('card.download')}</span>
          </button>
          <button 
            onClick={() => setShowSpeakerForm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.78rem] text-[var(--muted-strong)] transition-all duration-200 hover:text-[var(--text)] hover:border-[var(--accent)]/30"
          >
            <UserPlus size={14} /> <span>{t('card.invite_speaker')}</span>
          </button>
          <Link 
            href={`/workflow/${id}`}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.78rem] text-[var(--muted-strong)] transition-all duration-200 hover:text-[var(--text)] hover:border-[var(--accent)]/30 md:ml-auto"
          >
            <Eye size={14} /> <span>{t('card.view')}</span>
          </Link>
        </div>
      </article>
      </div>

      {/* Form Modals */}
      <DownloadFormModal isOpen={showDownloadForm} onClose={() => setShowDownloadForm(false)} flowTitle={title} ownerEmail={ownerEmail} workflowId={id}/>
      <SpeakerFormModal isOpen={showSpeakerForm} onClose={() => setShowSpeakerForm(false)} flowTitle={title} />
    </>
  );
}
