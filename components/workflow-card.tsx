'use client';

import { Download, UserPlus, Eye, Share2, Globe, Database, Cpu, Mail, CreditCard, Layout, Terminal, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface WorkflowCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  keys: string[];
  creators: { name: string; avatar?: string }[];
  nodes?: number;
}

const KEY_ICONS: Record<string, any> = {
  'OpenAI': Cpu,
  'Gmail API': Mail,
  'Stripe': CreditCard,
  'Slack Bot': Share2,
  'Notion API': Layout,
  'Crawler API': Globe,
  'HubSpot API': Database,
};

import { useRef } from 'react';

export function WorkflowCard({ id, title, description, tags, keys, creators, nodes = 4 }: WorkflowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <article 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="workflow-card group relative rounded-2xl p-7 flex flex-col gap-6 shadow-[var(--panel-inset)] border border-[var(--border)]"
    >
      <div className="card-top relative z-10 grid gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 inline-flex items-center rounded-md bg-[var(--surface-alt)] px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-widest text-[var(--muted-strong)] border border-[var(--border)]">
              {nodes} Nodes
            </span>
            <div className="h-[1px] w-8 bg-[var(--border)]" />
          </div>
          
          <div className="creator-stack group/creator relative flex items-center gap-2 flex-shrink-0 leading-none">
            <div className="flex items-center -space-x-2">
              {creators.slice(0, 3).map((c, i) => (
                <div 
                  key={i} 
                  className="h-6 w-6 rounded-full border-2 border-[var(--surface)] bg-linear-to-br from-[#f4d7d0] to-[#e5a79a] shadow-sm overflow-hidden"
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
            {creators.length > 1 && (
              <span className="text-[0.65rem] font-bold text-[var(--muted-soft)] uppercase tracking-tight">+{creators.length - 1}</span>
            )}

            {/* Tooltip */}
            <div className="absolute top-full right-0 mt-3 w-60 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl opacity-0 pointer-events-none group-hover/creator:opacity-100 group-hover/creator:translate-y-0 translate-y-[-8px] transition-all z-20 ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-md">
              <strong className="text-[0.85rem] font-black uppercase tracking-widest text-[var(--accent)] mb-3 block">Contributors</strong>
              <div className="grid gap-3">
                {creators.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-linear-to-br from-[#f4d7d0] to-[#e5a79a] border border-[var(--border)] overflow-hidden">
                      <Image 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} 
                        alt={c.name}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.9rem] font-bold text-[var(--text)]">{c.name}</span>
                      <span className="text-[0.7rem] font-medium text-[var(--muted)]">Contributor</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-[1.55rem] font-extrabold tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-1 leading-tight">{title}</h3>
          <p className="text-[0.95rem] text-[var(--muted)] line-clamp-2 min-h-[44px] leading-relaxed font-medium">{description}</p>
        </div>
      </div>

      <div className="grid gap-4 text-left">
        <div className="flex flex-wrap gap-2.5">
          {tags.map((tag, i) => (
            <span key={i} className="rounded-full bg-[var(--tag-alt-bg)] px-3 py-1 text-[0.75rem] font-black uppercase tracking-wider text-[var(--tag-alt-text)] ring-1 ring-[var(--border)]">
              {tag}
            </span>
          ))}
        </div>
        <div className="grid gap-2.5 bg-[var(--surface-alt)]/40 p-4 rounded-xl border border-[var(--border)]">
          <span className="font-black text-[var(--text-subtle)] uppercase tracking-widest text-[0.65rem]">Required Environment</span>
          <div className="flex flex-wrap gap-4">
            {keys.map((key, i) => {
              const Icon = KEY_ICONS[key] || Terminal;
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                    <Icon size={12} className="text-[var(--accent)]" />
                  </div>
                  <span className="font-bold text-[var(--muted-strong)]">{key}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3.5 py-2 text-[0.82rem] font-bold text-white shadow-lg shadow-[#a73b2430] transition-all hover:translate-y-[-3px] hover:scale-[1.02]">
          <Download size={16} /> <span>Download Flow</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-[0.82rem] font-bold text-[var(--text)] transition-all hover:translate-y-[-3px] hover:border-[var(--accent)]">
          <UserPlus size={16} className="text-[var(--muted-soft)]" /> <span>Invite Speaker</span>
        </button>
        <Link 
          href={`/workflow/${id}`}
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-[0.82rem] font-bold text-[var(--text)] transition-all hover:translate-y-[-3px] hover:border-[var(--accent)] md:ml-auto"
        >
          <Eye size={16} className="text-[var(--muted-soft)]" /> <span>View</span>
        </Link>
      </div>
    </article>
  );
}
