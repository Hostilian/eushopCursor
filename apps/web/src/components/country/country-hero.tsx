'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { CountrySeed } from '@eushop/catalog/countries';

export function CountryHero({
  country,
  palette,
  count,
}: {
  country: CountrySeed;
  palette: { primary: string; accent: string; ink: string };
  count: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const flagY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);

  return (
    <section
      ref={ref}
      className="relative h-[80vh] min-h-[600px] overflow-hidden"
      style={{ background: palette.primary, color: palette.accent }}
    >
      <motion.div
        style={{ y: flagY }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-[40rem] leading-none opacity-20"
      >
        {country.flagEmoji}
      </motion.div>

      <div className="container-editorial relative flex h-full flex-col justify-end pb-20">
        <motion.div style={{ y: titleY }}>
          <p className="text-xs tracking-widest uppercase opacity-70">
            {country.region} · {country.iso2} · {country.currency}
          </p>
          <h1 className="mt-4 font-serif text-7xl tracking-tight md:text-[8rem]">{country.name}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-80">{country.blurb}</p>
          <p className="mt-8 text-xs tracking-widest uppercase opacity-70">
            {count} canonical items in catalog · growing
          </p>
        </motion.div>
      </div>
    </section>
  );
}
