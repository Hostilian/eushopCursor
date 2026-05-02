'use client';

import { useId, useState } from 'react';
import { calculatePlatformFeeCents } from '@eushop/validators';
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
  const qtyId = useId();
  const feeId = useId();
  const [picker, setPicker] = useState<ProductPickerSelection>({ photos: [] });
  const [qty, setQty] = useState(1);
  const [agreedFee, setAgreedFee] = useState(defaultFee);
  const [stage, setStage] = useState<'compose' | 'confirm' | 'done'>('compose');
  const [error, setError] = useState<string | null>(null);

  const reserve = trpc.trips.reserve.useMutation();
  const submitting = reserve.isPending;

  if (stage === 'done') {
    return (
      <div role="status">
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

  const platformFeeCents = calculatePlatformFeeCents(Math.round(agreedFee * 100));
  const platformFee = (platformFeeCents / 100).toFixed(2);

  function validate(): string | null {
    if (!picker.freeformName?.trim()) return 'Tell the traveller what to grab.';
    if (qty < 1 || qty > 20) return 'Quantity must be between 1 and 20.';
    if (!Number.isFinite(agreedFee) || agreedFee < 0) return 'Offer must be a positive number.';
    if (agreedFee + 1e-6 < defaultFee) {
      return `Minimum offer for this trip is €${defaultFee.toFixed(2)}.`;
    }
    return null;
  }

  async function handleConfirm() {
    setError(null);
    try {
      await reserve.mutateAsync({
        tripOfferId,
        foodItemId: picker.foodItemId,
        freeformText: picker.freeformName!.trim(),
        qty,
        agreedFinderFee: agreedFee,
      });
      setStage('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reserve');
    }
  }

  if (stage === 'confirm') {
    return (
      <div className="space-y-4" role="dialog" aria-labelledby="reserve-confirm-heading">
        <h3 id="reserve-confirm-heading" className="text-ink font-serif text-xl">
          Confirm reservation
        </h3>
        <ul className="text-ink/80 space-y-1 text-sm">
          <li>
            <strong>{qty}×</strong> {picker.freeformName}
          </li>
          <li>Offer: €{agreedFee.toFixed(2)}</li>
          <li>Platform fee: €{platformFee}</li>
        </ul>
        <p className="text-ash text-xs">
          You'll meet the traveller at the {destinationCity} handoff. Eushop only collects the
          platform fee — and only after both sides mark the reservation completed.
        </p>
        {error ? (
          <p role="alert" className="text-danger text-xs">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" disabled={submitting} onClick={handleConfirm}>
            {submitting ? 'Reserving…' : 'Confirm and reserve'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={() => setStage('compose')}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = validate();
        if (v) {
          setError(v);
          return;
        }
        setError(null);
        setStage('confirm');
      }}
      className="space-y-5"
    >
      <div>
        <p className="text-ink text-sm font-medium">What should they grab?</p>
        <ProductPicker value={picker} onChange={setPicker} purpose="food-item-proposal" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="block">
          <label htmlFor={qtyId} className="text-ink text-sm font-medium">
            Quantity
          </label>
          <input
            id={qtyId}
            type="number"
            min={1}
            max={20}
            value={qty}
            onChange={(e) => setQty(Number.parseInt(e.target.value) || 1)}
            className="form-input mt-1 w-full"
          />
        </div>
        <div className="block">
          <label htmlFor={feeId} className="text-ink text-sm font-medium">
            Your offer (EUR)
          </label>
          <input
            id={feeId}
            type="number"
            min={0}
            step="0.5"
            value={agreedFee}
            onChange={(e) => setAgreedFee(Number.parseFloat(e.target.value) || 0)}
            aria-describedby={`${feeId}-hint`}
            className="form-input mt-1 w-full"
          />
          <p id={`${feeId}-hint`} className="text-ash mt-1 text-[10px]">
            Minimum €{defaultFee.toFixed(2)} for this trip.
          </p>
        </div>
      </div>

      <div className="border-ink/10 rounded-2xl border bg-white p-4 text-xs">
        <div className="flex items-center justify-between">
          <span>Agreed fee to traveller</span>
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

      {error ? (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting} variant="primary" className="w-full">
        Review reservation
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
