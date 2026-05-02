'use client';

import { COUNTRIES } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { ArrowRight, Filter, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { trpc } from '../../lib/trpc';
import { cn, formatDistance, formatFee, timeAgo } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const RADII = [5, 10, 25, 50, 100] as const;
const FRESHNESS = [
  { v: 'today', l: 'Today' },
  { v: '3-days', l: '3 days' },
  { v: 'week', l: 'This week' },
  { v: 'month', l: 'This month' },
  { v: 'shelf-stable', l: 'Shelf-stable' },
] as const;

export function DiscoverFeed() {
  const [country, setCountry] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(25);
  const [freshness, setFreshness] = useState<string | null>(null);

  const query = trpc.listings.near.useQuery(
    {
      radiusKm: radius,
      countryIso2: country ?? undefined,
      freshness: (freshness ?? undefined) as
        | 'today'
        | '3-days'
        | 'week'
        | 'month'
        | 'shelf-stable'
        | undefined,
    },
    { staleTime: 30_000 },
  );

  const items = useMemo(() => query.data ?? [], [query.data]);

  return (
    <div className="mt-10 grid gap-12 md:grid-cols-12">
      <aside className="md:col-span-3">
        <div className="sticky top-24 space-y-8">
          <FilterBlock label="Country">
            <Pills
              value={country}
              onChange={setCountry}
              options={[
                { v: null, l: 'All' },
                ...COUNTRIES.map((c) => ({ v: c.iso2, l: `${c.flagEmoji} ${c.iso2}` })),
              ].slice(0, 14)}
            />
          </FilterBlock>
          <FilterBlock label="Radius">
            <div className="flex flex-wrap gap-2">
              {RADII.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs',
                    radius === r
                      ? 'border-ink bg-ink text-paper'
                      : 'border-ink/15 text-ink/70 hover:border-ink/40',
                  )}
                >
                  {r} km
                </button>
              ))}
            </div>
          </FilterBlock>
          <FilterBlock label="Freshness">
            <Pills
              value={freshness}
              onChange={setFreshness}
              options={[{ v: null, l: 'Any' }, ...FRESHNESS.map((f) => ({ v: f.v, l: f.l }))]}
            />
          </FilterBlock>
        </div>
      </aside>

      <div className="md:col-span-9">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-ash text-sm">
            {items.length} {items.length === 1 ? 'listing' : 'listings'} in your filter
          </p>
          <Button variant="ghost" size="sm">
            <Filter className="mr-1 h-4 w-4" /> More filters
          </Button>
        </div>

        {items.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-ink/10 bg-porcelain flex flex-col items-center gap-6 rounded-3xl border px-6 py-20 text-center">
      <div className="bg-saffron-100 text-saffron-700 grid h-14 w-14 place-items-center rounded-full">
        <MapPin className="h-6 w-6" />
      </div>
      <div className="max-w-xl">
        <h3 className="text-ink font-serif text-2xl">Nothing in your radius — yet.</h3>
        <p className="text-ash mt-2 text-sm">
          The map is quiet here. Widen your radius, browse upcoming trips from a country you miss,
          or post a request so the next diaspora traveller knows to grab it for you.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="primary">
          <Link href="/requests/new">
            Post a request <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/trips">Browse trips</Link>
        </Button>
      </div>
    </div>
  );
}

function FilterBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-ash text-xs tracking-widest uppercase">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Pills<T extends string | null>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { v: T; l: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.v ?? '__all'}
          onClick={() => onChange(o.v)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs',
            value === o.v
              ? 'border-ink bg-ink text-paper'
              : 'border-ink/15 text-ink/70 hover:border-ink/40',
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

interface ListingLike {
  id: string;
  freeformName: string | null;
  notes?: string | null;
  qty: number;
  finderFee: string | number;
  currency: string;
  freshness: string;
  approximateCity: string;
  countryIso2: string;
  photos: { url: string }[];
  createdAt: Date | string;
  km?: number;
}

function ListingCard({ listing }: { listing: ListingLike }) {
  const palette = countryPalette[listing.countryIso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
  return (
    <li className="group border-ink/10 bg-porcelain overflow-hidden rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-lg">
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: palette.primary }}
      >
        {listing.photos[0] ? (
          <Image
            src={listing.photos[0].url}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute top-3 right-3">
          <Badge variant="solid">{formatFee(listing.finderFee, listing.currency)}</Badge>
        </div>
      </div>
      <div className="p-5">
        <p className="text-ink font-serif text-lg">{listing.freeformName}</p>
        {listing.notes ? (
          <p className="text-ash mt-1 line-clamp-2 text-sm">{listing.notes}</p>
        ) : null}
        <div className="text-ash mt-4 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {listing.approximateCity}
            {listing.km !== undefined ? ` · ${formatDistance(listing.km)}` : null}
          </span>
          <span>{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </li>
  );
}
