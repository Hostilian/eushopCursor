'use client';

import { useId, useState } from 'react';
import { calculatePlatformFeeCents } from '@eushop/validators';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { trpc } from '../../lib/trpc';
import { ProductPicker, type ProductPickerSelection } from '../catalog/product-picker';
import { Button } from '../ui/button';
import { ReservationPaymentStep } from './reservation-payment-step';

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
  const t = useTranslations('reservationForm');
  const qtyId = useId();
  const feeId = useId();
  const [picker, setPicker] = useState<ProductPickerSelection>({ photos: [] });
  const [qty, setQty] = useState(1);
  const [agreedFee, setAgreedFee] = useState(defaultFee);
  const [stage, setStage] = useState<'compose' | 'confirm' | 'pay' | 'done'>('compose');
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reserve = trpc.trips.reserve.useMutation();
  const submitting = reserve.isPending;

  if (stage === 'done') {
    return (
      <div role="status">
        <p className="text-ink font-serif text-2xl">{t('successTitle')}</p>
        <p className="text-ash mt-2 text-sm">{t('successBody')}</p>
      </div>
    );
  }

  const platformFeeCents = calculatePlatformFeeCents(Math.round(agreedFee * 100));
  const platformFee = (platformFeeCents / 100).toFixed(2);

  function validate(): string | null {
    if (!picker.freeformName?.trim()) return t('freeformHint');
    if (qty < 1 || qty > 20) return t('qtyLabel');
    if (!Number.isFinite(agreedFee) || agreedFee < 0)
      return t('errorMinFee', { floor: defaultFee.toFixed(2) });
    if (agreedFee + 1e-6 < defaultFee) {
      return t('errorMinFee', { floor: defaultFee.toFixed(2) });
    }
    return null;
  }

  async function handleConfirm() {
    setError(null);
    try {
      const result = await reserve.mutateAsync({
        tripOfferId,
        foodItemId: picker.foodItemId,
        freeformText: picker.freeformName!.trim(),
        qty,
        agreedFinderFee: agreedFee,
      });
      const secret =
        result && typeof result === 'object' && 'paymentClientSecret' in result
          ? (result as { paymentClientSecret?: string | null }).paymentClientSecret
          : null;
      if (secret) {
        setPaymentClientSecret(secret);
        setStage('pay');
      } else {
        setStage('done');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'));
    }
  }

  if (stage === 'pay' && paymentClientSecret) {
    return (
      <div className="space-y-4">
        <h3 className="text-ink font-serif text-xl">{t('successTitle')}</h3>
        <p className="text-ink/80 text-sm">{t('successBody')}</p>
        <ReservationPaymentStep
          clientSecret={paymentClientSecret}
          onComplete={() => setStage('done')}
        />
      </div>
    );
  }

  if (stage === 'confirm') {
    return (
      <div className="space-y-4" role="dialog" aria-labelledby="reserve-confirm-heading">
        <h3 id="reserve-confirm-heading" className="text-ink font-serif text-xl">
          {t('confirmTitle')}
        </h3>
        <p className="text-ink/80 text-sm">
          {t('confirmBody', {
            what: `${qty}× ${picker.freeformName ?? ''}`.trim(),
            fee: agreedFee.toFixed(2),
          })}
        </p>
        <ul className="text-ash space-y-1 text-xs">
          <li>{t('feeLabel', { value: agreedFee.toFixed(2) }) || `€${agreedFee.toFixed(2)}`}</li>
          <li>€{platformFee}</li>
        </ul>
        {error ? (
          <p role="alert" className="text-danger text-xs">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" disabled={submitting} onClick={handleConfirm}>
            {submitting ? t('submitting') : t('confirmCta')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={() => setStage('compose')}
          >
            {t('cancel')}
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
        <p className="text-ink text-sm font-medium">{t('freeformLabel')}</p>
        <ProductPicker value={picker} onChange={setPicker} purpose="food-item-proposal" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="block">
          <label htmlFor={qtyId} className="text-ink text-sm font-medium">
            {t('qtyLabel')}
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
            {t('feeLabel')}
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
            {t('feeHint', { floor: defaultFee.toFixed(2) })}
          </p>
        </div>
      </div>

      <div className="border-ink/10 rounded-2xl border bg-white p-4 text-xs">
        <div className="flex items-center justify-between">
          <span>{t('feeLabel')}</span>
          <span>€{agreedFee.toFixed(2)}</span>
        </div>
        <div className="text-ash mt-1 flex items-center justify-between">
          <span>{t('feeHint', { floor: defaultFee.toFixed(2) })}</span>
          <span>€{platformFee}</span>
        </div>
        <div className="text-ink border-ink/10 mt-2 flex items-center justify-between border-t pt-2 font-medium">
          <span>{destinationCity}</span>
          <span>€{(agreedFee + Number(platformFee)).toFixed(2)}</span>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}

      <p className="text-ash text-xs leading-relaxed">
        {t('tripPaymentsFinePrint')}{' '}
        <Link href="/terms#trip-payments" className="text-saffron-700 underline">
          {t('tripPaymentsTermsCta')}
        </Link>
      </p>

      <Button type="submit" disabled={submitting} variant="primary" className="w-full">
        {submitting ? t('submitting') : t('submit')}
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
