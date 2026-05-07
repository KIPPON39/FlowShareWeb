import { WorkflowDetail } from '@/components/workflow-detail';
import { Navbar } from '@/components/navbar';
import { Breadcrumb } from '@/components/breadcrumb';

export const dynamic = 'force-dynamic';

export default function WorkflowDetailPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <Breadcrumb 
          items={[
            { label: 'Workflows', href: '/' },
            { label: 'Detail View' }
          ]} 
        />
        <WorkflowDetail />
      </div>
    </main>
  );
}
