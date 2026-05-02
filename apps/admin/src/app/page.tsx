import { SHOWCASE_AUDIT_LOG, SHOWCASE_STATS, SHOWCASE_WEEKLY_LISTINGS } from '@eushop/mock-data';
import { api } from '../lib/trpc-server';

export default async function AdminOverviewPage() {
  let liveCount = SHOWCASE_STATS.liveListings;
  let reqCount = SHOWCASE_STATS.openRequests;
  try {
    const trpc = await api();
    const [listings, requests] = await Promise.all([
      trpc.listings.recent({ limit: 40 }),
      trpc.requests.feed({ limit: 40 }),
    ]);
    if (listings.length) liveCount = listings.length;
    if (requests.length) reqCount = requests.length;
  } catch {
    /* offline — mock stats above */
  }

  const series = SHOWCASE_WEEKLY_LISTINGS;
  const max = Math.max(...series, 1);
  const w = 320;
  const h = 80;
  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - (v / max) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-10">
      <div>
        <p className="text-ash text-xs tracking-widest uppercase">Overview</p>
        <h1 className="text-ink font-serif text-4xl">Live network</h1>
        <p className="text-ink/70 mt-2 max-w-2xl text-sm">
          KPIs reflect the database when it has rows; otherwise the curated demo snapshot keeps the
          console alive for walkthroughs.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Live listings" value={liveCount} />
        <Kpi label="Open requests" value={reqCount} />
        <Kpi label="Demo conversations" value={SHOWCASE_STATS.conversations} />
        <Kpi label="Avg. trust (demo)" value={SHOWCASE_STATS.trustScoreAvg} />
      </ul>

      <section className="border-ink/10 bg-porcelain/40 rounded-2xl border p-6">
        <h2 className="text-ink font-serif text-xl">Weekly new listings (demo trend)</h2>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="text-saffron-600 mt-4 w-full max-w-md"
          aria-hidden
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={pts}
          />
        </svg>
      </section>

      <section className="border-ink/10 bg-porcelain/40 rounded-2xl border p-6">
        <h2 className="text-ink font-serif text-xl">Today</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {SHOWCASE_AUDIT_LOG.slice(0, 5).map((row) => (
            <li
              key={row.id}
              className="border-ink/8 flex flex-wrap items-baseline gap-2 border-b border-dashed pb-2"
            >
              <span className="text-ash text-xs">{row.ts.toISOString().slice(11, 16)}</span>
              <span className="text-ink font-medium">{row.action}</span>
              <span className="text-ash">· {row.actor}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <li className="border-ink/10 list-none rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-ash text-xs tracking-widest uppercase">{label}</p>
      <p className="text-ink mt-2 font-serif text-3xl tabular-nums">{value}</p>
    </li>
  );
}
