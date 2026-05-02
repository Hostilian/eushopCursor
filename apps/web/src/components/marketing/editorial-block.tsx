'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
      <motion.div
        style={{ y }}
        className="md:col-span-5 md:sticky md:top-32 md:self-start"
      >
        <p className="text-xs uppercase tracking-widest text-ash">{eyebrow}</p>
        <h2 className="mt-3 font-serif text-balance text-4xl text-ink md:text-5xl">{title}</h2>
        <Button asChild variant="link" className="mt-6">
          <Link href={ctaHref}>
            {ctaLabel} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
      <div className="md:col-span-7">
        <p className="text-pretty text-xl leading-relaxed text-ink/80 md:text-2xl md:leading-relaxed">
          {body}
        </p>
      </div>
    </section>
  );
}
