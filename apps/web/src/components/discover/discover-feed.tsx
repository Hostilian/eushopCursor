'use client';

import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { Filter, MapPin } from 'lucide-react';
import Image from 'next/image';
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

const SAMPLE_FALLBACK = FOOD_ITEMS.slice(0, 12).map((i, idx) => ({
  id: `sample-${idx}`,
  freeformName: i.name,
  brandName: i.aka?.[0] ?? null,
  notes: i.description,
  qty: 1 + (idx % 3),
  finderFee: ['3', '4', '5', '6', '7', '8', '10'][idx % 7]!,
  currency: 'EUR',
  freshness: 'week' as const,
  approximateCity: [
    'Berlin Mitte',
    'Munich Glockenbach',
    'Madrid Lavapiés',
    'Amsterdam Oost',
    'Paris 11e',
    'Vienna Neubau',
  ][idx % 6]!,
  countryIso2: i.originCountryIso2,
  cellGeohash: 'u33d2',
  photos: [
    {
      url: `https://placehold.co/800x800/${countryPalette[i.originCountryIso2]?.primary.slice(1) ?? '3B2F22'}/${countryPalette[i.originCountryIso2]?.accent.slice(1) ?? 'FAF7F2'}?text=${encodeURIComponent(i.name)}`,
    },
  ],
  createdAt: new Date(Date.now() - idx * 1000 * 60 * 60),
  point: { lat: 52.52, lng: 13.405 },
  km: 1 + idx * 0.6,
  countrySlug: i.originCountryIso2,
}));

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

  const liveOrSample = query.data && query.data.length ? query.data : SAMPLE_FALLBACK;

  const items = useMemo(() => liveOrSample, [liveOrSample]);

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

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </ul>
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
