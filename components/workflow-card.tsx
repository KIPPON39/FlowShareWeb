'use client';

import { Download, UserPlus, Eye, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface WorkflowCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  keys: string[];
  creators: { name: string; avatar?: string }[];
  nodes?: number;
  views?: number;
  downloads?: number;
  updatedAt?: string;
}

import { useRef } from 'react';

export function WorkflowCard({ id, title, description, tags, keys, creators, nodes = 4, views, downloads, updatedAt }: WorkflowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
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

        {/* Title & description */}
        <div className="grid gap-1.5">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200 line-clamp-1 leading-snug">{title}</h3>
          
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
        <button className="futuristic-hover flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[0.78rem] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm shadow-[var(--accent-glow)]">
          <Download size={14} /> <span>{t('card.download')}</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.78rem] text-[var(--muted-strong)] transition-all duration-200 hover:text-[var(--text)] hover:border-[var(--accent)]/30">
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
  );
}
