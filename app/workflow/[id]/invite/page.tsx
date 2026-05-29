'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Mail, Send, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Navbar } from '@/components/navbar';
import { Breadcrumb } from '@/components/breadcrumb';
import type { WorkflowTemplate } from '@/lib/workflows';

export default function InviteSpeakerPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();

  const [workflow, setWorkflow] = useState<WorkflowTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formState, setFormState] = useState<'idle' | 'preview' | 'submitting' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventPurpose, setEventPurpose] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [topic, setTopic] = useState('');
  const [lectureDate, setLectureDate] = useState('');
  const [sameAsEventDate, setSameAsEventDate] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerPosition, setSignerPosition] = useState('');

  useEffect(() => {
    async function loadData() {
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
    loadData();
  }, [params.id]);

  const ownerEmail = workflow?.creators?.[0]?.email || '';
  const flowTitle = workflow?.title || '';
  const speakerName = workflow?.creators?.[0]?.name || 'Community';
  const speakerAvatar = workflow?.creators?.[0]?.imageUrl || workflow?.creators?.[0]?.avatar;

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventD = new Date(eventDate);
    if (eventD < today) {
      setErrorMsg(t('form.error_event_date'));
      return;
    }

    if (!sameAsEventDate) {
      const lectureD = new Date(lectureDate);
      if (lectureD < today) {
        setErrorMsg(t('form.error_lecture_date'));
        return;
      }
    }

    setFormState('preview');
  };

  const getTodayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };
  const todayStr = getTodayStr();

  const handleSubmit = async () => {
    if (!workflow) return;

    setFormState('submitting');
    try {
      const response = await fetch('/api/workflows/speaker', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          skrequestID: '',
          flowID: workflow.id,
          requesterName,
          requesterEmail,
          recipient: speakerName,
          recipientEmail: ownerEmail || '',
          event_name: eventName,
          event_date: eventDate,
          event_location: eventLocation,
          event_purpose: eventPurpose,
          speaker_name: speakerName,
          speaker_position: '',
          session_type: sessionType,
          topic,
          lecture_date: sameAsEventDate ? eventDate : lectureDate,
          time_range: startTime && endTime ? `${startTime} - ${endTime} น.` : '',
          signer_name: signerName,
          signer_position: signerPosition
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
            { label: t('detail.invite') }
          ]}
        />

        {isLoading ? (
          <div className="mt-8 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 h-[500px]" />
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
                  <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">{t('form.speaker_title')}</h1>
                  <p className="text-[0.9rem] text-[var(--muted)] mt-2 leading-relaxed">{t('form.speaker_desc')}</p>

                  <div className="mt-6 p-5 bg-[var(--surface-alt)]/60 rounded-xl border border-[var(--border)] flex items-center gap-4">
                    <div className="h-14 w-14 flex-shrink-0 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xl overflow-hidden border border-[var(--border)] shadow-sm">
                      {speakerAvatar ? (
                        <img src={speakerAvatar} alt={speakerName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        speakerName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-[0.75rem] text-[var(--muted-soft)] uppercase tracking-wider font-bold mb-0.5">{t('form.invited_speaker')}</p>
                      <p className="text-lg font-bold text-[var(--text)]">{speakerName}</p>
                      <p className="text-[0.8rem] text-[var(--accent)] font-semibold mt-1 truncate max-w-md">{flowTitle}</p>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <X size={16} className="text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-[0.9rem] font-bold">{errorMsg}</p>
                  </motion.div>
                )}

                <form onSubmit={handlePreview} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_name')}</label>
                    <input type="text" required value={requesterName} onChange={(e) => setRequesterName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_name')} />
                  </div>
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.requester_email')}</label>
                    <input type="email" required value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_email')} />
                  </div>
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.event_name')}</label>
                    <input type="text" required value={eventName} onChange={(e) => setEventName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_event_name')} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.event_date')}</label>
                    <input type="date" min={todayStr} required value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.event_location')}</label>
                    <input type="text" required value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_event_location')} />
                  </div>
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.event_purpose')}</label>
                    <textarea required value={eventPurpose} onChange={(e) => setEventPurpose(e.target.value)} rows={2} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_event_purpose')} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.session_type')}</label>
                    <input type="text" required value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_session_type')} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.topic')}</label>
                    <input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_topic')} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.lecture_date')}</label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={sameAsEventDate} onChange={(e) => setSameAsEventDate(e.target.checked)} className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] h-3.5 w-3.5 cursor-pointer transition-all" />
                        <span className="text-[0.7rem] font-medium text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors">{t('form.same_as_event')}</span>
                      </label>
                    </div>
                    <input type="date" min={todayStr} required={!sameAsEventDate} disabled={sameAsEventDate} value={sameAsEventDate ? eventDate : lectureDate} onChange={(e) => setLectureDate(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.time_range')}</label>
                    <div className="flex gap-2 items-center">
                      <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all" />
                      <span className="text-[var(--text-subtle)] font-medium">-</span>
                      <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all" />
                    </div>
                  </div>
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.signer_name')}</label>
                    <input type="text" required value={signerName} onChange={(e) => setSignerName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_signer_name')} />
                  </div>
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.signer_position')}</label>
                    <input type="text" required value={signerPosition} onChange={(e) => setSignerPosition(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_signer_position')} />
                  </div>
                  <div className="flex gap-4 mt-6 pt-6 border-t border-[var(--border)] md:col-span-2">
                    <button type="button" onClick={() => router.push(`/workflow/${workflow.id}`)} className="flex-[0.4] rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3.5 text-[0.9rem] font-bold text-[var(--muted-strong)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-all">{t('form.cancel')}</button>
                    <button type="submit" className="flex-1 rounded-xl bg-[var(--accent)] py-3.5 text-[0.9rem] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-md shadow-[var(--accent-glow)]">{t('form.preview_btn')}</button>
                  </div>
                </form>
              </>
            ) : formState === 'preview' ? (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">{t('form.preview_speaker_title')}</h1>
                  <p className="text-[0.9rem] text-[var(--muted)] mt-2 leading-relaxed">{t('form.preview_desc')}</p>
                </div>
                
                <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-6 mb-8 text-[0.9rem]">
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.your_name_label')}</span>
                    <span className="text-[var(--text)]">{requesterName}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.your_email_label')}</span>
                    <span className="text-[var(--text)]">{requesterEmail}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.speaker_label')}</span>
                    <span className="text-[var(--text)]">{speakerName}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.owner_email_label')}</span>
                    <span className="text-[var(--text)]">{ownerEmail}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.event_name_label')}</span>
                    <span className="text-[var(--text)]">{eventName}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.event_date_label')}</span>
                    <span className="text-[var(--text)]">{eventDate}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.event_location_label')}</span>
                    <span className="text-[var(--text)]">{eventLocation}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.event_purpose_label')}</span>
                    <span className="text-[var(--text)] whitespace-pre-wrap">{eventPurpose}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.session_type_label')}</span>
                    <span className="text-[var(--text)]">{sessionType}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.topic_label')}</span>
                    <span className="text-[var(--text)]">{topic}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.lecture_date_label')}</span>
                    <span className="text-[var(--text)]">{sameAsEventDate ? eventDate : lectureDate}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.time_range_label')}</span>
                    <span className="text-[var(--text)]">{startTime && endTime ? `${startTime} - ${endTime} น.` : ''}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 pb-3 border-b border-[var(--border)]">
                    <span className="font-bold text-[var(--muted-strong)]">{t('form.signer_name_label')}</span>
                    <span className="text-[var(--text)]">{signerName}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4">
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
