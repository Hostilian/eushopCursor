'use client';

import { useState } from 'react';
import { PLATFORM_FEE_FLOOR_CENTS, PLATFORM_FEE_RATE } from '@eushop/validators';
import { trpc } from '../../lib/trpc';
import { ProductPicker, type ProductPickerSelection } from '../catalog/product-picker';
import { Button } from '../ui/button';

/**
 * Buyer-side composer that books a slot on a specific trip. Mirrors the
 * server-side `calculatePlatformFeeCents` so the buyer always sees the
 * exact amount Eushop will collect.
 */
export function ReservationForm({
  tripOfferId,
  defaultFee,
  destinationCity,
}: {
  tripOfferId: string;
  defaultFee: number;
  destinationCity: string;
}) {
  const [picker, setPicker] = useState<ProductPickerSelection>({ photos: [] });
  const [qty, setQty] = useState(1);
  const [agreedFee, setAgreedFee] = useState(defaultFee);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reserve = trpc.trips.reserve.useMutation();

  if (done) {
    return (
      <div>
        <p className="text-ink font-serif text-2xl">Slot reserved.</p>
        <p className="text-ash mt-2 text-sm">
          The traveller has been notified. You'll see the booking on your{' '}
          <a href="/reservations" className="underline">
            reservations page
          </a>{' '}
          and we'll let you know once they confirm.
        </p>
      </div>
    );
  }

  const platformFeeCents = Math.max(
    PLATFORM_FEE_FLOOR_CENTS,
    Math.round(agreedFee * 100 * PLATFORM_FEE_RATE),
  );
  const platformFee = (platformFeeCents / 100).toFixed(2);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        if (!picker.freeformName?.trim()) {
          setError('Tell the traveller what to grab.');
          return;
        }
        setSubmitting(true);
        try {
          await reserve.mutateAsync({
            tripOfferId,
            foodItemId: picker.foodItemId,
            freeformText: picker.freeformName.trim(),
            qty,
            agreedFinderFee: agreedFee,
          });
          setDone(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not reserve');
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-5"
    >
      <div>
        <p className="text-ink text-sm font-medium">What should they grab?</p>
        <ProductPicker value={picker} onChange={setPicker} purpose="food-item-proposal" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-ink text-sm font-medium">Quantity</span>
          <input
            type="number"
            min={1}
            max={20}
            value={qty}
            onChange={(e) => setQty(Number.parseInt(e.target.value) || 1)}
            className="form-input mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-ink text-sm font-medium">Your offer (EUR)</span>
          <input
            type="number"
            min={0}
            value={agreedFee}
            onChange={(e) => setAgreedFee(Number.parseFloat(e.target.value) || 0)}
            className="form-input mt-1 w-full"
          />
        </label>
      </div>

      <div className="border-ink/10 rounded-2xl border bg-white p-4 text-xs">
        <div className="flex items-center justify-between">
          <span>Finder's fee to traveller</span>
          <span>€{agreedFee.toFixed(2)}</span>
        </div>
        <div className="text-ash mt-1 flex items-center justify-between">
          <span>Eushop platform fee</span>
          <span>€{platformFee}</span>
        </div>
        <div className="text-ink border-ink/10 mt-2 flex items-center justify-between border-t pt-2 font-medium">
          <span>Total reserved</span>
          <span>€{(agreedFee + Number(platformFee)).toFixed(2)}</span>
        </div>
        <p className="text-ash mt-2 text-[10px]">
          You'll settle with the traveller in person at the {destinationCity} handoff. We collect
          only the platform fee, and only after the trip is marked completed.
        </p>
      </div>

      {error ? <p className="text-danger text-xs">{error}</p> : null}

      <Button type="submit" disabled={submitting} variant="primary" className="w-full">
        {submitting ? 'Reserving…' : 'Reserve this slot'}
      </Button>

      <style jsx>{`
        :global(.form-input) {
          background: var(--color-paper);
          border: 1px solid color-mix(in oklch, var(--color-ink) 10%, transparent);
          border-radius: 1rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--color-ink);
        }
        :global(.form-input:focus) {
          outline: none;
          border-color: var(--color-saffron-500);
        }
      `}</style>
    </form>
  );
}
