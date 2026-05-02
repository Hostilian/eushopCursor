import { api } from '../../lib/trpc-server';

export default async function AdminRequestsPage() {
  let rows: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['requests']['feed']>> = [];
  try {
    const trpc = await api();
    rows = await trpc.requests.feed({ limit: 24 });
  } catch {
    /* mock */
  }

  return (
    <div className="space-y-6">
      <h1 className="text-ink font-serif text-3xl">Requests</h1>
      {rows.length === 0 ? (
        <div className="border-ink/10 bg-porcelain rounded-2xl border p-8 text-center">
          <p className="text-ink/70 text-sm">No open requests.</p>
        </div>
      ) : (
        <ul className="divide-ink/10 border-ink/10 divide-y rounded-2xl border bg-white">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-3 text-sm">
              <p className="text-ink font-medium">{r.freeformText}</p>
              <p className="text-ash mt-1">
                {r.approximateCity} · radius {r.radiusKm} km
                {r.maxFinderFee ? ` · max €${r.maxFinderFee}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
