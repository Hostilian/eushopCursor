'use client';

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { Button } from '../ui/button';

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
const stripePromise = pk.length > 0 ? loadStripe(pk) : null;

function Inner({ onSuccess, onSkip }: { onSuccess: () => void; onSkip: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error ? (
        <p className="text-danger text-xs" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          disabled={!stripe || !elements || busy}
          onClick={async () => {
            if (!stripe || !elements) return;
            setBusy(true);
            setError(null);
            const { error: err } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: typeof window !== 'undefined' ? window.location.href : '/',
              },
              redirect: 'if_required',
            });
            setBusy(false);
            if (err) {
              setError(err.message ?? 'Payment failed');
              return;
            }
            onSuccess();
          }}
        >
          {busy ? 'Processing…' : 'Authorize hold'}
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}

/**
 * Buyer authorizes the manual-capture PaymentIntent created on reserve (when Stripe + seller Connect are live).
 */
export function ReservationPaymentStep({
  clientSecret,
  onComplete,
}: {
  clientSecret: string;
  onComplete: () => void;
}) {
  if (!stripePromise) {
    return (
      <p className="text-ash text-sm">
        Stripe publishable key is not configured — your reservation is saved; the seller will
        confirm without an online card hold until NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set.
      </p>
    );
  }

  return (
    <div className="border-ink/10 bg-porcelain mt-4 space-y-3 rounded-2xl border p-4">
      <p className="text-ink font-medium">Card authorization</p>
      <p className="text-ash text-xs">
        We place a hold for the slot fee plus Eushop&apos;s small platform fee. Nothing is captured
        until the traveller confirms your booking.
      </p>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <Inner onSuccess={onComplete} onSkip={onComplete} />
      </Elements>
    </div>
  );
}
