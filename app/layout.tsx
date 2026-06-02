import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/components/i18n-provider';
import { ScrollToTop } from '@/components/scroll-to-top';

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
});

export const metadata: Metadata = {
  title: 'FlowShare — Automation Workflow Library',
  description: 'Curated automation patterns for teams who want clarity before complexity.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${kanit.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <div className="fixed top-0 left-0 right-0 h-px bg-[var(--accent)] z-[100] opacity-80" />
        <div className="bg-grid-container">
          <div className="bg-grid" />
        </div>
        <div className="bg-glow-static" />
        <div className="bg-noise" />
        <I18nProvider>
          {children}
          <ScrollToTop />
        </I18nProvider>
      </body>
    </html>
  );
}
