import { ArrowRight, Plane } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import {
  ReservationActions,
  type ReservationActionStatus,
} from '../../../components/trips/reservation-actions';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/trpc-server';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const t = await getTranslations('reservations');
  return {
    title: t('metaTitle'),
    description: t('intro'),
  };
}

type ReservationRow = {
  id: string;
  tripOfferId: string;
  freeformText: string;
  qty: number;
  agreedFinderFee: string;
  platformFee: string;
  status: ReservationActionStatus;
  createdAt: Date | string;
};

function statusLabel(
  t: Awaited<ReturnType<typeof getTranslations<'reservations'>>>,
  status: ReservationActionStatus,
): string {
  switch (status) {
    case 'pending':
      return t('statusPending');
    case 'confirmed':
      return t('statusConfirmed');
    case 'completed':
      return t('statusCompleted');
    case 'cancelled':
      return t('statusCancelled');
    case 'refunded':
      return t('statusRefunded');
    case 'seller-rejected':
      return t('statusSellerRejected');
    default:
      return String(status);
  }
}

export default async function ReservationsPage() {
  const t = await getTranslations('reservations');
  let rows: ReservationRow[] = [];
  let needsAuth = false;
  let outage: string | null = null;
  try {
    const trpc = await api();
    rows = (await trpc.trips.mineReservations()) as ReservationRow[];
  } catch (e) {
    if (e instanceof Error && /UNAUTHORIZED/.test(e.message)) {
      needsAuth = true;
    } else {
      outage = e instanceof Error ? e.message : t('errorDescription');
    }
  }

  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-ash text-xs tracking-widest uppercase">{t('heading')}</p>
            <h1 id="reservations-heading" className="text-ink mt-3 font-serif text-5xl">
              {t('heading')}
            </h1>
            <p className="text-ink/70 mt-3 max-w-xl text-lg">{t('intro')}</p>
          </div>
          <Button asChild variant="primary">
            <Link href="/trips">
              {t('browseTrips')} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div aria-live="polite" className="sr-only" id="reservations-status" />

        {outage ? (
          <div
            role="alert"
            aria-live="assertive"
            className="border-danger/30 bg-danger/5 text-danger mt-8 rounded-2xl border p-4 text-sm"
          >
            <p className="font-medium">{t('errorTitle')}</p>
            <p className="mt-1">{outage}</p>
          </div>
        ) : null}

        {needsAuth ? (
          <div className="border-ink/10 bg-porcelain mt-12 rounded-3xl border p-12 text-center">
            <p className="text-ink font-serif text-2xl">{t('signInTitle')}</p>
            <Button asChild variant="primary" className="mt-4">
              <Link href="/sign-in">{t('signInCta')}</Link>
            </Button>
          </div>
        ) : rows.length === 0 && !outage ? (
          <div className="border-ink/10 bg-porcelain mt-12 flex flex-col items-center gap-6 rounded-3xl border px-6 py-20 text-center">
            <Plane className="text-saffron-600 h-10 w-10" />
            <div className="max-w-xl">
              <h2 className="text-ink font-serif text-3xl">{t('emptyTitle')}</h2>
              <p className="text-ink/70 mt-3">{t('emptyDescription')}</p>
            </div>
          </div>
        ) : (
          <ul
            aria-labelledby="reservations-heading"
            className="border-ink/10 mt-12 divide-y rounded-3xl border bg-white"
          >
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                aria-label={t('qty', { qty: r.qty }) + ' — ' + statusLabel(t, r.status)}
              >
                <div className="min-w-0">
                  <Link href={`/trips/${r.tripOfferId}`} className="text-ink truncate font-medium">
                    {r.qty}× {r.freeformText}
                  </Link>
                  <p className="text-ash mt-1 text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="soft">
                    {t('feeLabel', { fee: Number(r.agreedFinderFee).toFixed(2) })}
                  </Badge>
                  <Badge variant="outline">
                    {t('platformFeeLabel', { fee: Number(r.platformFee).toFixed(2) })}
                  </Badge>
                  <Badge variant={r.status === 'confirmed' ? 'accent' : 'soft'}>
                    {statusLabel(t, r.status)}
                  </Badge>
                  <ReservationActions reservationId={r.id} status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
