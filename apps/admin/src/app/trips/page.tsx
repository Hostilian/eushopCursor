import Link from 'next/link';
import { api } from '../../lib/trpc-server';

const webBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function AdminTripsPage() {
  let rows: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['trips']['recent']>> = [];
  try {
    const trpc = await api();
    rows = await trpc.trips.recent({ limit: 40 });
  } catch {
    /* cold DB */
  }

  return (
    <div className="space-y-6">
      <h1 className="text-ink font-serif text-3xl">Trips</h1>
      <p className="text-ink/70 max-w-xl text-sm">
        Open trip offers from the product database — read-only until moderation tools ship.
      </p>
      {rows.length === 0 ? (
        <div className="border-ink/10 bg-porcelain rounded-2xl border p-8 text-center">
          <p className="text-ink/70 text-sm">No upcoming trip offers yet.</p>
        </div>
      ) : (
        <ul className="divide-ink/10 border-ink/10 divide-y rounded-2xl border bg-white">
          {rows.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <span className="text-ink font-medium">
                {t.originCity} → {t.destinationCity}
              </span>
              <span className="text-ash">
                {new Date(t.departAt).toLocaleDateString()} · {t.slotsAvailable}/{t.slotsTotal}{' '}
                slots · {t.status}
              </span>
              <Link
                href={`${webBase}/trips/${t.id}`}
                className="text-saffron-700 text-xs underline"
              >
                Open in web
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
