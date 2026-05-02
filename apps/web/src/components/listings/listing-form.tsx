'use client';

import { CATEGORIES } from '@eushop/catalog-data';
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { ProductPicker, type ProductPickerSelection } from '../catalog/product-picker';
import { Button } from '../ui/button';

const FRESHNESS = [
  { v: 'today', label: 'Best today' },
  { v: '3-days', label: 'Within 3 days' },
  { v: 'week', label: 'This week' },
  { v: 'month', label: 'This month' },
  { v: 'shelf-stable', label: 'Shelf-stable' },
] as const;

type FormState = {
  foodItemId?: string;
  freeformName: string;
  brandName: string;
  notes: string;
  qty: number;
  finderFee: number;
  freshness: (typeof FRESHNESS)[number]['v'];
  approximateCity: string;
  photos: { url: string }[];
  location?: { lat: number; lng: number };
};

export function ListingForm() {
  const [state, setState] = useState<FormState>({
    freeformName: '',
    brandName: '',
    notes: '',
    qty: 1,
    finderFee: 5,
    freshness: 'week',
    approximateCity: '',
    photos: [],
  });
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = trpc.listings.create.useMutation();

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const pickerValue: ProductPickerSelection = {
    foodItemId: state.foodItemId,
    freeformName: state.freeformName,
    photos: state.photos,
  };

  const onPickerChange = (next: ProductPickerSelection) =>
    setState((s) => ({
      ...s,
      foodItemId: next.foodItemId,
      freeformName: next.freeformName ?? '',
      photos: next.photos,
    }));

  const submit = async () => {
    setError(null);
    if (state.photos.length === 0) {
      setError('Add at least one photo so buyers can recognise the product.');
      return;
    }
    if (!state.location) {
      setError(
        'We need your approximate location (a 5 km cell) to show this listing to neighbours. Tap "Use my location" or pick a city.',
      );
      return;
    }
    setSubmitting(true);
    try {
      await create.mutateAsync({
        foodItemId: state.foodItemId,
        freeformName: state.freeformName || undefined,
        brandName: state.brandName || undefined,
        notes: state.notes || undefined,
        qty: state.qty,
        unit: 'item',
        finderFee: state.finderFee,
        currency: 'EUR',
        freshness: state.freshness,
        photos: state.photos,
        approximateCity: state.approximateCity,
        location: state.location,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="border-ink/10 bg-porcelain rounded-3xl border p-12 text-center">
        <p className="text-ink font-serif text-3xl">Listed.</p>
        <p className="text-ink/70 mt-3">Anyone within your 5 km cell can now find it.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-8"
    >
      <Field
        label="What did you bring?"
        hint="Search the catalog and pick a product photo, or upload your own."
      >
        <ProductPicker
          value={pickerValue}
          onChange={onPickerChange}
          purpose="listing"
          proposeCategoryOptions={CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </Field>

      <Field label="Brand (optional)">
        <input
          value={state.brandName}
          onChange={(e) => set('brandName', e.target.value)}
          className="form-input"
          placeholder="Wedel"
        />
      </Field>

      <Field label="Notes" hint="Freshness, packaging, anything a buyer should know.">
        <textarea
          value={state.notes}
          onChange={(e) => set('notes', e.target.value)}
          className="form-input min-h-28 resize-y"
          rows={4}
          placeholder="Bought yesterday at Empik in Warsaw. Sealed tin. Will keep till April."
        />
      </Field>

      <div className="grid gap-6 md:grid-cols-3">
        <Field label="Quantity">
          <input
            type="number"
            min={1}
            max={99}
            value={state.qty}
            onChange={(e) => set('qty', Number.parseInt(e.target.value) || 1)}
            className="form-input"
          />
        </Field>
        <Field label="Finder's fee (EUR)" hint="Settle in person, off-platform.">
          <input
            type="number"
            min={0}
            max={999}
            value={state.finderFee}
            onChange={(e) => set('finderFee', Number.parseFloat(e.target.value) || 0)}
            className="form-input"
          />
        </Field>
        <Field label="Freshness">
          <select
            value={state.freshness}
            onChange={(e) => set('freshness', e.target.value as FormState['freshness'])}
            className="form-input"
          >
            {FRESHNESS.map((f) => (
              <option key={f.v} value={f.v}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Approximate city / neighbourhood"
        hint="Buyers see only your 5 km cell, never the exact address."
      >
        <div className="border-ink/10 bg-paper flex items-center gap-2 rounded-2xl border px-4">
          <MapPin className="text-ash h-4 w-4" />
          <input
            required
            value={state.approximateCity}
            onChange={(e) => set('approximateCity', e.target.value)}
            placeholder="Berlin Mitte"
            className="form-input border-0 bg-transparent px-0"
          />
          <button
            type="button"
            disabled={locating}
            onClick={() => {
              if (!('geolocation' in navigator)) {
                setError('Your browser does not support geolocation. Type a city instead.');
                return;
              }
              setLocating(true);
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  set('location', { lat: pos.coords.latitude, lng: pos.coords.longitude });
                  setLocating(false);
                },
                (err) => {
                  setLocating(false);
                  setError(err.message || 'Could not read your location.');
                },
                { enableHighAccuracy: false, timeout: 8_000 },
              );
            }}
            className="text-ash hover:text-ink shrink-0 text-xs underline underline-offset-2"
          >
            {locating ? 'Locating…' : state.location ? '✓ Located' : 'Use my location'}
          </button>
        </div>
      </Field>

      {error ? <p className="text-danger text-sm">{error}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-ash text-xs">
          By posting you confirm you're a private individual sharing personal items from home.
        </p>
        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? 'Posting…' : 'Publish listing'}
        </Button>
      </div>

      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          background: var(--color-paper);
          border: 1px solid color-mix(in oklch, var(--color-ink) 10%, transparent);
          border-radius: 1rem;
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
          color: var(--color-ink);
          transition: border-color 180ms ease;
        }
        :global(.form-input:focus) {
          outline: none;
          border-color: var(--color-saffron-500);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-ink block text-sm font-medium">{label}</span>
      {hint ? <span className="text-ash mt-0.5 block text-xs">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}
