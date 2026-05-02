import { COUNTRIES } from '@eushop/catalog-data';
import { EmptyState, ErrorState } from '@eushop/ui-web';
import { ArrowRight, MapPin, Plane, Users } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/trpc-server';
import { isDemoModeEnabled } from '../../../lib/demo-mode';
import { showcaseTrips as showcaseTripOffers } from '../../../lib/showcase';

export const metadata = {
  title: 'Trips · Diaspora marketplace',
  description:
    'Reserve a slot in a diaspora traveller’s suitcase. Trips between EU cities, every week.',
  openGraph: {
    title: 'Upcoming diaspora trips · Eushop',
    description:
      'Reserve a slot in a diaspora traveller’s suitcase. Trips between EU cities, every week.',
  },
};

type TripRow = {
  id: string;
  originCountryIso2: string;
  originCity: string;
  destinationCountryIso2: string;
  destinationCity: string;
  departAt: Date | string;
  slotsAvailable: number;
  slotsTotal: number;
  defaultPerSlotFee: string;
  notes: string | null;
  spareWeightKg: number | null;
  spareVolumeLiters: number | null;
};

export default async function TripsPage() {
  let trips: TripRow[] = [];
  let serviceError = false;
  try {
    const trpc = await api();
    trips = (await trpc.trips.recent({ limit: 24 })) as TripRow[];
  } catch {
    serviceError = true;
  }
  const demo = await isDemoModeEnabled();
  const demoTrips: TripRow[] =
    trips.length === 0 && !serviceError && demo
      ? (showcaseTripOffers() as unknown as TripRow[])
      : [];

  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-ash text-xs tracking-widest uppercase">
              Suitcase capacity is the new last-mile
            </p>
            <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">
              Upcoming diaspora trips.
            </h1>
            <p className="text-ink/70 mt-4 max-w-2xl text-lg">
              A diaspora traveller flying home next week posts the spare slots in their carry-on.
              Reserve one for the jar of Krówki, the Manchego wheel, the Mastiha bottle. We charge a
              small platform fee on each confirmed reservation; everything else stays between you
              and the traveller.
            </p>
          </div>
          <Button asChild variant="primary" size="lg">
            <Link href="/trips/new">
              Post a trip <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {trips.length > 0 ? (
          <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((t) => (
              <TripCard
                key={t.id}
                id={t.id}
                fromIso={t.originCountryIso2}
                fromCity={t.originCity}
                toIso={t.destinationCountryIso2}
                toCity={t.destinationCity}
                departText={formatDeparture(t.departAt)}
                slotsTotal={t.slotsTotal}
                slotsAvailable={t.slotsAvailable}
                feePerSlot={Number(t.defaultPerSlotFee)}
                notes={t.notes}
                spareWeightKg={t.spareWeightKg}
                spareVolumeLiters={t.spareVolumeLiters}
              />
            ))}
          </ul>
        ) : demoTrips.length > 0 ? (
          <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {demoTrips.map((t) => (
              <TripCard
                key={t.id}
                id={t.id}
                fromIso={t.originCountryIso2}
                fromCity={t.originCity}
                toIso={t.destinationCountryIso2}
                toCity={t.destinationCity}
                departText={formatDeparture(t.departAt)}
                slotsTotal={t.slotsTotal}
                slotsAvailable={t.slotsAvailable}
                feePerSlot={Number(t.defaultPerSlotFee)}
                notes={t.notes}
                spareWeightKg={t.spareWeightKg}
                spareVolumeLiters={t.spareVolumeLiters}
                demoShowcase
              />
            ))}
          </ul>
        ) : serviceError ? (
          <ErrorState
            className="mt-12"
            title="Trips service is offline."
            description={
              <>
                We couldn&rsquo;t reach the trips service. Try again in a moment, or browse open
                requests in the meantime.
              </>
            }
            actions={
              <>
                <Button asChild variant="primary">
                  <Link href="/trips">Retry</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/requests">Browse requests</Link>
                </Button>
              </>
            }
          />
        ) : (
          <EmptyTrips />
        )}
      </main>
      <Footer />
    </>
  );
}

function TripCard({
  id,
  fromIso,
  fromCity,
  toIso,
  toCity,
  departText,
  slotsTotal,
  slotsAvailable,
  feePerSlot,
  notes,
  spareWeightKg,
  spareVolumeLiters,
  demoShowcase,
}: {
  id: string;
  fromIso: string;
  fromCity: string;
  toIso: string;
  toCity: string;
  departText: string;
  slotsTotal: number;
  slotsAvailable: number;
  feePerSlot: number;
  notes: string | null;
  spareWeightKg?: number | null;
  spareVolumeLiters?: number | null;
  demoShowcase?: boolean;
}) {
  const from = COUNTRIES.find((c) => c.iso2 === fromIso);
  const to = COUNTRIES.find((c) => c.iso2 === toIso);
  return (
    <li className="border-ink/10 bg-porcelain group flex flex-col gap-5 rounded-3xl border p-6 transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="text-ink flex items-center gap-3 font-serif text-2xl">
        <span>
          {from?.flagEmoji} {fromCity}
        </span>
        <Plane className="text-saffron-600 h-5 w-5" />
        <span>
          {to?.flagEmoji} {toCity}
        </span>
      </div>
      <p className="text-ash text-sm">Departs {departText}</p>
      {spareWeightKg != null || spareVolumeLiters != null ? (
        <p className="text-ink/60 text-xs">
          {spareWeightKg != null ? `~${spareWeightKg} kg spare` : null}
          {spareWeightKg != null && spareVolumeLiters != null ? ' · ' : null}
          {spareVolumeLiters != null ? `~${spareVolumeLiters} L volume hint` : null}
        </p>
      ) : null}
      {notes ? <p className="text-ink/70 line-clamp-3 text-sm">{notes}</p> : null}
      <div className="text-ash mt-auto flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="soft">
          <Users className="h-3 w-3" /> {slotsAvailable}/{slotsTotal} slots
        </Badge>
        <Badge variant="accent">€{feePerSlot.toFixed(2)} per slot</Badge>
        <Badge variant="outline">
          <MapPin className="h-3 w-3" /> {to?.name}
        </Badge>
      </div>
      <Button asChild variant={demoShowcase ? 'outline' : 'primary'}>
        <Link href={demoShowcase ? '/trips' : `/trips/${id}`}>
          {demoShowcase ? 'Showcase trip' : 'Reserve a slot'}
        </Link>
      </Button>
    </li>
  );
}

function EmptyTrips() {
  return (
    <EmptyState
      className="mt-12"
      icon={<Plane className="text-saffron-600 mx-auto h-10 w-10" />}
      title="No trips posted yet."
      description={
        <>
          Eushop is brand new and the trip board is quiet. Be the first traveller to advertise spare
          slots &mdash; or post a request and we&rsquo;ll notify you when a matching route appears.
        </>
      }
      actions={
        <>
          <Button asChild variant="primary" size="lg">
            <Link href="/trips/new">
              Post the first trip <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/requests">Browse open requests</Link>
          </Button>
        </>
      }
    />
  );
}

function formatDeparture(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return 'today';
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 14) return `in ${days} days`;
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}
