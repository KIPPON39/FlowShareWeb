'use client';

import { UploadSection } from '@/components/upload-section';
import { Navbar } from '@/components/navbar';
import { Breadcrumb } from '@/components/breadcrumb';
import { useI18n } from '@/lib/i18n';

import { useState, useEffect } from 'react';

export default function UploadPage() {
  const { t } = useI18n();
  const [user, setUser] = useState<{ username: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <span className="text-[var(--accent)] animate-pulse">Loading...</span>
        </div>
      </main>
    );
  }

  if (user?.role?.toLowerCase() !== 'admin') {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Access Denied</h1>
          <p className="text-[var(--muted)]">Only Admins can create new workflows.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <Breadcrumb 
          items={[
            { label: t('breadcrumb.creator_space'), href: '/' },
            { label: t('breadcrumb.new_workflow') }
          ]} 
        />
        <UploadSection />
      </div>
    </main>
  );
}
