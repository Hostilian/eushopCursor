'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="border-ink/10 bg-parchment mt-32 border-t py-16">
      <div className="container-editorial grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="text-ink font-serif text-3xl">{t('brand')}</h3>
          <p className="text-ash mt-4 max-w-md text-sm">{t('tagline')}</p>
          <p className="text-ash mt-6 max-w-md text-xs">
            Eushop is a discovery & messaging service for private individuals trading in small
            quantities of niche regional foods. We do not handle payments, package, ship, or verify
            food safety. Always meet in safe public places and use your judgement.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-ash text-xs tracking-widest uppercase">Eushop</p>
          <ul className="text-ink/80 space-y-2 text-sm">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/how-it-works">How it works</Link>
            </li>
            <li>
              <Link href="/safety">Safety</Link>
            </li>
            <li>
              <Link href="/pitch">Pitch</Link>
            </li>
            <li>
              <Link href="/press">Press</Link>
            </li>
            <li>
              <Link href="/roadmap">Roadmap</Link>
            </li>
            <li>
              <Link href="/changelog">Changelog</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-ash text-xs tracking-widest uppercase">Legal</p>
          <ul className="text-ink/80 space-y-2 text-sm">
            <li>
              <Link href="/privacy">{t('footer.privacy')}</Link>
            </li>
            <li>
              <Link href="/terms">{t('footer.terms')}</Link>
            </li>
            <li>
              <Link href="/imprint">{t('footer.imprint')}</Link>
            </li>
            <li>
              <Link href="/data-export">Data export (GDPR)</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-editorial border-ink/10 text-ash mt-12 flex flex-col items-start justify-between gap-2 border-t pt-8 text-xs sm:flex-row">
        <p>© {new Date().getFullYear()} Eushop · Made in the EU · Hosted in Falkenstein</p>
        <p>v0.1 · MVP</p>
      </div>
    </footer>
  );
}
