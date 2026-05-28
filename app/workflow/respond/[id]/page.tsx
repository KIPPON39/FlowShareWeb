'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, UserCheck, UserX } from 'lucide-react';
import { Navbar } from '@/components/navbar';

export default function RespondSpeakerPage() {
  const params = useParams();
  const router = useRouter();

  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [status, setStatus] = useState<'accept' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const skrequestID = params.id as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      setErrorMsg('กรุณาเลือกว่าคุณต้องการยอมรับหรือปฏิเสธคำเชิญนี้');
      return;
    }
    if (status === 'reject' && !reason.trim()) {
      setErrorMsg('กรุณาระบุเหตุผลที่ปฏิเสธ เพื่อแจ้งให้ผู้จัดงานทราบ');
      return;
    }

    setFormState('submitting');
    setErrorMsg('');

    try {
      const response = await fetch('/api/workflows/speaker-response', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          skrequestID,
          status,
          reason
        }),
      });

      if (!response.ok) throw new Error('Failed to submit response');

      setFormState('success');
    } catch {
      setFormState('error');
      setErrorMsg('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-20">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-xl">
          {formState === 'success' ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Check size={40} />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text)]">ส่งคำตอบเรียบร้อยแล้ว</h2>
              <p className="text-[0.9rem] text-[var(--muted)]">ระบบได้ส่งอีเมลแจ้งผลการตอบรับให้ผู้จัดงานทราบแล้ว ขอขอบคุณที่ให้ความร่วมมือครับ</p>
              <button onClick={() => router.push('/')} className="mt-6 px-6 py-3 rounded-full bg-[var(--accent)] text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all">
                กลับสู่หน้าหลัก
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">การตอบรับคำเชิญเป็นวิทยากร</h1>
                <p className="text-[0.9rem] text-[var(--muted)] mt-2">รหัสคำขอ: <span className="font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md">{skrequestID}</span></p>
              </div>

              {errorMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <X size={16} className="text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-[0.9rem] font-bold">{errorMsg}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`relative flex cursor-pointer flex-col p-6 rounded-2xl border-2 transition-all ${status === 'accept' ? 'border-emerald-500 bg-emerald-500/5' : 'border-[var(--border)] bg-[var(--surface-alt)] hover:border-emerald-500/50 hover:bg-[var(--surface-alt)]/80'}`}>
                    <input type="radio" name="status" value="accept" className="sr-only" onChange={() => setStatus('accept')} />
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${status === 'accept' ? 'bg-emerald-500 text-white shadow-md' : 'bg-[var(--border)] text-[var(--muted-strong)]'}`}>
                        <UserCheck size={24} />
                      </div>
                      {status === 'accept' && <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                    </div>
                    <span className={`text-lg font-bold ${status === 'accept' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text)]'}`}>ยอมรับ</span>
                    <span className="text-[0.85rem] text-[var(--muted)] mt-1">ยืนยันการเข้าร่วมเป็นวิทยากร</span>
                  </label>

                  <label className={`relative flex cursor-pointer flex-col p-6 rounded-2xl border-2 transition-all ${status === 'reject' ? 'border-red-500 bg-red-500/5' : 'border-[var(--border)] bg-[var(--surface-alt)] hover:border-red-500/50 hover:bg-[var(--surface-alt)]/80'}`}>
                    <input type="radio" name="status" value="reject" className="sr-only" onChange={() => setStatus('reject')} />
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${status === 'reject' ? 'bg-red-500 text-white shadow-md' : 'bg-[var(--border)] text-[var(--muted-strong)]'}`}>
                        <UserX size={24} />
                      </div>
                      {status === 'reject' && <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                    </div>
                    <span className={`text-lg font-bold ${status === 'reject' ? 'text-red-600 dark:text-red-400' : 'text-[var(--text)]'}`}>ปฏิเสธ</span>
                    <span className="text-[0.85rem] text-[var(--muted)] mt-1">ไม่สะดวกเข้าร่วมงานในครั้งนี้</span>
                  </label>
                </div>

                <AnimatePresence>
                  {status === 'reject' && (
                    <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 24 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden">
                      <div className="grid gap-1.5">
                        <label className="text-[0.75rem] font-bold text-[var(--text-subtle)] uppercase tracking-wider">เหตุผลที่ปฏิเสธ (เพื่อแจ้งผู้จัดงาน)</label>
                        <textarea required value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 px-4 text-[0.9rem] text-[var(--text)] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-[var(--muted-soft)] min-h-[100px] resize-y" placeholder="เช่น ติดภารกิจอื่นในวันและเวลาดังกล่าว" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-6 mt-6 border-t border-[var(--border)] flex justify-end">
                  <button type="submit" disabled={!status || formState === 'submitting'} className={`relative flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-[0.95rem] font-bold text-white shadow-lg transition-all ${!status ? 'bg-gray-400 cursor-not-allowed shadow-none' : formState === 'submitting' ? 'bg-[var(--accent)] opacity-80 cursor-wait' : 'bg-[var(--accent)] hover:shadow-xl hover:scale-105'}`}>
                    {formState === 'submitting' ? 'กำลังบันทึก...' : 'ยืนยันการตอบรับ'}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
