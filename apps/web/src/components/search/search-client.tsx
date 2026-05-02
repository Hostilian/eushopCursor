'use client';

import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { trpc } from '../../lib/trpc';

export function SearchClient() {
  const [q, setQ] = useState('');
  const remote = trpc.catalog.search.useQuery({ q, limit: 30 }, { enabled: q.length > 1, retry: false });

  const localFallback = useMemo(() => {
    if (!q || q.length < 2) return FOOD_ITEMS.slice(0, 12);
    const norm = q.toLowerCase();
    return FOOD_ITEMS.filter(
      (i) =>
        i.name.toLowerCase().includes(norm) ||
        i.description.toLowerCase().includes(norm) ||
        i.aka?.some((a) => a.toLowerCase().includes(norm)),
    ).slice(0, 30);
  }, [q]);

  const results = remote.data?.length ? remote.data : localFallback;

  return (
    <div>
      <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-porcelain px-5 py-4">
        <SearchIcon className="h-5 w-5 text-ash" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Krówki, Stroopwafels, Mastiha…"
          className="w-full bg-transparent text-lg text-ink placeholder:text-ash focus:outline-none"
        />
      </label>

      {q && results.length === 0 ? (
        <p className="mt-12 text-center text-ash">No matches for "{q}".</p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => {
            const local = FOOD_ITEMS.find((i) => i.slug === r.slug) ?? localFallback.find((i) => i.slug === r.slug);
            const country = COUNTRIES.find((c) => c.iso2 === (local?.originCountryIso2 ?? (r as { originCountryIso2?: string }).originCountryIso2));
            return (
              <li key={r.slug ?? r.name}>
                <Link
                  href={`/items/${r.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-ink/10 bg-porcelain p-4 transition-colors hover:border-ink/30"
                >
                  <span className="text-3xl">{country?.flagEmoji ?? '🇪🇺'}</span>
                  <div>
                    <p className="font-serif text-lg text-ink group-hover:text-saffron-700">
                      {r.name}
                    </p>
                    <p className="line-clamp-2 text-xs text-ash">
                      {(r as { description?: string }).description ?? local?.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
