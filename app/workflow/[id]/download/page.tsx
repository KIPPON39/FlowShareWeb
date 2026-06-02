'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Mail, Send, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Navbar } from '@/components/navbar';
import { Breadcrumb } from '@/components/breadcrumb';
import type { WorkflowTemplate } from '@/lib/workflows';

export default function DownloadWorkflowPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  
  const [workflow, setWorkflow] = useState<WorkflowTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formState, setFormState] = useState<'idle' | 'preview' | 'submitting' | 'success'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [recipient, setRecipient] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerPosition, setSignerPosition] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/workflows');
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
    loadData();
  }, [params.id]);

  const ownerEmail = workflow?.creators?.[0]?.email || '';
  const flowTitle = workflow?.title || '';

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('preview');
  };

  const handleSubmit = async () => {
    if (!workflow) return;
    
    setFormState('submitting');
    try {
      const response = await fetch('/api/workflows/download', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflow.id,
          requesterName: name,
          requesterEmail: email,
          ownerEmail,
          reason,
          flow_name: flowTitle,
          recipient,
          signer_name: signerName,
          signer_position: signerPosition,
        }),
      });

      if (!response.ok) throw new Error('Failed');

      setFormState('success');
      setTimeout(() => {
        router.push(`/workflow/${workflow.id}`);
      }, 1500);
    } catch {
      setFormState('idle');
      alert(t('form.error_generic'));
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pb-20">
        <Breadcrumb 
          items={[
            { label: t('breadcrumb.workflows'), href: '/' },
            { label: workflow?.title || '...', href: `/workflow/${params.id}` },
            { label: t('detail.download') }
          ]} 
        />
        
        {isLoading ? (
          <div className="mt-8 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 h-[400px]" />
        ) : !workflow ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
            <h3 className="text-base font-medium text-[var(--text)]">{t('form.not_found')}</h3>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-xl">
            {formState === 'success' ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><Check size={40} /></div>
                <p className="text-xl font-bold text-[var(--text)]">{t('form.success')}</p>
                <p className="text-sm text-[var(--muted)]">{t('form.redirecting')}</p>
              </div>
            ) : formState === 'submitting' ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                <div className="relative">
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="z-10 relative flex h-24 w-24 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]"
                  >
                    <Mail size={48} />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0, x: -20, y: 20 }}
                    animate={{ scale: [0, 1, 1], opacity: [0, 1, 0], x: [-10, 30, 40], y: [10, -30, -40] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute top-0 right-0 text-[var(--accent)]"
                  >
                    <Send size={24} />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text)] mb-2">{t('form.sending_title')}</h3>
                  <p className="text-[0.9rem] text-[var(--muted)] flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    {t('form.sending_desc')}
                  </p>
                </div>
              </div>
            ) : formState === 'idle' ? (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">{t('form.download_title')}</h1>
                  <p className="text-[0.9rem] text-[var(--muted)] mt-2 leading-relaxed">{t('form.download_desc')}</p>
                  
                  <div className="mt-6 grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/60 p-4">
                    <div className="grid gap-1">
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--muted-soft)]">{t('form.flow_name_label')}</span>
                      <span className="text-[0.9rem] font-semibold leading-snug text-[var(--text)]">{flowTitle}</span>
                    </div>
                    <div className="grid gap-1 mt-2">
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--muted-soft)]">{t('form.owner_email_label')}</span>
                      <span className="break-all font-mono text-[0.8rem] font-semibold text-[var(--accent)]">{ownerEmail || '-'}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePreview} className="grid gap-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="grid gap-1.5">
                      <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_name')}</label>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-light)]" placeholder="John Doe" />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_email')}</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-light)]" placeholder="you@example.com" />
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.reason')}</label>
                    <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none placeholder:text-[var(--muted-light)]" placeholder={t('form.reason_placeholder')} />
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.recipient')}</label>
                    <input type="text" required value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-light)]" placeholder={t('form.ph_recipient')} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="grid gap-1.5">
                      <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.signer_name')}</label>
                      <input type="text" required value={signerName} onChange={(e) => setSignerName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-light)]" placeholder={t('form.ph_signer_name')} />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.signer_position')}</label>
                      <input type="text" required value={signerPosition} onChange={(e) => setSignerPosition(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-light)]" placeholder={t('form.ph_signer_position')} />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6 pt-6 border-t border-[var(--border)]">
                    <button type="button" onClick={() => router.push(`/workflow/${workflow.id}`)} className="flex-[0.4] rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3.5 text-[0.9rem] font-bold text-[var(--muted-strong)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-all">{t('form.cancel')}</button>
                    <button type="submit" className="flex-1 rounded-xl bg-[var(--accent)] py-3.5 text-[0.9rem] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-md shadow-[var(--accent-glow)]">{t('form.preview_btn')}</button>
                  </div>
                </form>
              </>
            ) : formState === 'preview' ? (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">{t('form.preview_download_title')}</h1>
                  <p className="text-[0.9rem] text-[var(--muted)] mt-2 leading-relaxed">{t('form.preview_desc')}</p>
                </div>
                
                <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-6 mb-8 text-[0.9rem]">
                  <div className="grid grid-cols-[120px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.flow_name_label')}</span>
                    <span className="font-semibold text-[var(--text)]">{flowTitle}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.your_name_label')}</span>
                    <span className="text-[var(--text)]">{name}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.your_email_label')}</span>
                    <span className="text-[var(--text)]">{email}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.recipient_label')}</span>
                    <span className="text-[var(--text)]">{recipient}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.reason_label')}</span>
                    <span className="text-[var(--text)] whitespace-pre-wrap">{reason}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.signer_name_label')}</span>
                    <span className="text-[var(--text)]">{signerName}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.signer_position_label')}</span>
                    <span className="text-[var(--text)]">{signerPosition}</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-[var(--border)]">
                  <button type="button" onClick={() => setFormState('idle')} className="flex-[0.4] rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3.5 text-[0.9rem] font-bold text-[var(--muted-strong)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-all">{t('form.back_to_edit')}</button>
                  <button type="button" onClick={handleSubmit} className="flex-1 rounded-xl bg-emerald-500 py-3.5 text-[0.9rem] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-md shadow-emerald-500/20">{t('form.confirm_and_submit')}</button>
                </div>
              </>
            ) : null}
          </motion.div>
        )}
      </div>
    </main>
  );
}
