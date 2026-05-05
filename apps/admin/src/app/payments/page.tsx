import Link from 'next/link';
import { api } from '../../lib/trpc-server';

const STATUS_PRESETS = [
  '',
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'processing',
  'requires_capture',
  'succeeded',
  'canceled',
] as const;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; updatedAfter?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = sp.status?.trim() || undefined;
  const updatedAfterRaw = sp.updatedAfter?.trim() || undefined;
  const updatedAfter = updatedAfterRaw ? new Date(`${updatedAfterRaw}T00:00:00.000Z`) : undefined;

  let reservationRows: Awaited<
    ReturnType<Awaited<ReturnType<typeof api>>['payments']['adminListReservationPayments']>
  > = [];
  let payoutRows: Awaited<
    ReturnType<Awaited<ReturnType<typeof api>>['payments']['adminListPayouts']>
  > = [];
  let loadError: string | null = null;
  try {
    const trpc = await api();
    const paymentQuery: { limit: number; status?: string; updatedAfter?: Date } = { limit: 200 };
    if (statusFilter) paymentQuery.status = statusFilter;
    if (updatedAfter) paymentQuery.updatedAfter = updatedAfter;
    [reservationRows, payoutRows] = await Promise.all([
      trpc.payments.adminListReservationPayments(paymentQuery),
      trpc.payments.adminListPayouts(),
    ]);
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Could not load payments data.';
  }

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h1 className="text-ink font-serif text-3xl">Reservation payments</h1>
        <p className="text-ink/70 max-w-2xl text-sm">
          Latest rows from <code>reservation_payments</code> (newest first, cap 200). Use this for
          reconciliation when capture fails or webhooks disagree with Stripe Dashboard. Cross-check
          with <Link href="/audit">Audit log</Link>, <code>financial_events</code>, and the ops
          runbook <code className="text-ink">docs/ops/stripe-reconciliation-repair.md</code>.
        </p>

        <form
          method="get"
          className="border-ink/10 bg-porcelain/60 flex flex-wrap items-end gap-3 rounded-2xl border p-4"
        >
          <label className="text-ash flex flex-col gap-1 text-xs">
            Stripe PI status
            <select
              name="status"
              defaultValue={statusFilter ?? ''}
              className="border-ink/15 bg-paper text-ink rounded-lg border px-3 py-2 text-sm"
            >
              {STATUS_PRESETS.map((v) => (
                <option key={v || 'all'} value={v}>
                  {v === '' ? 'All statuses' : v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-ash flex flex-col gap-1 text-xs">
            Updated on or after (UTC)
            <input
              type="date"
              name="updatedAfter"
              defaultValue={updatedAfterRaw ?? ''}
              className="border-ink/15 bg-paper text-ink rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="bg-ink text-paper rounded-lg px-4 py-2 text-sm font-medium"
          >
            Apply filter
          </button>
          {statusFilter || updatedAfterRaw ? (
            <Link
              href="/payments"
              className="text-saffron-700 text-sm underline underline-offset-2"
            >
              Clear
            </Link>
          ) : null}
        </form>

        {loadError ? (
          <div className="border-danger/30 bg-danger/5 text-danger rounded-2xl border p-4 text-sm">
            {loadError}
          </div>
        ) : null}

        {reservationRows.length === 0 && !loadError ? (
          <div className="border-ink/10 bg-porcelain rounded-2xl border p-8 text-center">
            <p className="text-ink/70 text-sm">No reservation payment rows yet.</p>
          </div>
        ) : (
          <div className="border-ink/10 overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">
                Reservation payments reconciliation rows with status and Stripe IDs.
              </caption>
              <thead className="bg-porcelain/80 text-ash text-xs tracking-widest uppercase">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Reservation
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    PI
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Total €
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Platform €
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Captured
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-ink/10 divide-y">
                {reservationRows.map((r) => (
                  <tr key={r.id} className="hover:bg-porcelain/40">
                    <td className="px-3 py-2 font-mono text-xs">{r.reservationId}</td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {r.stripePaymentIntentId ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      {(Number(r.amountTotalCents) / 100).toFixed(2)} {r.currency}
                    </td>
                    <td className="px-3 py-2">
                      {(Number(r.amountPlatformFeeCents) / 100).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {r.capturedAt
                        ? r.capturedAt instanceof Date
                          ? r.capturedAt.toISOString()
                          : String(r.capturedAt)
                        : '—'}
                    </td>
                    <td className="text-ash px-3 py-2 text-xs">
                      {r.updatedAt instanceof Date
                        ? r.updatedAt.toISOString()
                        : String(r.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-ink font-serif text-2xl">Trip payouts</h2>
        <p className="text-ink/70 max-w-2xl text-sm">
          Rows from <code>payouts</code> (newest first, cap 200). Compare{' '}
          <code>stripe_transfer_id</code> to Stripe Connect transfers / payouts.
        </p>
        {loadError ? null : payoutRows.length === 0 ? (
          <div className="border-ink/10 bg-porcelain rounded-2xl border p-8 text-center">
            <p className="text-ink/70 text-sm">No payout rows yet.</p>
          </div>
        ) : (
          <div className="border-ink/10 overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">
                Trip payout rows with gross, fee, net, and transfer status.
              </caption>
              <thead className="bg-porcelain/80 text-ash text-xs tracking-widest uppercase">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Trip
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Seller
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Gross
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Fee
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Net
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Transfer id
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-ink/10 divide-y">
                {payoutRows.map((p) => (
                  <tr key={p.id} className="hover:bg-porcelain/40">
                    <td className="px-3 py-2 font-mono text-xs">{p.tripOfferId}</td>
                    <td className="px-3 py-2 font-mono text-xs">{p.sellerId}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2">
                      {p.amountGross} {p.currency}
                    </td>
                    <td className="px-3 py-2">{p.amountFee}</td>
                    <td className="px-3 py-2">{p.amountNet}</td>
                    <td className="px-3 py-2 font-mono text-xs">{p.stripeTransferId ?? '—'}</td>
                    <td className="text-ash px-3 py-2 text-xs">
                      {p.updatedAt instanceof Date
                        ? p.updatedAt.toISOString()
                        : String(p.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
