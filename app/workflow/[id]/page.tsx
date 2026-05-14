'use client';

import { WorkflowDetail } from '@/components/workflow-detail';
import { Navbar } from '@/components/navbar';
import { Breadcrumb } from '@/components/breadcrumb';
import { useI18n } from '@/lib/i18n';

export default function WorkflowDetailPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <Breadcrumb 
          items={[
            { label: t('breadcrumb.workflows'), href: '/' },
            { label: t('breadcrumb.detail') }
          ]} 
        />
        <WorkflowDetail />
      </div>
    </main>
  );
}
