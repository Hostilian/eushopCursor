'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations();
  const tc = useTranslations('footerCompany');
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
          <p className="text-ash text-xs tracking-widest uppercase">{tc('column')}</p>
          <ul className="text-ink/80 space-y-2 text-sm">
            <li>
              <Link href="/about">{tc('about')}</Link>
            </li>
            <li>
              <Link href="/how-it-works">{tc('howItWorks')}</Link>
            </li>
            <li>
              <Link href="/notifications">{t('nav.notifications')}</Link>
            </li>
            <li>
              <Link href="/safety">{tc('safety')}</Link>
            </li>
            <li>
              <Link href="/safety/handoff-protocol">{tc('handoffProtocol')}</Link>
            </li>
            <li>
              <Link href="/manifesto">{tc('manifesto')}</Link>
            </li>
            <li>
              <Link href="/traction">{tc('traction')}</Link>
            </li>
            <li>
              <Link href="/investors">{tc('investors')}</Link>
            </li>
            <li>
              <Link href="/pitch">{tc('pitch')}</Link>
            </li>
            <li>
              <Link href="/press">{tc('press')}</Link>
            </li>
            <li>
              <Link href="/roadmap">{tc('roadmap')}</Link>
            </li>
            <li>
              <Link href="/changelog">{tc('changelog')}</Link>
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
              <Link href="/data-export">{tc('dataExport')}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-editorial border-ink/10 text-ash mt-12 flex flex-col items-start justify-between gap-2 border-t pt-8 text-xs sm:flex-row">
        <p>© {new Date().getFullYear()} Eushop · Made in the EU · Hosted in Falkenstein</p>
        <p>v0.2 · Trip marketplace</p>
      </div>
    </footer>
  );
}
