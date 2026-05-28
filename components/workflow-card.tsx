'use client';

import { Download, UserPlus, Eye, Database, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

interface WorkflowCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  keys: string[];
  creators: { name: string; email?: string; avatar?: string; imageUrl?: string }[];
  nodes?: number;
  views?: number;
  downloads?: number;
  updatedAt?: string;
  createdAt?: string;
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
  const [recipient, setRecipient] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerPosition, setSignerPosition] = useState('');

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
          flow_name: flowTitle,
          recipient,
          signer_name: signerName,
          signer_position: signerPosition,
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
        setRecipient('');
        setSignerName('');
        setSignerPosition('');
      }, 1500);
    } catch {
      setFormState('idle');
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
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
            className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
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
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]"
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
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]"
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
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none placeholder:text-[var(--muted-soft)]"
                      placeholder={t('form.reason_placeholder')}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.recipient')}</label>
                    <input type="text" required value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_recipient')} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.signer_name')}</label>
                    <input type="text" required value={signerName} onChange={(e) => setSignerName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_signer_name')} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.signer_position')}</label>
                    <input type="text" required value={signerPosition} onChange={(e) => setSignerPosition(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_signer_position')} />
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
    </AnimatePresence>,
    document.body
  );
}

/* ─── Invite Speaker Form Modal ─── */
function SpeakerFormModal({ isOpen, onClose, flowTitle, workflowId, ownerEmail, speakerName, speakerAvatar }: { isOpen: boolean; onClose: () => void; flowTitle: string; workflowId: string; ownerEmail?: string; speakerName: string; speakerAvatar?: string; }) {
  const { t } = useI18n();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    try {
      const response = await fetch('/api/workflows/speaker', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          skrequestID: '', // Set by API
          flowID: workflowId,
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
          time_range: startTime && endTime ? `${startTime} - ${endTime}` : '',
          signer_name: signerName,
          signer_position: signerPosition
        }),
      });

      if (!response.ok) throw new Error('Failed');

      setFormState('success');
      setTimeout(() => {
        onClose();
        setFormState('idle');
        setRequesterName(''); setRequesterEmail(''); setEventName(''); setEventDate('');
        setEventLocation(''); setEventPurpose(''); setSessionType(''); setTopic('');
        setLectureDate(''); setSameAsEventDate(false); setStartTime(''); setEndTime(''); setSignerName(''); setSignerPosition('');
      }, 1500);
    } catch {
      setFormState('idle');
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
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
            className="relative w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto custom-scrollbar"
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

                  <div className="mt-5 p-4 bg-[var(--surface-alt)] rounded-xl border border-[var(--border)] flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-lg overflow-hidden border border-[var(--border)]">
                      {speakerAvatar ? (
                        <img src={speakerAvatar} alt={speakerName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        speakerName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-[0.7rem] text-[var(--muted)] uppercase tracking-wider font-semibold">{t('form.invited_speaker')}</p>
                      <p className="text-[0.95rem] font-bold text-[var(--text)]">{speakerName}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.your_name')}</label>
                    <input type="text" required value={requesterName} onChange={(e) => setRequesterName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_name')} />
                  </div>
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.requester_email')}</label>
                    <input type="email" required value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_email')} />
                  </div>
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.event_name')}</label>
                    <input type="text" required value={eventName} onChange={(e) => setEventName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_event_name')} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.event_date')}</label>
                    <input type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.event_location')}</label>
                    <input type="text" required value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_event_location')} />
                  </div>
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.event_purpose')}</label>
                    <textarea required value={eventPurpose} onChange={(e) => setEventPurpose(e.target.value)} rows={2} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_event_purpose')} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.session_type')}</label>
                    <input type="text" required value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_session_type')} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.topic')}</label>
                    <input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_topic')} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.lecture_date')}</label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={sameAsEventDate} onChange={(e) => setSameAsEventDate(e.target.checked)} className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] h-3.5 w-3.5 cursor-pointer transition-all" />
                        <span className="text-[0.65rem] font-medium text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors">{t('form.same_as_event')}</span>
                      </label>
                    </div>
                    <input type="date" required={!sameAsEventDate} disabled={sameAsEventDate} value={sameAsEventDate ? eventDate : lectureDate} onChange={(e) => setLectureDate(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.time_range')}</label>
                    <div className="flex gap-2 items-center">
                      <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all" />
                      <span className="text-[var(--text-subtle)] font-medium">-</span>
                      <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all" />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.signer_name')}</label>
                    <input type="text" required value={signerName} onChange={(e) => setSignerName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_signer_name')} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.75rem] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">{t('form.signer_position')}</label>
                    <input type="text" required value={signerPosition} onChange={(e) => setSignerPosition(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 px-4 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted-soft)]" placeholder={t('form.ph_signer_position')} />
                  </div>
                  <div className="flex gap-3 mt-4 md:col-span-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 text-[0.85rem] font-medium text-[var(--muted-strong)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-all"
                    >
                      {t('form.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={formState !== 'idle'}
                      className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-[0.85rem] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60 shadow-sm shadow-[var(--accent-glow)]"
                    >
                      {formState === 'submitting' ? t('form.submitting') : formState === 'success' ? t('form.success') : t('form.submit')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function WorkflowCard({ id, title, description, tags, keys, creators, nodes = 4, views, downloads, updatedAt, createdAt }: WorkflowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const router = useRouter();
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [showSpeakerForm, setShowSpeakerForm] = useState(false);
  const ownerEmail = creators[0]?.email || '';
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // If user clicked inside an interactive element, let the browser or target click handler deal with it.
    if (target.closest('button') || target.closest('a') || target.closest('.group\\/creator')) {
      return;
    }
    router.push(`/workflow/${id}`);
  };

  useEffect(() => {
    if (!showTooltip) return;
    const handleOutsideClick = () => setShowTooltip(false);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showTooltip]);

  return (
    <>
      <div className="card-glow-wrapper futuristic-hover rounded-xl h-full cursor-pointer" onClick={handleCardClick}>
        <article
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="workflow-card h-full group rounded-xl p-5 sm:p-6 flex flex-col gap-5 border border-[var(--border)] bg-[var(--surface)]"
        >
          {/* Header */}
          <div className="grid gap-3 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[var(--surface-alt)] px-2 py-0.5 text-[0.65rem] font-kanit font-medium tabular-nums text-[var(--muted-strong)] border border-[var(--border)]">
                  {nodes} {t('card.nodes')}
                </span>
                {views !== undefined && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-alt)] px-2 py-0.5 text-[0.65rem] font-kanit font-medium tabular-nums text-[var(--muted-strong)] border border-[var(--border)]">
                    <Eye size={10} /> {views.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Creators */}
              <div
                className="group/creator relative flex items-center gap-1.5 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(!showTooltip);
                }}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <div className="flex items-center -space-x-1.5">
                  {creators.slice(0, 2).map((c, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border-2 border-[var(--surface)] bg-linear-to-br from-[#f4d7d0] to-[#e5a79a] overflow-hidden"
                    >
                      {(c.imageUrl || c.avatar) ? (
                        <img
                          src={c.imageUrl || c.avatar}
                          alt={c.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Image
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`}
                          alt={c.name}
                          width={24}
                          height={24}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  ))}
                </div>
                {creators.length > 2 && (
                  <span className="text-[0.65rem] font-mono text-[var(--muted-soft)]">+{creators.length - 2}</span>
                )}

                {/* Tooltip */}
                <div className={`absolute top-full right-0 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg transition-all duration-200 z-20 backdrop-blur-md ${showTooltip
                  ? 'opacity-100 pointer-events-auto translate-y-0'
                  : 'opacity-0 pointer-events-none translate-y-[-4px] md:group-hover/creator:opacity-100 md:group-hover/creator:pointer-events-auto md:group-hover/creator:translate-y-0'
                  }`}>
                  <strong className="text-[0.7rem] font-medium uppercase tracking-wider text-[var(--accent)] mb-3 block">{t('card.contributors')}</strong>
                  <div className="grid gap-2.5">
                    {creators.map((c, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-linear-to-br from-[#f4d7d0] to-[#e5a79a] border border-[var(--border)] overflow-hidden flex-shrink-0">
                          {(c.imageUrl || c.avatar) ? (
                            <img
                              src={c.imageUrl || c.avatar}
                              alt={c.name}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Image
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`}
                              alt={c.name}
                              width={28}
                              height={28}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}
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
              <h3 className="text-xl font-bold tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200 line-clamp-2 leading-snug min-h-[3rem]">{title}</h3>

              <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-[var(--muted-soft)] font-medium mt-0.5 mb-1">
                <span>By {creators[0]?.name || 'Community'}</span>
                {(createdAt || updatedAt) && (
                  <>
                    <span className="w-0.5 h-0.5 rounded-full bg-[var(--muted-light)]" />
                    <span>{new Date(createdAt || updatedAt!).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </>
                )}
                {downloads !== undefined && (
                  <>
                    <span className="w-0.5 h-0.5 rounded-full bg-[var(--muted-light)]" />
                    <span className="flex items-center gap-1"><Download size={10} /> {downloads.toLocaleString()}</span>
                  </>
                )}
              </div>

              <p className="text-[0.82rem] text-[var(--muted)] line-clamp-3 leading-relaxed min-h-[3.6rem]">{description}</p>
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
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowDownloadForm(true);
              }}
              className="futuristic-hover flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[0.78rem] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm shadow-[var(--accent-glow)]"
            >
              <Download size={14} /> <span>{t('card.download')}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowSpeakerForm(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.78rem] text-[var(--muted-strong)] transition-all duration-200 hover:text-[var(--text)] hover:border-[var(--accent)]/30"
            >
              <UserPlus size={14} /> <span>{t('card.invite_speaker')}</span>
            </button>
            <Link
              href={`/workflow/${id}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.78rem] text-[var(--muted-strong)] transition-all duration-200 hover:text-[var(--text)] hover:border-[var(--accent)]/30 md:ml-auto"
            >
              <Eye size={14} /> <span>{t('card.view')}</span>
            </Link>
          </div>
        </article>
      </div>

      {/* Form Modals */}
      <DownloadFormModal isOpen={showDownloadForm} onClose={() => setShowDownloadForm(false)} flowTitle={title} ownerEmail={ownerEmail} workflowId={id} />
      <SpeakerFormModal isOpen={showSpeakerForm} onClose={() => setShowSpeakerForm(false)} flowTitle={title} workflowId={id} ownerEmail={ownerEmail} speakerName={creators[0]?.name || 'Community'} speakerAvatar={creators[0]?.imageUrl || creators[0]?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creators[0]?.name || 'Community'}`} />
    </>
  );
}
