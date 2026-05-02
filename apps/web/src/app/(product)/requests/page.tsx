import { COUNTRIES } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { EmptyState, ErrorState } from '@eushop/ui-web';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/trpc-server';
import { isDemoModeEnabled } from '../../../lib/demo-mode';
import { showcaseRequests } from '../../../lib/showcase';

export const metadata = {
  title: 'Open requests',
  description: 'See what your neighbours are asking for. Match on next trip or listing.',
  openGraph: {
    title: 'Open requests · Eushop',
    description: 'See what your neighbours are asking for. Match on next trip or listing.',
  },
};

type RequestRow = {
  id: string;
  freeformText: string;
  approximateCity: string;
  countryIso2: string;
  radiusKm: number;
  maxFinderFee: string | null;
};

export default async function RequestsPage() {
  let liveRequests: RequestRow[] = [];
  let serviceError = false;
  try {
    const trpc = await api();
    const rows = await trpc.requests.feed({ limit: 40 });
    liveRequests = rows.map((r) => ({
      id: r.id,
      freeformText: r.freeformText,
      approximateCity: r.approximateCity,
      countryIso2: r.countryIso2,
      radiusKm: r.radiusKm,
      maxFinderFee: r.maxFinderFee,
    }));
  } catch {
    serviceError = true;
  }
  const demo = await isDemoModeEnabled();
  const demoRequests = liveRequests.length === 0 && !serviceError && demo ? showcaseRequests() : [];

  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-ash text-xs tracking-widest uppercase">Wanted</p>
            <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">
              Open requests near you.
            </h1>
            <p className="text-ink/70 mt-4 max-w-xl text-lg">
              When someone posts a matching listing — or an upcoming trip from the right country —
              we&apos;ll notify the requester.
            </p>
          </div>
          <Button asChild variant="primary" size="lg">
            <Link href="/requests/new">
              Post a request <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {liveRequests.length > 0 ? (
          <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {liveRequests.map((r) => (
              <RequestCard
                key={r.id}
                title={r.freeformText}
                city={r.approximateCity}
                countryIso2={r.countryIso2}
                radius={r.radiusKm}
                maxFee={r.maxFinderFee ? Number(r.maxFinderFee) : null}
              />
            ))}
          </ul>
        ) : serviceError ? (
          <ErrorState
            className="mt-12"
            title="Requests service is offline."
            description="We couldn't reach the requests feed. Try again in a moment."
            actions={
              <>
                <Button asChild variant="primary">
                  <Link href="/requests">Retry</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/discover">Browse discover</Link>
                </Button>
              </>
            }
          />
        ) : demoRequests.length > 0 ? (
          <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {demoRequests.map((r) => (
              <RequestCard
                key={r.id}
                title={r.title}
                description={r.description}
                city={r.city}
                countryIso2={r.countryIso2}
                radius={r.radiusKm}
                maxFee={r.maxFinderFee}
              />
            ))}
          </ul>
        ) : (
          <EmptyRequests />
        )}
      </main>
      <Footer />
    </>
  );
}

function RequestCard({
  title,
  city,
  countryIso2,
  radius,
  maxFee,
  description,
}: {
  title: string;
  city: string;
  countryIso2: string;
  radius: number;
  maxFee: number | null;
  description?: string;
}) {
  const country = COUNTRIES.find((c) => c.iso2 === countryIso2);
  const palette = countryPalette[countryIso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
  return (
    <li className="group border-ink/10 bg-porcelain rounded-3xl border p-6 transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className="grid h-14 w-14 flex-none place-items-center rounded-2xl text-2xl"
          style={{ background: palette.primary, color: palette.accent }}
        >
          {country?.flagEmoji ?? '🇪🇺'}
        </div>
        <div className="flex-1">
          <p className="text-ink font-serif text-2xl">{title}</p>
          {description ? <p className="text-ash mt-1 line-clamp-2 text-sm">{description}</p> : null}
          <div className="text-ash mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="soft">
              <MapPin className="h-3 w-3" /> {city} · {radius} km
            </Badge>
            {maxFee !== null ? <Badge variant="accent">up to €{maxFee} fee</Badge> : null}
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end">
        <Button variant="outline" size="sm">
          I have this
        </Button>
      </div>
    </li>
  );
}

function EmptyRequests() {
  return (
    <EmptyState
      className="mt-12"
      icon={<Sparkles className="text-saffron-600 mx-auto h-10 w-10" />}
      title="Be the first to ask."
      description={
        <>
          No open asks near you yet. Post yours &mdash; we&rsquo;ll ping travellers in your radius
          and surface it on the next matching trip from your country of origin.
        </>
      }
      actions={
        <>
          <Button asChild variant="primary" size="lg">
            <Link href="/requests/new">
              Post the first request <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/discover">Browse discover</Link>
          </Button>
        </>
      }
    />
  );
}
