import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Fraunces, Inter } from 'next/font/google';
import { DemoModeBanner } from '../components/demo-mode-banner';
import { initWebSentry } from '../lib/observability';
import { Providers } from '../providers';
import './globals.css';

void initWebSentry('server');

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
  title: {
    default: 'Eushop — get something from somewhere, person to person',
    template: '%s · Eushop',
  },
  description:
    'Someone is always going somewhere. Offer the spare room in your bag, share what you brought, or just say what you’re after — the right people meet on a single map. You agree, you hand it over, the deal stays yours.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eushop.eu'),
  openGraph: {
    type: 'website',
    siteName: 'Eushop',
    title: 'Eushop — get something from somewhere, person to person',
    description:
      'Trips, locals, and open asks on one map. Offer space in your bag, share what you brought, or name what you need.',
  },
  alternates: { canonical: '/' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper text-ink antialiased">
        <a
          href="#main-content"
          className="bg-ink text-paper focus:ring-saffron-400 sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:ring-2"
        >
          Skip to content
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DemoModeBanner />
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
