import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { AdminShell } from '../components/admin-shell';
import { initAdminSentry } from '../lib/observability';
import './globals.css';

void initAdminSentry('server');

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Eushop Admin', template: '%s · Admin' },
  description: 'Operator console for listings, requests, and catalog health.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-paper text-ink antialiased">
        <a
          href="#main-content"
          className="bg-ink text-paper focus:ring-saffron-400 sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:ring-2"
        >
          Skip to content
        </a>
        <AdminShell>
          <div id="main-content">{children}</div>
        </AdminShell>
      </body>
    </html>
  );
}
