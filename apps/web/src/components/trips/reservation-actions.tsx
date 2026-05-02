'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('reservationActions');
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
      setError(e instanceof Error ? e.message : t('errorGeneric'));
    }
  }
  async function runComplete() {
    setError(null);
    try {
      await complete.mutateAsync({ reservationId });
      setConfirming(null);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorGeneric'));
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
          {isCancel ? t('confirmCancel') : t('confirmComplete')}
        </p>
        {error ? <p className="text-danger mt-2">{error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            onClick={isCancel ? runCancel : runComplete}
            disabled={busy}
          >
            {isCancel
              ? busy
                ? t('cancelling')
                : t('cancel')
              : busy
                ? t('completing')
                : t('complete')}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirming(null)} disabled={busy}>
            {t('cancel')}
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
          aria-label={t('complete')}
          disabled={busy}
        >
          {t('complete')}
        </Button>
      ) : null}
      {canCancel ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setConfirming('cancel')}
          aria-label={t('cancel')}
          disabled={busy}
        >
          {t('cancel')}
        </Button>
      ) : null}
    </div>
  );
}
