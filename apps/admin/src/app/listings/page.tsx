import Link from 'next/link';
import { api } from '../../lib/trpc-server';

const webBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function AdminListingsPage() {
  let rows: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['listings']['recent']>> = [];
  try {
    const trpc = await api();
    rows = await trpc.listings.recent({ limit: 24 });
  } catch {
    /* offline — empty list, no synthetic listings */
  }

  return (
    <div className="space-y-6">
      <h1 className="text-ink font-serif text-3xl">Listings</h1>
      <p className="text-ink/70 max-w-xl text-sm">Read-only grid — moderation actions ship next.</p>
      {rows.length === 0 ? (
        <div className="border-ink/10 bg-porcelain rounded-2xl border p-8 text-center">
          <p className="text-ink/70 text-sm">No listings posted yet.</p>
        </div>
      ) : (
        <ul className="divide-ink/10 border-ink/10 divide-y rounded-2xl border bg-white">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <span className="text-ink font-medium">{r.freeformName ?? r.id}</span>
              <span className="text-ash">
                {r.approximateCity} · €{r.finderFee}
              </span>
              <Link
                href={`${webBase}/listings/${r.id}`}
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
