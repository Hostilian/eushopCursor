'use client';

import { COUNTRIES } from '@eushop/catalog';
import { countryPalette } from '@eushop/tokens';
import { EmptyState as SharedEmptyState, ErrorState, LoadingState } from '@eushop/ui';
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

const COUNTRY_OPTIONS = [
  { v: null as string | null, l: 'All' },
  ...COUNTRIES.map((c) => ({ v: c.iso2, l: `${c.flagEmoji} ${c.iso2}` })),
].slice(0, 14);

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
    { staleTime: 30_000, placeholderData: (previousData) => previousData },
  );

  const items = useMemo(() => query.data ?? [], [query.data]);

  let feedBody: React.ReactNode;
  if (query.isLoading) {
    feedBody = <LoadingState label="Searching nearby listings…" />;
  } else if (query.error) {
    feedBody = (
      <ErrorState
        title="Listings service is unreachable."
        description="We couldn't load nearby listings. Try again, or widen your radius."
        actions={
          <Button onClick={() => query.refetch()} variant="primary">
            Retry
          </Button>
        }
      />
    );
  } else if (items.length === 0) {
    feedBody = (
      <SharedEmptyState
        icon={
          <div className="bg-saffron-100 text-saffron-700 mx-auto grid h-14 w-14 place-items-center rounded-full">
            <MapPin className="h-6 w-6" />
          </div>
        }
        title="Nothing in your radius — yet."
        description={
          <>
            The map is quiet here. Widen your radius, browse upcoming trips from a country you miss,
            or post an ask so the next traveller knows to grab it for you.
          </>
        }
        actions={
          <>
            <Button asChild variant="primary">
              <Link href="/requests/new">
                Post a request <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/discover">Browse discover</Link>
            </Button>
          </>
        }
      />
    );
  } else {
    feedBody = (
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ListingCard key={item.id} listing={item} />
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-10 grid gap-12 md:grid-cols-12">
      <aside className="md:col-span-3">
        <div className="sticky top-24 space-y-8">
          <FilterBlock label="Country">
            <Pills value={country} onChange={setCountry} options={COUNTRY_OPTIONS} />
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

        {feedBody}
      </div>
    </div>
  );
}

function FilterBlock({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
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
}: Readonly<{
  value: T;
  onChange: (v: T) => void;
  options: { v: T; l: string }[];
}>) {
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

function ListingCard({ listing }: Readonly<{ listing: ListingLike }>) {
  const palette = countryPalette[listing.countryIso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
  const imageUrl = listing.photos[0]?.url;
  const shouldUseUnoptimizedImage = Boolean(
    imageUrl?.startsWith('data:') || imageUrl?.startsWith('blob:'),
  );
  return (
    <li className="group border-ink/10 bg-porcelain overflow-hidden rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-lg">
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: palette.primary }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${listing.freeformName ?? 'Listing'} in ${listing.approximateCity}`}
            fill
            unoptimized={shouldUseUnoptimizedImage}
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
