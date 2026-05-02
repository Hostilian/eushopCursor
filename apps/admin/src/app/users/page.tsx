/**
 * Real users-and-moderation surface. The original screen showed six fictional
 * personas to fill the white space. That's gone — admins now see whatever
 * the moderation queue and profiles table actually contain. Empty is fine.
 */

import { api } from '../../lib/trpc-server';

type ModerationRow = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  details: string | null;
  createdAt: Date;
};

export default async function AdminUsersPage() {
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
