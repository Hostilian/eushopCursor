'use client';

import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

/**
 * Stripe Connect onboarding for sellers who post trips (charges must be enabled
 * before buyers get a card hold on reserve).
 */
export function ProfilePayoutsCard({
  countryIso2,
}: {
  /** From profile — required to anchor the Connect account country. */
  countryIso2: string | null | undefined;
}) {
  const caps = trpc.payments.capabilities.useQuery();
  const account = trpc.payments.myConnectAccount.useQuery();
  const start = trpc.payments.startConnectOnboarding.useMutation();
  const refresh = trpc.payments.refreshConnectAccount.useMutation();
  const [error, setError] = useState<string | null>(null);

  if (!caps.data?.stripeConnectEnabled) {
    return (
      <div className="border-ink/10 bg-porcelain rounded-3xl border p-6">
        <p className="text-ash text-xs tracking-widest uppercase">Payouts</p>
        <p className="text-ink/80 mt-3 text-sm">
          Card holds for trip reservations are not active in this environment (Stripe keys unset).
        </p>
      </div>
    );
  }

  const row = account.data?.account;
  const status = row?.status ?? 'none';
  const canOnboard = Boolean(countryIso2 && countryIso2.length === 2);

  return (
    <div className="border-ink/10 bg-porcelain rounded-3xl border p-6">
      <p className="text-ash text-xs tracking-widest uppercase">Payouts · Stripe Connect</p>
      <p className="text-ink/80 mt-3 text-sm">
        Connect your bank so buyers can authorize the slot fee + platform fee when they reserve a
        trip you posted.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant={status === 'active' ? 'accent' : 'soft'}>{status}</Badge>
        {row?.chargesEnabled ? (
          <Badge variant="accent">Charges on</Badge>
        ) : (
          <Badge variant="outline">Charges off</Badge>
        )}
      </div>
      {error ? (
        <p className="text-danger mt-3 text-xs" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!canOnboard || start.isPending}
          onClick={() => {
            setError(null);
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            if (!countryIso2) {
              setError(
                'Set your home or current country first so Stripe knows which account rules apply.',
              );
              return;
            }
            start.mutate(
              {
                countryIso2: countryIso2.toUpperCase(),
                returnUrl: `${origin}/profile`,
                refreshUrl: `${origin}/profile`,
              },
              {
                onSuccess: (r) => {
                  globalThis.location.href = r.url;
                },
                onError: (e) => setError(e.message),
              },
            );
          }}
        >
          {row ? 'Continue Stripe onboarding' : 'Set up payouts'}
        </Button>
        {row ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={refresh.isPending}
            onClick={() => {
              setError(null);
              refresh.mutate(undefined, {
                onSuccess: () => void account.refetch(),
                onError: (e) => setError(e.message),
              });
            }}
          >
            Refresh status from Stripe
          </Button>
        ) : null}
      </div>
    </div>
  );
}
