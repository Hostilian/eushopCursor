import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Fraunces, Inter } from 'next/font/google';
import { DemoModeBanner } from '../components/demo-mode-banner';
import { Providers } from '../providers';
import './globals.css';

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
    default: 'Eushop — Spare bag space & finder’s fees',
    template: '%s · Eushop',
  },
  description:
    'City-first marketplace for both: spare suitcase capacity on routes you fly (fixed price or bids, on the roadmap) and finder’s fees for things you want someone to locate and hand off. Clear profiles, low-friction chat.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eushop.eu'),
  openGraph: {
    type: 'website',
    siteName: 'Eushop',
    title: 'Eushop — Spare bag space & finder’s fees',
    description:
      'List spare luggage room on real journeys, or name a finder’s fee for what you want found—same city-first network, same profiles and chat.',
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
