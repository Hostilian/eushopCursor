'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import type { CountrySeed } from '@eushop/catalog-data/countries';
import { countryPalette } from '@eushop/design-tokens';

export function CountryRail({ countries }: { countries: CountrySeed[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {countries.map((c, i) => {
        const palette = countryPalette[c.iso2] ?? {
          primary: '#3B2F22',
          accent: '#FAF7F2',
          ink: '#1A1612',
        };
        return (
          <motion.li
            key={c.iso2}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: reduce ? 0 : 0.5,
              delay: reduce ? 0 : i * 0.02,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link
              href={`/countries/${c.iso2.toLowerCase()}`}
              className="group border-ink/10 block overflow-hidden rounded-3xl border transition-transform duration-300 hover:-translate-y-1"
              style={{ background: palette.primary, color: palette.accent }}
            >
              <div className="relative h-44 p-5">
                <div className="text-4xl">{c.flagEmoji}</div>
                <div className="absolute right-5 bottom-5 left-5">
                  <p className="font-serif text-xl tracking-tight">{c.name}</p>
                  <p className="mt-1 text-xs tracking-widest uppercase opacity-70">{c.region}</p>
                </div>
              </div>
              <div className="border-t border-white/10 bg-black/10 p-4 text-xs leading-relaxed opacity-90">
                {c.blurb.slice(0, 110)}…
              </div>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
