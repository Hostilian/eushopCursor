'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '../ui/button';

const FAVS = [
  'Krówki',
  'Stroopwafels',
  'Mastiha',
  'Liverwurst',
  'Sült',
  'Halloumi',
  'Sklandrausis',
  'Pastéis de nata',
  'Manner',
  'Túró Rudi',
];

export function Hero() {
  const t = useTranslations();
  return (
    <section className="relative overflow-hidden">
      <div className="grain absolute inset-0 -z-10" />
      <div className="container-editorial pt-20 pb-24 md:pt-32 md:pb-40">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-widest text-ash"
        >
          A pan-EU marketplace for niche regional foods
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-serif text-balance text-5xl leading-[1.05] text-ink md:text-7xl xl:text-[5.5rem]"
        >
          {t('tagline')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-2xl text-pretty text-lg text-ink/70"
        >
          The Polish nurse in Munich. The Greek bartender in Lisbon. The Estonian designer in
          Stockholm. They know what they want — they just need someone who brought it back.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Button asChild size="lg" variant="primary">
            <Link href="/discover">Discover near you</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/listings/new">{t('cta.postListing')}</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-ash"
        >
          <span className="text-ash/60">Currently traded</span>
          {FAVS.map((f) => (
            <span
              key={f}
              className="rounded-full border border-ink/10 bg-porcelain px-3 py-1 text-ink/80"
            >
              {f}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
