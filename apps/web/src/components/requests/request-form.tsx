'use client';

import { CATEGORIES } from '@eushop/catalog';
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { ProductPicker, type ProductPickerSelection } from '../catalog/product-picker';
import { Button } from '../ui/button';

export function RequestForm() {
  const [picker, setPicker] = useState<ProductPickerSelection>({ photos: [] });
  const [notes, setNotes] = useState('');
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(25);
  const [maxFee, setMaxFee] = useState<number | ''>(10);
  const [notify, setNotify] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = trpc.requests.create.useMutation();

  if (done) {
    return (
      <div className="border-ink/10 bg-porcelain rounded-3xl border p-12 text-center">
        <p className="text-ink font-serif text-3xl">Request posted.</p>
        <p className="text-ink/70 mt-3">
          We&apos;ll notify you as soon as someone within {radius} km lists it — or posts a trip
          from the right country.
        </p>
      </div>
    );
  }

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Your browser does not support geolocation.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setError(err.message || 'Could not read your location.');
      },
      { enableHighAccuracy: false, timeout: 8_000 },
    );
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        if (!picker.freeformName?.trim()) {
          setError('Tell us what you’re looking for.');
          return;
        }
        if (!coords) {
          setError(
            'We need your approximate location so we can search nearby. Tap "Use my location".',
          );
          return;
        }
        setSubmitting(true);
        try {
          await create.mutateAsync({
            foodItemId: picker.foodItemId,
            freeformText: picker.freeformName.trim(),
            notes: notes || undefined,
            maxFinderFee: maxFee === '' ? undefined : Number(maxFee),
            currency: 'EUR',
            location: coords,
            approximateCity: city,
            radiusKm: radius,
            notifyOnMatch: notify,
          });
          setDone(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not post request');
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-8"
    >
      <Field label="What are you looking for?">
        <ProductPicker
          value={picker}
          onChange={setPicker}
          purpose="food-item-proposal"
          proposeCategoryOptions={CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </Field>

      <Field label="Anything specific?" hint="Brand, size, allergens, packaging.">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Need a sealed tin, not loose. Vegan-friendly variant if possible."
          className="form-input min-h-28 resize-y"
          rows={4}
        />
      </Field>

      <Field label="Your approximate city / district">
        <div className="border-ink/10 bg-paper flex items-center gap-2 rounded-2xl border px-4">
          <MapPin className="text-ash h-4 w-4" />
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Munich Glockenbach"
            className="form-input border-0 bg-transparent px-0"
          />
          <button
            type="button"
            disabled={locating}
            onClick={useMyLocation}
            className="text-ash hover:text-ink shrink-0 text-xs underline underline-offset-2"
          >
            {locating ? 'Locating…' : coords ? '✓ Located' : 'Use my location'}
          </button>
        </div>
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Search radius" hint={`${radius} km from you`}>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="accent-saffron-600 w-full"
          />
        </Field>
        <Field
          label="Max finder's fee (EUR)"
          hint="Sellers will see this when they decide to list."
        >
          <input
            type="number"
            min={0}
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value === '' ? '' : Number(e.target.value))}
            className="form-input"
          />
        </Field>
      </div>

      <label className="text-ink/80 flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
          className="accent-saffron-600 h-4 w-4 rounded"
        />
        Notify me the moment a matching listing or trip appears
      </label>

      {error ? <p className="text-danger text-sm">{error}</p> : null}

      <div className="flex items-center justify-end">
        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? 'Posting…' : 'Post request'}
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
