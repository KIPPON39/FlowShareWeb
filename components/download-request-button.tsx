'use client';

import { Download, Loader2, Mail, X } from 'lucide-react';
import { FormEvent, useId, useState } from 'react';

type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

interface DownloadRequestButtonProps {
  workflowId: string;
  workflowTitle: string;
  ownerEmail?: string;
  label: string;
  className: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DownloadRequestButton({
  workflowId,
  workflowTitle,
  ownerEmail = '',
  label,
  className,
}: DownloadRequestButtonProps) {
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [requesterEmail, setRequesterEmail] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');

  const closeDialog = () => {
    if (submitState === 'sending') return;
    setIsOpen(false);
    setSubmitState('idle');
    setMessage('');
  };

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanEmail = requesterEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setSubmitState('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setSubmitState('sending');
    setMessage('Sending request...');

    try {
      const response = await fetch('/api/workflows/download', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          requesterEmail: cleanEmail,
          ownerEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const detail = data.detail ? ` ${data.detail}` : '';
        throw new Error(`${data.error || 'Download request failed.'}${detail}`);
      }

      setSubmitState('sent');
      setMessage('Request saved. The owner can review it from Google Sheets.');
    } catch (error) {
      setSubmitState('error');
      setMessage(error instanceof Error ? error.message : 'Download request failed.');
    }
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className}>
        <Download size={14} />
        <span>{label}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
              <div className="min-w-0">
                <h2 id={titleId} className="text-base font-semibold text-[var(--text)]">
                  Request download
                </h2>
                <p className="mt-1 truncate text-[0.8rem] text-[var(--muted)]">{workflowTitle}</p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                aria-label="Close download request"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitRequest} className="grid gap-4 px-5 py-5">
              <label className="grid gap-2">
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted-strong)]">
                  Requester email
                </span>
                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2.5 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]">
                  <Mail size={16} className="shrink-0 text-[var(--muted)]" />
                  <input
                    value={requesterEmail}
                    onChange={(event) => setRequesterEmail(event.target.value)}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text)] outline-hidden placeholder:text-[var(--muted-light)]"
                  />
                </div>
              </label>

              <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/50 p-3 text-[0.75rem] text-[var(--muted-strong)]">
                <div className="flex justify-between gap-3">
                  <span>Workflow ID</span>
                  <span className="max-w-[12rem] truncate font-mono text-[var(--text-subtle)]">{workflowId}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Owner Email</span>
                  <span className="max-w-[12rem] truncate font-mono text-[var(--text-subtle)]">{ownerEmail || '-'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Status</span>
                  <span className="font-mono text-[var(--text-subtle)]">pending</span>
                </div>
              </div>

              {message && (
                <p className={`text-[0.78rem] font-medium leading-relaxed ${submitState === 'error' ? 'text-red-500' : 'text-[var(--accent)]'}`}>
                  {message}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-[0.8rem] font-semibold text-[var(--muted-strong)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitState === 'sending' || submitState === 'sent'}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-[0.8rem] font-semibold text-white shadow-sm shadow-[var(--accent-glow)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitState === 'sending' && <Loader2 size={14} className="animate-spin" />}
                  {submitState === 'sent' ? 'Sent' : 'Submit request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
