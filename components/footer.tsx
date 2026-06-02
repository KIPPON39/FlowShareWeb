'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useState, useEffect } from 'react';

export function Footer() {
  const { t } = useI18n();
  const [socialLinks, setSocialLinks] = useState<{platform: string, url: string}[]>([]);

  useEffect(() => {
    fetch('/api/admin/social-links')
      .then(res => res.json())
      .then(data => {
        if (data.links) {
          setSocialLinks(data.links);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <footer className="mt-20 sm:mt-28 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 py-12 sm:py-16">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-[8px] overflow-hidden bg-[var(--surface-alt)] shadow-sm transition-transform duration-200 group-hover:scale-105 border border-[var(--border)]">
                <Image src="/logo_flowshare_lightmode.svg" alt="FlowShare Logo" fill className="object-cover logo-light" sizes="32px" />
                <Image src="/logo_flowshare_darkmode.svg" alt="FlowShare Logo" fill className="object-cover logo-dark" sizes="32px" />
              </div>
              <span className="flex flex-col">
                <span className="text-[0.95rem] font-semibold tracking-tight text-[var(--text)] leading-tight">FlowShare</span>
                <span className="text-[0.65rem] text-[var(--muted-soft)] font-medium">by KKU Library</span>
              </span>
            </Link>
            <p className="text-[0.8rem] leading-relaxed text-[var(--muted)] max-w-[240px]">
              {t('footer.brand_desc')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[0.85rem] font-semibold text-[var(--text)] mb-4">{t('footer.product')}</h4>
            <nav className="grid gap-2.5">
              <Link href="/" className="text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">{t('footer.explore')}</Link>
              <Link href="/flows" className="text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">Flows</Link>
              <Link href="/upload" className="text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">{t('footer.create')}</Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[0.85rem] font-semibold text-[var(--text)] mb-4">{t('footer.resources')}</h4>
            <nav className="grid gap-2.5">
              <span className="text-[0.82rem] text-[var(--muted)] cursor-default">{t('footer.docs')}</span>
              <span className="text-[0.82rem] text-[var(--muted)] cursor-default">{t('footer.api')}</span>
              <span className="text-[0.82rem] text-[var(--muted)] cursor-default">{t('footer.changelog')}</span>
            </nav>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-[0.85rem] font-semibold text-[var(--text)] mb-4">{t('footer.community')}</h4>
            <nav className="grid gap-2.5">
              {socialLinks.length > 0 ? (
                socialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors capitalize">
                    {link.platform} <ArrowUpRight size={12} className="text-[var(--muted-soft)]" />
                  </a>
                ))
              ) : (
                <>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                    {t('footer.github')} <ArrowUpRight size={12} className="text-[var(--muted-soft)]" />
                  </a>
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                    {t('footer.discord')} <ArrowUpRight size={12} className="text-[var(--muted-soft)]" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                    {t('footer.twitter')} <ArrowUpRight size={12} className="text-[var(--muted-soft)]" />
                  </a>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6">
          <p className="text-[0.72rem] text-[var(--muted-soft)]">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[0.72rem] text-[var(--muted-soft)] cursor-default">{t('footer.privacy')}</span>
            <span className="text-[0.72rem] text-[var(--muted-soft)] cursor-default">{t('footer.terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
