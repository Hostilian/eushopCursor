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
        <div className="border-ink/10 overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[780px] text-left text-sm">
            <caption className="sr-only">
              Active public listings with city, finder fee, and moderation actions.
            </caption>
            <thead className="bg-porcelain/80 text-ash text-xs tracking-widest uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Listing
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  City
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Finder fee
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  View
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Moderation
                </th>
              </tr>
            </thead>
            <tbody className="divide-ink/10 divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-porcelain/40">
                  <td className="px-4 py-3">
                    <p className="text-ink font-medium">{r.freeformName ?? 'Untitled listing'}</p>
                    <p className="text-ash mt-1 font-mono text-xs">{r.id}</p>
                  </td>
                  <td className="text-ash px-4 py-3">{r.approximateCity ?? '—'}</td>
                  <td className="text-ink px-4 py-3">€{r.finderFee}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`${webBase}/listings/${r.id}`}
                      className="text-saffron-700 text-xs underline"
                    >
                      Open in web
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <form action={adminRemoveListing} className="inline">
                      <input type="hidden" name="listingId" value={r.id} />
                      <button
                        type="submit"
                        className="text-danger hover:bg-danger/10 rounded-full border border-red-200 px-3 py-1 text-xs"
                      >
                        Remove from feed
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
