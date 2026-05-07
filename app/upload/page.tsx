import { UploadSection } from '@/components/upload-section';
import { Navbar } from '@/components/navbar';
import { Breadcrumb } from '@/components/breadcrumb';

export default function UploadPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <Breadcrumb 
          items={[
            { label: 'Creator Space', href: '/' },
            { label: 'New Workflow' }
          ]} 
        />
        <UploadSection />
      </div>
    </main>
  );
}
