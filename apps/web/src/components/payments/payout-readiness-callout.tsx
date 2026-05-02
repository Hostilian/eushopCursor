import Link from 'next/link';
import { api } from '../../lib/trpc-server';

/**
 * When Stripe Connect is enabled, nudge sellers posting trips or listings to
 * finish payout setup so trip reservations can create PaymentIntents.
 */
export async function PayoutReadinessCallout() {
  const trpc = await api();
  const caps = await trpc.payments.capabilities();
  if (!caps.stripeConnectEnabled) return null;

  let connect: Awaited<ReturnType<typeof trpc.payments.myConnectAccount>> | null = null;
  try {
    connect = await trpc.payments.myConnectAccount();
  } catch {
    return (
      <div className="border-saffron-600/30 bg-saffron-50/80 text-ink mb-8 rounded-2xl border px-4 py-3 text-sm">
        <p className="font-medium">In-app trip payments are available in this environment.</p>
        <p className="text-ink/80 mt-1">
          Sign in, then open{' '}
          <Link href="/profile" className="text-saffron-800 underline underline-offset-2">
            Profile
          </Link>{' '}
          to complete Stripe Connect payouts before buyers can pay for your trip slots.
        </p>
      </div>
    );
  }

  if (connect?.account?.chargesEnabled) return null;

  return (
    <div className="border-saffron-600/30 bg-saffron-50/80 text-ink mb-8 rounded-2xl border px-4 py-3 text-sm">
      <p className="font-medium">Finish payout setup to accept paid trip reservations.</p>
      <p className="text-ink/80 mt-1">
        Connect your bank details in{' '}
        <Link href="/profile" className="text-saffron-800 underline underline-offset-2">
          Profile → payouts
        </Link>
        . Until charges are enabled, buyers can still reserve, but no card hold is created.
      </p>
    </div>
  );
}
