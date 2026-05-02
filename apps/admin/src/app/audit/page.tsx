import { SHOWCASE_AUDIT_LOG } from '@eushop/mock-data';

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-ink font-serif text-3xl">Audit log</h1>
      <p className="text-ink/70 text-sm">
        Synthetic events for UI polish — wire to DB audit table later.
      </p>
      <ul className="divide-ink/10 border-ink/10 divide-y rounded-2xl border bg-white font-mono text-xs">
        {SHOWCASE_AUDIT_LOG.map((row) => (
          <li key={row.id} className="flex flex-wrap gap-3 px-4 py-3">
            <time className="text-ash">{row.ts.toISOString()}</time>
            <span className="text-ink">{row.action}</span>
            <span className="text-ash">{row.actor}</span>
            <span className="text-saffron-800">{row.target}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
