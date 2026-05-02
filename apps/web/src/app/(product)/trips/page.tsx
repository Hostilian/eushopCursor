import { COUNTRIES } from '@eushop/catalog-data';
import { EmptyState, ErrorState } from '@eushop/ui-web';
import { ArrowRight, MapPin, Plane, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/trpc-server';
import { isDemoModeEnabled } from '../../../lib/demo-mode';
import { showcaseTrips as showcaseTripOffers } from '../../../lib/showcase';

export async function generateMetadata() {
  const t = await getTranslations('trips');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
  };
}

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
  sellerBadges?: string[];
};

type TripsT = Awaited<ReturnType<typeof getTranslations<'trips'>>>;

export default async function TripsPage() {
  const t = await getTranslations('trips');
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
            <p className="text-ash text-xs tracking-widest uppercase">{t('eyebrow')}</p>
            <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">{t('heading')}</h1>
            <p className="text-ink/70 mt-4 max-w-2xl text-lg">{t('intro')}</p>
          </div>
          <Button asChild variant="primary" size="lg">
            <Link href="/trips/new">
              {t('postTrip')} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {trips.length > 0 ? (
          <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                fromIso={trip.originCountryIso2}
                fromCity={trip.originCity}
                toIso={trip.destinationCountryIso2}
                toCity={trip.destinationCity}
                departText={formatDeparture(trip.departAt, t)}
                slotsTotal={trip.slotsTotal}
                slotsAvailable={trip.slotsAvailable}
                feePerSlot={Number(trip.defaultPerSlotFee)}
                notes={trip.notes}
                spareWeightKg={trip.spareWeightKg}
                spareVolumeLiters={trip.spareVolumeLiters}
                verifiedBringerLabel={
                  trip.sellerBadges?.includes('verified_bringer') ? t('verifiedBringer') : null
                }
                reserveCta={t('reserveCta')}
                showcaseCta={t('showcaseCta')}
              />
            ))}
          </ul>
        ) : demoTrips.length > 0 ? (
          <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {demoTrips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                fromIso={trip.originCountryIso2}
                fromCity={trip.originCity}
                toIso={trip.destinationCountryIso2}
                toCity={trip.destinationCity}
                departText={formatDeparture(trip.departAt, t)}
                slotsTotal={trip.slotsTotal}
                slotsAvailable={trip.slotsAvailable}
                feePerSlot={Number(trip.defaultPerSlotFee)}
                notes={trip.notes}
                spareWeightKg={trip.spareWeightKg}
                spareVolumeLiters={trip.spareVolumeLiters}
                demoShowcase
                reserveCta={t('reserveCta')}
                showcaseCta={t('showcaseCta')}
              />
            ))}
          </ul>
        ) : serviceError ? (
          <ErrorState
            className="mt-12"
            title={t('errorTitle')}
            description={t('errorDescription')}
            actions={
              <>
                <Button asChild variant="primary">
                  <Link href="/trips">{t('retry')}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/requests">{t('browseRequestsAlt')}</Link>
                </Button>
              </>
            }
          />
        ) : (
          <EmptyTrips t={t} />
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
  verifiedBringerLabel,
  reserveCta,
  showcaseCta,
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
  verifiedBringerLabel?: string | null;
  reserveCta: string;
  showcaseCta: string;
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
      <p className="text-ash text-sm">{departText}</p>
      {verifiedBringerLabel ? (
        <Badge variant="accent" className="w-fit text-[10px]">
          {verifiedBringerLabel}
        </Badge>
      ) : null}
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
        <Link
          href={demoShowcase ? '/trips' : `/trips/${id}`}
          aria-label={
            demoShowcase
              ? `${showcaseCta}: ${fromCity} → ${toCity}`
              : `${reserveCta}: ${fromCity} → ${toCity}, ${departText}`
          }
        >
          {demoShowcase ? showcaseCta : reserveCta}
        </Link>
      </Button>
    </li>
  );
}

function EmptyTrips({ t }: { t: TripsT }) {
  return (
    <EmptyState
      className="mt-12"
      icon={<Plane className="text-saffron-600 mx-auto h-10 w-10" />}
      title={t('emptyTitle')}
      description={<>{t('emptyDescription')}</>}
      actions={
        <>
          <Button asChild variant="primary" size="lg">
            <Link href="/trips/new">
              {t('postFirstTrip')} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/requests">{t('browseRequests')}</Link>
          </Button>
        </>
      }
    />
  );
}

function formatDeparture(d: Date | string, t: TripsT): string {
  const date = d instanceof Date ? d : new Date(d);
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return t('today');
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return t('today');
  if (days === 1) return t('tomorrow');
  if (days < 14) return t('inDays', { days });
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}
