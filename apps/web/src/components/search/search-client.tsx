'use client';

import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { EmptyState, ErrorState } from '@eushop/ui-web';
import { Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { trpc } from '../../lib/trpc';

export function SearchClient() {
  const [q, setQ] = useState('');
  const remote = trpc.catalog.search.useQuery(
    { q, limit: 30 },
    { enabled: q.length > 1, retry: false },
  );

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

  const remoteFailed = !!remote.error && q.length > 1;
  const results = remote.data?.length ? remote.data : localFallback;

  return (
    <div>
      <label className="border-ink/10 bg-porcelain flex items-center gap-3 rounded-2xl border px-5 py-4">
        <SearchIcon className="text-ash h-5 w-5" aria-hidden="true" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Krówki, Stroopwafels, Mastiha…"
          className="text-ink placeholder:text-ash w-full bg-transparent text-lg focus:outline-none"
          aria-label="Search the catalog"
          type="search"
        />
      </label>

      {remoteFailed ? (
        <ErrorState
          className="mt-10"
          title="Catalog search is unreachable."
          description={
            <>
              Showing cached, local results below. Live search will return as soon as it&rsquo;s
              back.
            </>
          }
        />
      ) : null}

      {q && results.length === 0 ? (
        <EmptyState
          className="mt-12"
          title={`No matches for "${q}".`}
          description="Try a shorter spelling, or a parent category."
        />
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => {
            const local =
              FOOD_ITEMS.find((i) => i.slug === r.slug) ??
              localFallback.find((i) => i.slug === r.slug);
            const country = COUNTRIES.find(
              (c) =>
                c.iso2 ===
                (local?.originCountryIso2 ??
                  (r as { originCountryIso2?: string }).originCountryIso2),
            );
            return (
              <li key={r.slug ?? r.name}>
                <Link
                  href={`/items/${r.slug}`}
                  className="group border-ink/10 bg-porcelain hover:border-ink/30 flex items-start gap-4 rounded-2xl border p-4 transition-colors"
                >
                  <span className="text-3xl" aria-hidden="true">
                    {country?.flagEmoji ?? '🇪🇺'}
                  </span>
                  <div>
                    <p className="text-ink group-hover:text-saffron-700 font-serif text-lg">
                      {r.name}
                    </p>
                    <p className="text-ash line-clamp-2 text-xs">
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
