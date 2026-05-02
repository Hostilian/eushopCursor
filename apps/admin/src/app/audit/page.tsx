/**
 * Audit log surface. Will hook into the moderation_actions table once a
 * dedicated `trust.auditLog` query lands; until then we render an honest
 * placeholder rather than synthetic events that could mislead a reviewer.
 */
export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-ink font-serif text-3xl">Audit log</h1>
      <p className="text-ink/70 max-w-xl text-sm">
        Every moderation action — listing removals, user suspensions, report resolutions — will
        stream into this view from the <code>moderation_actions</code> table. Wiring lands with the
        Stripe Connect milestone (see <code>CHANGELOG.md</code>); until then this view stays
        intentionally empty so nothing here is invented.
      </p>
      <div className="border-ink/10 bg-porcelain rounded-2xl border p-8 text-center">
        <p className="text-ink/70 text-sm">No moderation actions recorded yet.</p>
      </div>
    </div>
  );
}
