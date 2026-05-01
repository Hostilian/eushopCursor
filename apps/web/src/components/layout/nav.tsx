'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const links = [
  { href: '/discover', key: 'nav.discover' },
  { href: '/countries', key: 'nav.countries' },
  { href: '/requests', key: 'nav.requests' },
] as const;

export function Nav() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/80 backdrop-blur-xl">
      <div className="container-editorial flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl tracking-tight text-ink">{t('brand')}</span>
          <span className="hidden text-xs uppercase tracking-widest text-ash sm:inline">EU</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ink/80 transition-colors hover:text-ink"
            >
              {t(l.key)}
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
          <Button asChild variant="primary" size="sm">
            <Link href="/listings/new">{t('cta.postListing')}</Link>
          </Button>
        </div>
      </div>

      {open ? <div className={cn('container-editorial pb-4 md:hidden')} /> : null}
    </header>
  );
}
