import Link from 'next/link';

import { EditorialPageLayout } from '../../components/marketing/editorial-page';
import { api } from '../../lib/trpc-server';

export const metadata = {
  title: 'Traction · Eushop',
  description:
    'Live operating numbers for Eushop. We never invent or inflate. If it is zero today, it says zero.',
};

// Always fetch fresh on every request — these numbers are the entire point.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatEuros(cents: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatInt(n: number): string {
  return new Intl.NumberFormat('en-IE').format(n);
}

interface CountTile {
  label: string;
  value: string;
  caption?: string;
}

export default async function TractionPage() {
  let counts: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['traction']['liveCounts']>> = {
    signups: 0,
    profiles: 0,
    listings: 0,
    requests: 0,
    tripsPosted: 0,
    reservationsConfirmed: 0,
    reservationsCompleted: 0,
    gmvCents: 0,
    platformFeeCents: 0,
    countriesActive: 0,
  };
  let weekly: Array<{ week: string; signups: number; trips: number; reservations: number }> = [];
  let liveError: string | null = null;

  try {
    const trpc = await api();
    counts = await trpc.traction.liveCounts();
    weekly = await trpc.traction.weeklyGrowth({ weeks: 12 });
  } catch (err) {
    liveError = err instanceof Error ? err.message : 'Unknown error';
  }

  const tiles: CountTile[] = [
    { label: 'Signups', value: formatInt(counts.signups) },
    { label: 'Profiles completed', value: formatInt(counts.profiles) },
    { label: 'Listings posted', value: formatInt(counts.listings) },
    { label: 'Open requests', value: formatInt(counts.requests) },
    { label: 'Trips posted', value: formatInt(counts.tripsPosted) },
    {
      label: 'Reservations confirmed',
      value: formatInt(counts.reservationsConfirmed),
      caption: `${formatInt(counts.reservationsCompleted)} completed handoffs`,
    },
    {
      label: 'GMV (agreed finder fees)',
      value: formatEuros(counts.gmvCents),
      caption: `${formatEuros(counts.platformFeeCents)} platform fees`,
    },
    {
      label: 'Countries with at least one trip',
      value: formatInt(counts.countriesActive),
    },
  ];

  const maxSignups = Math.max(1, ...weekly.map((w) => w.signups));
  const maxTrips = Math.max(1, ...weekly.map((w) => w.trips));

  return (
    <EditorialPageLayout
      eyebrow="Traction · live"
      title="What the dashboard says today."
      subtitle="These numbers come from the production database the moment you load this page. We never round up. If it is zero, it says zero."
    >
      <section className="space-y-10">
        {liveError ? (
          <div className="border-amber/40 bg-amber/10 text-ink/80 rounded-xl border p-4 text-sm">
            We could not reach the database to render live numbers right now. That is itself a real
            signal — we surface infrastructure problems instead of papering over them with fixtures.
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="border-ink/10 bg-cream rounded-2xl border p-5">
              <p className="text-ash text-xs tracking-widest uppercase">{tile.label}</p>
              <p className="text-ink mt-2 font-serif text-3xl">{tile.value}</p>
              {tile.caption ? <p className="text-ink/60 mt-1 text-xs">{tile.caption}</p> : null}
            </div>
          ))}
        </div>

        <div className="border-ink/10 rounded-2xl border p-6">
          <p className="text-ash text-xs tracking-widest uppercase">
            Weekly growth · last 12 weeks
          </p>
          <div className="mt-6 grid grid-cols-12 items-end gap-1.5" aria-hidden="true">
            {weekly.length > 0 ? (
              weekly.map((w) => {
                const signupsHeight = (w.signups / maxSignups) * 100;
                const tripsHeight = (w.trips / maxTrips) * 100;
                return (
                  <div key={w.week} className="flex h-32 flex-col justify-end gap-0.5">
                    <div
                      className="bg-ink/80 w-full rounded-sm"
                      style={{ height: `${signupsHeight}%`, minHeight: w.signups > 0 ? '2px' : 0 }}
                      title={`${w.week} · signups ${w.signups}`}
                    />
                    <div
                      className="bg-ink/30 w-full rounded-sm"
                      style={{ height: `${tripsHeight}%`, minHeight: w.trips > 0 ? '2px' : 0 }}
                      title={`${w.week} · trips ${w.trips}`}
                    />
                  </div>
                );
              })
            ) : (
              <p className="text-ink/60 col-span-12 text-sm">No weekly data yet.</p>
            )}
          </div>
          <div className="text-ink/60 mt-4 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-ink/80 h-2 w-2 rounded-sm" /> Signups
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-ink/30 h-2 w-2 rounded-sm" /> Trips posted
            </span>
          </div>
        </div>

        <p className="text-ink/60 max-w-xl text-sm">
          Want the modeled curve, the corridor-by-corridor breakdown, the take rate maths and the
          Series A milestones? Those live behind a per-fund token at{' '}
          <Link href="/investors" className="text-ink underline underline-offset-4">
            /investors
          </Link>
          .
        </p>
      </section>
    </EditorialPageLayout>
  );
}
