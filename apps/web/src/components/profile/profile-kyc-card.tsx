'use client';

import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

/** Identity check for the verified bringer badge (Veriff / Onfido / manual in dev). */
export function ProfileKycCard({ hasVerifiedBadge }: { hasVerifiedBadge: boolean }) {
  const status = trpc.trust.myKycStatus.useQuery();
  const start = trpc.trust.startKyc.useMutation();
  const [error, setError] = useState<string | null>(null);

  if (hasVerifiedBadge) {
    return (
      <div className="border-ink/10 bg-porcelain rounded-3xl border p-6">
        <p className="text-ash text-xs tracking-widest uppercase">Verified bringer</p>
        <p className="text-ink mt-3 text-sm">Your profile shows the verified bringer badge.</p>
      </div>
    );
  }

  const kyc = status.data;
  const kycLabel = kyc ? `${kyc.provider} · ${kyc.status}` : 'Not started';

  return (
    <div className="border-ink/10 bg-porcelain rounded-3xl border p-6">
      <p className="text-ash text-xs tracking-widest uppercase">Identity · Verified bringer</p>
      <p className="text-ink/80 mt-3 text-sm">
        Complete a short ID check so neighbours know passport-country attestation was reviewed.
        Admins approve manual sessions in development.
      </p>
      <div className="mt-3">
        <Badge variant="soft">{kycLabel}</Badge>
      </div>
      {error ? (
        <p className="text-danger mt-3 text-xs" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        className="mt-4"
        size="sm"
        disabled={start.isPending || kyc?.status === 'pending'}
        onClick={() => {
          setError(null);
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          start.mutate(
            { callbackUrl: `${origin}/profile` },
            {
              onSuccess: (r) => {
                if ('url' in r && typeof r.url === 'string') {
                  globalThis.location.href = r.url;
                } else {
                  void status.refetch();
                }
              },
              onError: (e) => setError(e.message),
            },
          );
        }}
      >
        {kyc?.status === 'pending' ? 'Awaiting review' : 'Start verification'}
      </Button>
    </div>
  );
}
