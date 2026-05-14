'use client';

import { UploadSection } from '@/components/upload-section';
import { Navbar } from '@/components/navbar';
import { Breadcrumb } from '@/components/breadcrumb';
import { useI18n } from '@/lib/i18n';

export default function UploadPage() {
  const { t } = useI18n();

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
