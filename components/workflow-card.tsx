'use client';

import { Download, UserPlus, Eye, Database, X, Check, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { getIconBgFromTag } from '@/lib/tag-icon';
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
  rank?: number;
}

// Modals have been extracted to dedicated pages

export function WorkflowCard({ id, title, description, tags, keys, creators, nodes = 4, views, downloads, updatedAt, createdAt, rank }: WorkflowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const router = useRouter();
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
    window.open(`/workflow/${id}`, '_blank');
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
          className="workflow-card h-full group rounded-xl p-5 sm:p-6 flex flex-col gap-5 border border-[var(--border)] bg-[var(--surface)] relative overflow-hidden"
        >
          {/* Faded background icon from first tag */}
          <div 
            className="absolute bottom-0 right-0 w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48 opacity-[0.08] pointer-events-none transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-500 ease-out z-0 dark:opacity-[0.04]"
            style={{ 
              backgroundImage: `url(${getIconBgFromTag(tags?.[0])})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center'
            }}
          />
          {/* Trending Badge */}
          {rank && rank <= 3 && (
            <div className="absolute top-0 right-0 z-10 flex h-6 items-center gap-1 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-[0.65rem] font-bold text-white shadow-sm">
              <TrendingUp size={12} strokeWidth={3} />
              <span>POPULAR</span>
            </div>
          )}

          {/* Header */}
          <div className="grid gap-3 text-left relative z-10">
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
          <div className="grid gap-3 text-left relative z-10">
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
          <div className="flex flex-wrap gap-2 pt-1 mt-auto relative z-10">
            <Link
              href={`/workflow/${id}/download`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="futuristic-hover flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[0.78rem] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm shadow-[var(--accent-glow)]"
            >
              <Download size={14} /> <span>{t('card.download')}</span>
            </Link>
            <Link
              href={`/workflow/${id}/invite`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.78rem] text-[var(--muted-strong)] transition-all duration-200 hover:text-[var(--text)] hover:border-[var(--accent)]/30"
            >
              <UserPlus size={14} /> <span>{t('card.invite_speaker')}</span>
            </Link>
            <Link
              href={`/workflow/${id}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.78rem] text-[var(--muted-strong)] transition-all duration-200 hover:text-[var(--text)] hover:border-[var(--accent)]/30 md:ml-auto"
            >
              <Eye size={14} /> <span>{t('card.view')}</span>
            </Link>
          </div>
        </article>
      </div>


    </>
  );
}
