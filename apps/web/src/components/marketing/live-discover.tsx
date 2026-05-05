import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { countryPalette } from '@eushop/tokens';
import { MapPreview } from '../discover/map-preview';
import { Button } from '../ui/button';

export type LiveListingCard = {
  id: string;
  freeformName: string | null;
  approximateCity: string;
  countryIso2: string;
  finderFee: string;
  photos: { url: string }[];
  point: { lat: number; lng: number };
};

export function LiveDiscover({ listings }: { listings: LiveListingCard[] }) {
  const slice = listings.slice(0, 6);
  const hero = slice[0];

  if (slice.length === 0) {
    return (
      <section className="container-editorial mt-24">
        <p className="text-ash text-xs tracking-widest uppercase">Live snapshot</p>
        <h2 className="text-ink mt-2 font-serif text-4xl md:text-5xl">
          The network is just waking up.
        </h2>
        <p className="text-ink/70 mt-3 max-w-2xl text-lg text-pretty">
          Eushop is a brand-new community. The first listings will appear here as soon as someone in
          your city shares what they brought back from a trip home. You could be that someone.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link href="/listings/new">
              Share your stash <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/requests/new">Post a request</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container-editorial mt-24">
      <p className="text-ash text-xs tracking-widest uppercase">Live snapshot</p>
      <h2 className="text-ink mt-2 font-serif text-4xl md:text-5xl">
        What neighbours are sharing.
      </h2>
      <p className="text-ink/70 mt-3 max-w-2xl text-lg text-pretty">
        Real listings posted by people near you. Tap a card to start the chat.
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {hero ? (
          <Link
            href={`/listings/${hero.id}`}
            className="group border-ink/10 bg-porcelain relative overflow-hidden rounded-[2rem] border shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className="relative aspect-[4/3] w-full"
              style={{
                backgroundColor: countryPalette[hero.countryIso2]?.primary ?? 'var(--color-ink)',
              }}
            >
              {hero.photos[0]?.url ? (
                <Image
                  src={hero.photos[0].url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={
                    hero.photos[0].url.startsWith('data:') || hero.photos[0].url.startsWith('blob:')
                  }
                />
              ) : null}
              <div className="from-ink/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
              <div className="text-paper absolute right-5 bottom-5 left-5">
                <p className="font-serif text-2xl">{hero.freeformName ?? 'Listing'}</p>
                <p className="text-paper/80 mt-1 text-sm">
                  {hero.approximateCity} · €{hero.finderFee} listing
                </p>
              </div>
            </div>
          </Link>
        ) : null}

        <div className="flex flex-col gap-6">
          {hero ? (
            <MapPreview label={hero.approximateCity} lat={hero.point.lat} lng={hero.point.lng} />
          ) : null}
          <ul className="grid gap-3 sm:grid-cols-2">
            {slice.slice(1, 5).map((l) => (
              <li key={l.id}>
                <Link
                  href={`/listings/${l.id}`}
                  className="border-ink/10 bg-paper hover:border-saffron-400/40 flex gap-3 rounded-2xl border p-3 transition-colors"
                >
                  <div
                    className="border-ink/10 relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border"
                    style={{
                      backgroundColor: countryPalette[l.countryIso2]?.primary ?? 'var(--color-ink)',
                    }}
                  >
                    {l.photos[0]?.url ? (
                      <Image
                        src={l.photos[0].url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized={
                          l.photos[0].url.startsWith('data:') || l.photos[0].url.startsWith('blob:')
                        }
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-ink truncate font-medium">{l.freeformName ?? 'Listing'}</p>
                    <p className="text-ash text-xs">
                      {l.approximateCity} · €{l.finderFee}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/discover"
            className="text-saffron-700 hover:text-saffron-900 text-sm font-medium underline-offset-4 hover:underline"
          >
            Open full discover →
          </Link>
        </div>
      </div>
    </section>
  );
}
