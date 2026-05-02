'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../../lib/trpc';
import { Button } from '../ui/button';

export type ReservationActionStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'seller-rejected'
  | 'expired'
  | 'disputed'
  | 'refunded';

export function ReservationActions({
  reservationId,
  status,
}: {
  reservationId: string;
  status: ReservationActionStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<'cancel' | 'complete' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancel = trpc.trips.cancelReservation.useMutation();
  const complete = trpc.trips.completeReservation.useMutation();
  const busy = isPending || cancel.isPending || complete.isPending;

  const canCancel = status === 'pending' || status === 'confirmed';
  const canComplete = status === 'confirmed';
  if (!canCancel && !canComplete) return null;

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function runCancel() {
    setError(null);
    try {
      await cancel.mutateAsync({ reservationId });
      setConfirming(null);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel');
    }
  }
  async function runComplete() {
    setError(null);
    try {
      await complete.mutateAsync({ reservationId });
      setConfirming(null);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not mark complete');
    }
  }

  if (confirming) {
    const isCancel = confirming === 'cancel';
    return (
      <div
        className="border-ink/10 rounded-xl border bg-white p-3 text-xs"
        role="alertdialog"
        aria-live="polite"
      >
        <p className="text-ink font-medium">
          {isCancel
            ? 'Cancel this reservation? The slot is released back to the trip.'
            : 'Mark this reservation as completed? Both you and the traveller will see it as done.'}
        </p>
        {error ? <p className="text-danger mt-2">{error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={isCancel ? 'primary' : 'primary'}
            onClick={isCancel ? runCancel : runComplete}
            disabled={busy}
          >
            {busy ? 'Working…' : isCancel ? 'Yes, cancel' : 'Yes, complete'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirming(null)} disabled={busy}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canComplete ? (
        <Button
          type="button"
          variant="primary"
          onClick={() => setConfirming('complete')}
          aria-label="Mark this reservation completed"
          disabled={busy}
        >
          Mark received
        </Button>
      ) : null}
      {canCancel ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setConfirming('cancel')}
          aria-label="Cancel this reservation"
          disabled={busy}
        >
          Cancel
        </Button>
      ) : null}
    </div>
  );
}
