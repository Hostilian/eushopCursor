import Link from 'next/link';
import { api } from '../../lib/trpc-server';
import { adminRemoveListing } from './actions';

const webBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const sp = await searchParams;
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
      <p className="text-ink/70 max-w-xl text-sm">
        Live listings only (removed posts are hidden from public queries). Operators can remove a
        post from the public feed (status → <code>removed</code>) — each action is recorded in{' '}
        <code>moderation_actions</code>. View the trail in{' '}
        <Link href="/audit" className="text-saffron-700 underline">
          Audit log
        </Link>
        .
      </p>
      {sp.err ? (
        <p className="text-danger rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm">
          {sp.err}
        </p>
      ) : null}
      {sp.ok === 'removed' ? (
        <p className="text-ink rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm">
          Listing removed from public feed.
        </p>
      ) : null}
      {rows.length === 0 ? (
        <div className="border-ink/10 bg-porcelain rounded-2xl border p-8 text-center">
          <p className="text-ink/70 text-sm">No live listings right now.</p>
        </div>
      ) : (
        <ul className="divide-ink/10 border-ink/10 divide-y rounded-2xl border bg-white">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span className="text-ink font-medium">{r.freeformName ?? r.id}</span>
              <span className="text-ash">
                {r.approximateCity} · €{r.finderFee}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`${webBase}/listings/${r.id}`}
                  className="text-saffron-700 text-xs underline"
                >
                  Open in web
                </Link>
                <form action={adminRemoveListing} className="inline">
                  <input type="hidden" name="listingId" value={r.id} />
                  <button
                    type="submit"
                    className="text-danger hover:bg-danger/10 rounded-full border border-red-200 px-3 py-1 text-xs"
                  >
                    Remove from feed
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
