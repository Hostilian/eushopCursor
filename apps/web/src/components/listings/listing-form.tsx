'use client';

import { Camera, MapPin, X } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Button } from '../ui/button';

const FRESHNESS = [
  { v: 'today', label: 'Best today' },
  { v: '3-days', label: 'Within 3 days' },
  { v: 'week', label: 'This week' },
  { v: 'month', label: 'This month' },
  { v: 'shelf-stable', label: 'Shelf-stable' },
] as const;

type FormState = {
  freeformName: string;
  brandName: string;
  notes: string;
  qty: number;
  finderFee: number;
  freshness: (typeof FRESHNESS)[number]['v'];
  approximateCity: string;
  photos: { url: string }[];
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
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presign = trpc.media.presign.useMutation();
  const create = trpc.listings.create.useMutation();

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const onPhoto = async (file: File) => {
    try {
      const presigned = await presign.mutateAsync({
        filename: file.name,
        contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif',
        byteLength: file.size,
        purpose: 'listing',
      });
      // For real R2 uploads we'd PUT the file here. Dev mode returns a placeholder URL we just record.
      if (!presigned.uploadUrl.startsWith('data:')) {
        await fetch(presigned.uploadUrl, { method: 'PUT', headers: presigned.headers, body: file });
      }
      set('photos', [...state.photos, { url: presigned.publicUrl }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await create.mutateAsync({
        freeformName: state.freeformName || undefined,
        brandName: state.brandName || undefined,
        notes: state.notes || undefined,
        qty: state.qty,
        unit: 'item',
        finderFee: state.finderFee,
        currency: 'EUR',
        freshness: state.freshness,
        photos: state.photos.length ? state.photos : [{ url: 'https://placehold.co/1200x1200/FAF7F2/3B2F22?text=Photo' }],
        approximateCity: state.approximateCity,
        location: { lat: 52.52, lng: 13.405 }, // mocked Berlin until we wire geolocation
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
      <div className="rounded-3xl border border-ink/10 bg-porcelain p-12 text-center">
        <p className="font-serif text-3xl text-ink">Listed.</p>
        <p className="mt-3 text-ink/70">Anyone within your 5 km cell can now find it.</p>
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
      <Field label="What did you bring?" hint="Krówki, Stroopwafels, half a wheel of Manchego…">
        <input
          required
          value={state.freeformName}
          onChange={(e) => set('freeformName', e.target.value)}
          className="form-input"
          placeholder="Wedel Mieszanka Wedlowska tin (300g)"
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

      <Field label="Approximate city / neighbourhood" hint="Buyers see only your 5 km cell, never the exact address.">
        <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-paper px-4">
          <MapPin className="h-4 w-4 text-ash" />
          <input
            required
            value={state.approximateCity}
            onChange={(e) => set('approximateCity', e.target.value)}
            placeholder="Berlin Mitte"
            className="form-input border-0 bg-transparent px-0"
          />
        </div>
      </Field>

      <Field label="Photos" hint="Up to 8. We resize and strip EXIF on upload.">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {state.photos.map((p, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-2xl bg-bone">
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => set('photos', state.photos.filter((_, i) => i !== idx))}
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/80 text-paper opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {state.photos.length < 8 ? (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-paper text-ash hover:border-ink/40 hover:text-ink">
              <Camera className="h-5 w-5" />
              <span className="text-xs">Add photo</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPhoto(f);
                }}
              />
            </label>
          ) : null}
        </div>
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-xs text-ash">
          By posting you confirm you're a private individual sharing personal pantry stock.
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
      <span className="block text-sm font-medium text-ink">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-ash">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}
