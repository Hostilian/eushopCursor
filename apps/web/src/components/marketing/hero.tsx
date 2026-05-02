'use client';

import { motion, useReducedMotion } from 'framer-motion';
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
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden">
      <div className="grain absolute inset-0 -z-10" />
      <div className="container-editorial pt-20 pb-24 md:pt-32 md:pb-40">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.6 }}
          className="text-ash text-xs tracking-widest uppercase"
        >
          {t('hero.eyebrow')}
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-ink mt-6 font-serif text-5xl leading-[1.05] text-balance md:text-7xl xl:text-[5.5rem]"
        >
          {t('tagline')}
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduce ? 0 : 0.9,
            delay: reduce ? 0 : 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-ink/70 mt-6 max-w-2xl text-lg text-pretty"
        >
          {t('hero.body')}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduce ? 0 : 0.9,
            delay: reduce ? 0 : 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Button asChild size="lg" variant="primary">
            <Link href="/discover">{t('hero.discoverCta')}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/listings/new">{t('cta.postListing')}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/requests/new">{t('cta.postRequest')}</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 1.2, delay: reduce ? 0 : 0.4 }}
          className="text-ash mt-16 flex flex-wrap items-center gap-2 text-xs tracking-widest uppercase"
        >
          <span className="text-ash/60">{t('hero.favsLabel')}</span>
          {FAVS.map((f) => (
            <span
              key={f}
              className="border-ink/10 bg-porcelain text-ink/80 rounded-full border px-3 py-1"
            >
              {f}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
