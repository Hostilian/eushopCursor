/**
 * Audit log from `moderation_actions`, joined to actor email for review context.
 */

import Link from 'next/link';
import { api } from '../../lib/trpc-server';

type AuditRow = {
  id: string;
  reportId: string | null;
  actorId: string;
  actorEmail: string;
  action: string;
  note: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

function isHighSignalAudit(r: AuditRow): boolean {
  if (r.action === 'remove_listing') return true;
  const kind = r.metadata?.kind;
  if (
    kind === 'kyc_review' ||
    kind === 'grant_verified_bringer' ||
    kind === 'revoke_verified_bringer'
  )
    return true;
  const note = r.note?.toLowerCase() ?? '';
  if (note.includes('verified_bringer') || note.includes('kyc session')) return true;
  return false;
}

export default async function AdminAuditPage() {
  let rows: AuditRow[] = [];
  let loadError: string | null = null;
  try {
    const trpc = await api();
    rows = (await trpc.trust.auditLog()) as AuditRow[];
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Could not load audit log.';
  }

  return (
    <div className="space-y-6">
      <h1 className="text-ink font-serif text-3xl">Audit log</h1>
      <p className="text-ink/70 max-w-xl text-sm">
        Moderation actions (report resolutions, dismissals, listing removals{' '}
        <code>remove_listing</code>, KYC / verified-bringer decisions, role changes, and notes) as
        stored in <code>moderation_actions</code>. Newest first, capped at 100 rows. For payment
        ledger rows, see <Link href="/payments">Payments</Link>.
      </p>

      {loadError ? (
        <div className="border-danger/30 bg-danger/5 text-danger rounded-2xl border p-4 text-sm">
          {loadError}
        </div>
      ) : null}

      {rows.length === 0 && !loadError ? (
        <div className="border-ink/10 bg-porcelain rounded-2xl border p-8 text-center">
          <p className="text-ink/70 text-sm">No moderation actions recorded yet.</p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {rows.map((r) => (
            <li
              key={r.id}
              className={
                isHighSignalAudit(r)
                  ? 'border-saffron-500/40 bg-saffron-50/60 rounded-2xl border-2 p-5 shadow-sm'
                  : 'border-ink/10 rounded-2xl border bg-white p-5'
              }
            >
              <p className="text-ink font-mono text-xs">{r.id}</p>
              <p className="text-ink mt-2 font-serif text-lg">{r.action}</p>
              <p className="text-ash mt-1 text-sm">
                Actor: <span className="font-mono text-xs">{r.actorEmail}</span>
              </p>
              {r.reportId ? (
                <p className="text-ash mt-1 font-mono text-xs">Report {r.reportId}</p>
              ) : null}
              {r.note ? <p className="text-ink/70 mt-3 text-sm">{r.note}</p> : null}
              {Object.keys(r.metadata ?? {}).length > 0 ? (
                <pre className="text-ash bg-porcelain/80 mt-2 max-h-32 overflow-auto rounded-lg p-2 font-mono text-xs">
                  {JSON.stringify(r.metadata, null, 2)}
                </pre>
              ) : null}
              <p className="text-ash mt-4 text-xs tracking-widest uppercase">
                {r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
