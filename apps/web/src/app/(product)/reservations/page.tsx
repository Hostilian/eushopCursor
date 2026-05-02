import { ArrowRight, Plane } from 'lucide-react';
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

export const metadata = {
  title: 'My reservations',
  description: 'Slots you have reserved on diaspora trips.',
};

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

export default async function ReservationsPage() {
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
      outage = e instanceof Error ? e.message : 'Could not load your reservations.';
    }
  }

  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-ash text-xs tracking-widest uppercase">Buyer dashboard</p>
            <h1 className="text-ink mt-3 font-serif text-5xl">Your reservations.</h1>
            <p className="text-ink/70 mt-3 max-w-xl text-lg">
              Track confirmation, departure, and handoff. Cancel anytime before the traveller
              confirms.
            </p>
          </div>
          <Button asChild variant="primary">
            <Link href="/trips">
              Browse upcoming trips <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {outage ? (
          <div
            role="alert"
            className="border-danger/30 bg-danger/5 text-danger mt-8 rounded-2xl border p-4 text-sm"
          >
            {outage}
          </div>
        ) : null}

        {needsAuth ? (
          <div className="border-ink/10 bg-porcelain mt-12 rounded-3xl border p-12 text-center">
            <p className="text-ink font-serif text-2xl">Sign in to see your reservations.</p>
            <Button asChild variant="primary" className="mt-4">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        ) : rows.length === 0 && !outage ? (
          <div className="border-ink/10 bg-porcelain mt-12 flex flex-col items-center gap-6 rounded-3xl border px-6 py-20 text-center">
            <Plane className="text-saffron-600 h-10 w-10" />
            <div className="max-w-xl">
              <h2 className="text-ink font-serif text-3xl">No reservations yet.</h2>
              <p className="text-ink/70 mt-3">
                Browse trips from the country you miss and reserve a slot — or post a request and
                we'll match you to the next traveller.
              </p>
            </div>
          </div>
        ) : (
          <ul
            aria-labelledby="reservations-heading"
            className="border-ink/10 mt-12 divide-y rounded-3xl border bg-white"
          >
            <li className="sr-only" id="reservations-heading">
              Your active and historical reservations
            </li>
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                aria-label={`Reservation for ${r.qty} ${r.freeformText}, status ${r.status}`}
              >
                <div className="min-w-0">
                  <Link href={`/trips/${r.tripOfferId}`} className="text-ink truncate font-medium">
                    {r.qty}× {r.freeformText}
                  </Link>
                  <p className="text-ash mt-1 text-xs">
                    Booked {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="soft">€{Number(r.agreedFinderFee).toFixed(2)}</Badge>
                  <Badge variant="outline">+ €{Number(r.platformFee).toFixed(2)} fee</Badge>
                  <Badge variant={r.status === 'confirmed' ? 'accent' : 'soft'}>{r.status}</Badge>
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
