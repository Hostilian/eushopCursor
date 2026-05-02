import { api } from '../../lib/trpc-server';
import { setVerifiedBringer } from './actions';

type ModerationRow = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  details: string | null;
  createdAt: Date;
};

type AdminUsersPageProps = { searchParams: Promise<{ err?: string; ok?: string }> };

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const sp = await searchParams;
  let queue: ModerationRow[] = [];
  let queueError: string | null = null;
  try {
    const trpc = await api();
    const rows = (await trpc.trust.moderationQueue()) as ModerationRow[];
    queue = rows;
  } catch (e) {
    queueError = e instanceof Error ? e.message : 'Could not load moderation queue.';
  }

  return (
    <div className="space-y-6">
      <h1 className="text-ink font-serif text-3xl">Users &amp; moderation</h1>
      <p className="text-ink/70 max-w-xl text-sm">
        Open reports surface here. Resolve or dismiss each report from the API directly until the
        admin auth wraps land. Showing real rows only — no synthetic fillers.
      </p>

      {sp.err ? (
        <div className="border-danger/30 bg-danger/5 text-danger rounded-2xl border p-4 text-sm">
          {sp.err}
        </div>
      ) : null}
      {sp.ok === 'verified-bringer' ? (
        <div className="border-ink/10 bg-porcelain text-ink rounded-2xl border p-4 text-sm">
          Verified-bringer badge updated.
        </div>
      ) : null}

      <section className="border-ink/10 max-w-xl rounded-2xl border bg-white p-6">
        <h2 className="text-ink font-serif text-xl">Verified bringer (KYC review)</h2>
        <p className="text-ink/70 mt-2 text-xs">
          After Veriff/Onfido (or manual review), grant or revoke the{' '}
          <code className="text-ink">verified_bringer</code> badge on a user&apos;s profile. Audit
          entries appear in <a href="/audit">Audit</a>.
        </p>
        <form action={setVerifiedBringer} className="mt-4 space-y-3">
          <label className="text-ash block text-xs font-medium tracking-wider uppercase">
            User ID (UUID)
            <input name="userId" required className="form-input mt-1 w-full font-mono text-sm" />
          </label>
          <label className="text-ink flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="verified"
              value="true"
              defaultChecked
              className="rounded"
            />
            Grant badge (uncheck to revoke)
          </label>
          <label className="text-ash block text-xs font-medium tracking-wider uppercase">
            Note (optional)
            <textarea name="note" rows={2} className="form-input mt-1 w-full text-sm" />
          </label>
          <button
            type="submit"
            className="bg-ink text-paper hover:bg-ink/90 rounded-xl px-4 py-2 text-sm font-medium"
          >
            Apply
          </button>
        </form>
      </section>

      {queueError ? (
        <div className="border-danger/30 bg-danger/5 text-danger rounded-2xl border p-4 text-sm">
          {queueError}
        </div>
      ) : null}

      {queue.length === 0 && !queueError ? (
        <div className="border-ink/10 bg-porcelain rounded-2xl border p-8 text-center">
          <p className="text-ink/70 text-sm">
            No open reports. The community is healthy — or quiet. Check back as activity grows.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {queue.map((r) => (
            <li key={r.id} className="border-ink/10 rounded-2xl border bg-white p-5">
              <p className="text-ink font-mono text-xs">{r.id}</p>
              <p className="text-ink mt-2 font-serif text-lg">
                {r.reason} · {r.targetType}
              </p>
              <p className="text-ash mt-1 font-mono text-xs">{r.targetId}</p>
              {r.details ? <p className="text-ink/70 mt-3 text-sm">{r.details}</p> : null}
              <p className="text-ash mt-4 text-xs tracking-widest uppercase">{r.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
