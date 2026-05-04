import { COUNTRIES } from '@eushop/catalog';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, BadgeCheck, MapPin, Plane, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '../../../../components/layout/footer';
import { Nav } from '../../../../components/layout/nav';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { ReservationForm } from '../../../../components/trips/reservation-form';
import { api } from '../../../../lib/trpc-server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const trpc = await api();
    const bundle = await trpc.trips.byId({ id });
    const from = COUNTRIES.find((c) => c.iso2 === bundle.trip.originCountryIso2)?.name;
    const to = COUNTRIES.find((c) => c.iso2 === bundle.trip.destinationCountryIso2)?.name;
    const route = `${bundle.trip.originCity}, ${from ?? bundle.trip.originCountryIso2} \u2192 ${bundle.trip.destinationCity}, ${to ?? bundle.trip.destinationCountryIso2}`;
    const description = `${bundle.trip.slotsAvailable} of ${bundle.trip.slotsTotal} bag slots available on this Eushop trip.`;
    const ogDescription = `${bundle.trip.slotsAvailable}/${bundle.trip.slotsTotal} slots, \u20ac${Number(bundle.trip.defaultPerSlotFee).toFixed(2)} per slot.`;
    return {
      title: `Trip ${route}`,
      description,
      openGraph: {
        title: `Trip ${route} \u00b7 Eushop`,
        description: ogDescription,
      },
      twitter: {
        card: 'summary_large_image',
        title: `Trip ${route} \u00b7 Eushop`,
        description: ogDescription,
      },
    };
  } catch {
    return { title: 'Trip details', description: 'A trip on Eushop.' };
  }
}

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tDetail = await getTranslations('tripDetail');
  const tNav = await getTranslations('nav');
  const tTrips = await getTranslations('trips');

  let bundle: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['trips']['byId']>> | null = null;
  let outageMessage: string | null = null;
  try {
    const trpc = await api();
    bundle = await trpc.trips.byId({ id });
  } catch (e) {
    if (e instanceof Error && /NOT_FOUND/.test(e.message)) notFound();
    outageMessage = e instanceof Error && e.message ? e.message : tDetail('outageDescription');
  }

  if (outageMessage) {
    return (
      <>
        <Nav />
        <main id="main-content" className="container-editorial pt-12 pb-32">
          <h1 className="text-ink font-serif text-3xl">{tDetail('outageTitle')}</h1>
          <p className="text-ash mt-3 max-w-xl text-sm">{outageMessage}</p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="primary">
              <Link href="/trips">{tDetail('back')}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!bundle) notFound();
  const trip = bundle.trip;
  const reservations = bundle.viewerIsSeller ? bundle.reservations : bundle.ownReservations;
  const summary = bundle.viewerIsSeller ? null : bundle.reservationSummary;
  const from = COUNTRIES.find((c) => c.iso2 === trip.originCountryIso2);
  const to = COUNTRIES.find((c) => c.iso2 === trip.destinationCountryIso2);
  const verifiedBringer = trip.sellerBadges?.includes('verified_bringer') ?? false;

  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <nav aria-label="Breadcrumb" className="text-ash text-xs">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/trips" className="hover:text-ink underline-offset-2 hover:underline">
                {tNav('trips')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink/70" aria-current="page">
              {trip.originCity} → {trip.destinationCity}
            </li>
          </ol>
        </nav>
        <div className="mt-4 grid gap-12 md:grid-cols-12">
          <section className="md:col-span-7">
            <div className="text-ink flex flex-wrap items-center gap-3 font-serif text-4xl md:text-5xl">
              <span>
                {from?.flagEmoji} {trip.originCity}
              </span>
              <Plane className="text-saffron-600 h-6 w-6" />
              <span>
                {to?.flagEmoji} {trip.destinationCity}
              </span>
            </div>
            <p className="text-ash mt-3 text-sm">
              {tDetail('departs', { when: formatDate(trip.departAt) })} ·{' '}
              {tDetail('returns', {
                when: trip.returnAt ? formatDate(trip.returnAt) : '—',
              })}
            </p>
            <div className="text-ash mt-6 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="soft">
                <Users className="h-3 w-3" />{' '}
                {tTrips('slotsBadge', {
                  available: trip.slotsAvailable,
                  total: trip.slotsTotal,
                })}
              </Badge>
              <Badge variant="accent">
                {tTrips('feePerSlot', {
                  fee: Number(trip.defaultPerSlotFee).toFixed(2),
                })}
              </Badge>
              {verifiedBringer ? (
                <Badge variant="outline" className="border-saffron-400 text-saffron-800">
                  <BadgeCheck className="h-3 w-3" /> {tDetail('verifiedBringer')}
                </Badge>
              ) : null}
              <Badge variant="outline">
                <MapPin className="h-3 w-3" /> {to?.name}
              </Badge>
            </div>
            {trip.notes ? (
              <p className="text-ink/80 mt-8 max-w-2xl text-pretty whitespace-pre-line">
                {trip.notes}
              </p>
            ) : null}

            <div className="mt-10">
              <h2 className="text-ink font-serif text-2xl">
                {bundle.viewerIsSeller ? 'Reservations on this trip' : 'Your reservations'}
              </h2>
              {summary ? (
                <p className="text-ash mt-2 text-sm">
                  {summary.confirmed + summary.pending} active reservation
                  {summary.confirmed + summary.pending === 1 ? '' : 's'} · {summary.confirmed}{' '}
                  confirmed · {summary.pending} pending
                  {summary.completed > 0 ? ` · ${summary.completed} completed` : ''}
                </p>
              ) : null}
              {reservations.length === 0 ? (
                <p className="text-ash mt-2 text-sm">
                  {bundle.viewerIsSeller
                    ? 'No reservations yet. Buyers will appear here as they book.'
                    : 'You have no reservations on this trip yet.'}
                </p>
              ) : (
                <ul className="border-ink/10 mt-4 divide-y rounded-2xl border bg-white">
                  {reservations.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                    >
                      <span className="text-ink font-medium">
                        {r.qty}× {r.freeformText}
                      </span>
                      <span className="text-ash text-xs tracking-widest uppercase">{r.status}</span>
                      <span className="text-saffron-700 text-xs">
                        €{Number(r.agreedFinderFee).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <aside className="md:col-span-5">
            <div className="border-ink/10 bg-porcelain sticky top-24 space-y-5 rounded-3xl border p-6">
              <p className="text-ash text-xs tracking-widest uppercase">Reserve a slot</p>
              {trip.slotsAvailable === 0 ? (
                <div>
                  <p className="text-ink font-serif text-2xl">All slots taken.</p>
                  <p className="text-ash mt-2 text-sm">
                    Post a request and we&apos;ll notify you when this traveller — or the next one
                    on the route — opens a new trip.
                  </p>
                  <Button asChild variant="primary" className="mt-4">
                    <Link href="/requests/new">
                      Post a request <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <ReservationForm
                  tripOfferId={trip.id}
                  defaultFee={Number(trip.defaultPerSlotFee)}
                  destinationCity={trip.destinationCity}
                />
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
