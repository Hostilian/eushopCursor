'use client';

import { Menu, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const links = [
  { href: '/discover', key: 'nav.discover' },
  { href: '/countries', key: 'nav.countries' },
  { href: '/requests', key: 'nav.requests' },
] as const;

const investorLinks = [
  { href: '/pitch', label: 'Pitch' },
  { href: '/press', label: 'Press' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/changelog', label: 'Changelog' },
] as const;

export function Nav() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="border-ink/10 bg-paper/80 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="container-editorial flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-ink font-serif text-2xl tracking-tight">{t('brand')}</span>
          <span className="text-ash hidden text-xs tracking-widest uppercase sm:inline">EU</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ink/80 hover:text-ink text-sm transition-colors"
            >
              {t(l.key)}
            </Link>
          ))}
          {investorLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ash hover:text-ink text-xs tracking-widest uppercase transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Search">
            <Link href="/search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/sign-in">{t('cta.signIn')}</Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="hidden sm:inline-flex">
            <Link href="/listings/new">{t('cta.postListing')}</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          'border-ink/10 bg-paper/95 fixed inset-x-0 top-16 z-30 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b shadow-lg transition md:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!open}
      >
        <nav className="container-editorial flex flex-col gap-1 py-4" aria-label="Mobile">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ink hover:bg-parchment rounded-xl px-3 py-3 text-base font-medium"
              onClick={() => setOpen(false)}
            >
              {t(l.key)}
            </Link>
          ))}
          {investorLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ink/80 hover:bg-parchment rounded-xl px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="border-ink/10 mt-4 flex flex-col gap-2 border-t pt-4">
            <Button asChild variant="outline" className="w-full justify-center">
              <Link href="/sign-in" onClick={() => setOpen(false)}>
                {t('cta.signIn')}
              </Link>
            </Button>
            <Button asChild variant="primary" className="w-full justify-center">
              <Link href="/listings/new" onClick={() => setOpen(false)}>
                {t('cta.postListing')}
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
