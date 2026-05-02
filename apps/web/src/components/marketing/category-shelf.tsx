'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CATEGORIES, type CategorySeed } from '@eushop/catalog-data/categories';

interface Cat {
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
}

export function CategoryShelf({ categories }: { categories: Cat[] }) {
  const list: (Cat | CategorySeed)[] = categories.length ? categories : CATEGORIES;
  return (
    <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {list.map((c, i) => (
        <motion.li
          key={c.slug}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={`/categories/${c.slug}`}
            className="group block rounded-3xl border border-ink/10 bg-porcelain p-6 transition-all hover:-translate-y-1 hover:border-ink/30 hover:shadow-md"
          >
            <div className="text-3xl">{c.emoji}</div>
            <p className="mt-4 font-serif text-lg text-ink">{c.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-ash">{c.description}</p>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
