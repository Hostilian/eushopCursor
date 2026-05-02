'use client';

import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Button } from '../ui/button';

export function RequestForm() {
  const [item, setItem] = useState('');
  const [notes, setNotes] = useState('');
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(25);
  const [maxFee, setMaxFee] = useState<number | ''>(10);
  const [notify, setNotify] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = trpc.requests.create.useMutation();

  if (done) {
    return (
      <div className="rounded-3xl border border-ink/10 bg-porcelain p-12 text-center">
        <p className="font-serif text-3xl text-ink">Request posted.</p>
        <p className="mt-3 text-ink/70">We'll notify you as soon as someone within {radius} km lists it.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
          await create.mutateAsync({
            freeformText: item,
            notes: notes || undefined,
            maxFinderFee: maxFee === '' ? undefined : Number(maxFee),
            currency: 'EUR',
            location: { lat: 52.52, lng: 13.405 },
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
        <input
          required
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Krówki Mleczne — original Wedel"
          className="form-input"
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
        <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-paper px-4">
          <MapPin className="h-4 w-4 text-ash" />
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Munich Glockenbach"
            className="form-input border-0 bg-transparent px-0"
          />
        </div>
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Search radius" hint={`${radius} km from your cell`}>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-saffron-600"
          />
        </Field>
        <Field label="Max finder's fee (EUR)" hint="Sellers will see this when they decide to list.">
          <input
            type="number"
            min={0}
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value === '' ? '' : Number(e.target.value))}
            className="form-input"
          />
        </Field>
      </div>

      <label className="flex items-center gap-3 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
          className="h-4 w-4 rounded accent-saffron-600"
        />
        Notify me the moment a matching listing appears
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-ash">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}
