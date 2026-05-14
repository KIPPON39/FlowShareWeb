'use client';

import Link from 'next/link';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-[var(--muted-soft)] transition-colors hover:text-[var(--accent)]"
        >
          <Home size={16} />
          <span className="sr-only">Home</span>
        </Link>
        
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-[var(--muted-light)]" />
            {item.href ? (
              <Link 
                href={item.href} 
                className="text-[var(--muted-soft)] transition-colors hover:text-[var(--accent)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--text-subtle)]">{item.label}</span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 self-start rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs font-bold text-[var(--text-subtle)] shadow-sm transition-all hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] hover:border-[rgba(167,59,36,0.3)] active:scale-95"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        <span>{t('breadcrumb.go_back')}</span>
      </button>
    </div>
  );
}
