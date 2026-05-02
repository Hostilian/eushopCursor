'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRef } from 'react';
import { Button } from '../ui/button';

export function EditorialBlock({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  return (
    <section ref={ref} className="container-editorial mt-32 grid gap-12 md:grid-cols-12">
      <motion.div style={{ y }} className="md:sticky md:top-32 md:col-span-5 md:self-start">
        <p className="text-ash text-xs tracking-widest uppercase">{eyebrow}</p>
        <h2 className="text-ink mt-3 font-serif text-4xl text-balance md:text-5xl">{title}</h2>
        <Button asChild variant="link" className="mt-6">
          <Link href={ctaHref as Route}>
            {ctaLabel} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
      <div className="md:col-span-7">
        <p className="text-ink/80 text-xl leading-relaxed text-pretty md:text-2xl md:leading-relaxed">
          {body}
        </p>
      </div>
    </section>
  );
}
