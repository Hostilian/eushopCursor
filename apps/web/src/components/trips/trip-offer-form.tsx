'use client';

import { COUNTRIES } from '@eushop/catalog-data';
import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { ProductPicker, type ProductPickerSelection } from '../catalog/product-picker';
import { Button } from '../ui/button';

/**
 * Trip-offer composer. The seller declares an upcoming trip from country A
 * to country B, advertises a number of suitcase slots, and (optionally)
 * commits to specific items they will definitely grab.
 *
 * Geographic capture is intentionally minimal: free-text city plus a
 * "Use my location" pinpoint for the *destination* (where the seller will
 * meet buyers). The origin location is approximated to the country
 * centroid via `/api/geo/centroid` for now; production uses the real
 * coordinates entered through the address autocomplete (a future PR).
 */

const SECONDS_DAY = 24 * 60 * 60;

const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  PL: { lat: 52.0, lng: 19.0 },
  DE: { lat: 51.0, lng: 10.0 },
  FR: { lat: 46.0, lng: 2.0 },
  IT: { lat: 42.5, lng: 12.5 },
  ES: { lat: 40.0, lng: -3.7 },
  PT: { lat: 39.5, lng: -8.0 },
  NL: { lat: 52.0, lng: 5.5 },
  BE: { lat: 50.5, lng: 4.5 },
  AT: { lat: 47.5, lng: 14.5 },
  CZ: { lat: 49.8, lng: 15.5 },
  GR: { lat: 39.0, lng: 22.0 },
  HU: { lat: 47.0, lng: 19.5 },
  IE: { lat: 53.0, lng: -8.0 },
  SE: { lat: 60.0, lng: 18.0 },
  FI: { lat: 64.0, lng: 26.0 },
  EE: { lat: 58.5, lng: 25.0 },
  HR: { lat: 45.0, lng: 16.0 },
  SI: { lat: 46.0, lng: 14.5 },
  RO: { lat: 46.0, lng: 25.0 },
  BG: { lat: 43.0, lng: 25.5 },
  LV: { lat: 57.0, lng: 25.0 },
  LT: { lat: 55.5, lng: 24.0 },
  SK: { lat: 48.7, lng: 19.5 },
  LU: { lat: 49.8, lng: 6.0 },
  MT: { lat: 35.9, lng: 14.4 },
  CY: { lat: 35.0, lng: 33.0 },
  DK: { lat: 56.0, lng: 10.0 },
};

interface IntendedItem {
  foodItemId?: string;
  freeformName: string;
  photo?: string;
}

export function TripOfferForm() {
  const [originIso, setOriginIso] = useState('PL');
  const [originCity, setOriginCity] = useState('');
  const [destinationIso, setDestinationIso] = useState('DE');
  const [destinationCity, setDestinationCity] = useState('');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [departInDays, setDepartInDays] = useState(7);
  const [returnInDays, setReturnInDays] = useState<number | ''>(10);
  const [slotsTotal, setSlotsTotal] = useState(6);
  const [defaultPerSlotFee, setDefaultPerSlotFee] = useState(5);
  const [notes, setNotes] = useState('');
  const [intended, setIntended] = useState<IntendedItem[]>([]);
  const [picker, setPicker] = useState<ProductPickerSelection>({ photos: [] });
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const create = trpc.trips.create.useMutation();

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Browser geolocation unavailable.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDestCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setError(err.message ?? 'Could not read location.');
      },
      { timeout: 8_000 },
    );
  };

  if (done) {
    return (
      <div className="border-ink/10 bg-porcelain rounded-3xl border p-12 text-center">
        <p className="text-ink font-serif text-3xl">Trip posted.</p>
        <p className="text-ink/70 mt-3">
          Buyers in {destinationCity || COUNTRIES.find((c) => c.iso2 === destinationIso)?.name} can
          now reserve a slot. We'll ping you the moment someone books.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        if (!originCity || !destinationCity) {
          setError('Add origin and destination cities so buyers can find your trip.');
          return;
        }
        if (originIso === destinationIso) {
          setError('Origin and destination must be different countries.');
          return;
        }
        const dest = destCoords ?? COUNTRY_CENTROIDS[destinationIso] ?? { lat: 50, lng: 10 };
        const orig = COUNTRY_CENTROIDS[originIso] ?? { lat: 50, lng: 10 };
        const departAt = new Date(Date.now() + departInDays * SECONDS_DAY * 1000);
        const returnAt =
          returnInDays === ''
            ? undefined
            : new Date(Date.now() + Number(returnInDays) * SECONDS_DAY * 1000);
        setSubmitting(true);
        try {
          const trip = await create.mutateAsync({
            originCountryIso2: originIso,
            originCity,
            originLocation: orig,
            destinationCountryIso2: destinationIso,
            destinationCity,
            destinationLocation: dest,
            departAt,
            returnAt,
            slotsTotal,
            defaultPerSlotFee,
            currency: 'EUR',
            notes: notes || undefined,
            intendedItemIds: intended.map((i) => i.foodItemId).filter((id): id is string => !!id),
          });
          setDone(trip.id);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not post trip');
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Flying out of">
          <CountrySelect value={originIso} onChange={setOriginIso} />
          <input
            value={originCity}
            onChange={(e) => setOriginCity(e.target.value)}
            placeholder="Warsaw, Lisbon, Athens…"
            className="form-input mt-2"
            required
          />
        </Field>
        <Field label="Heading to">
          <CountrySelect value={destinationIso} onChange={setDestinationIso} />
          <div className="mt-2 flex gap-2">
            <input
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              placeholder="Munich, Berlin, Stockholm…"
              className="form-input flex-1"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useMyLocation}
              disabled={locating}
            >
              {locating ? '…' : destCoords ? 'Pinned' : 'Pin me'}
            </Button>
          </div>
        </Field>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Field label="Depart in (days)">
          <input
            type="number"
            min={1}
            max={120}
            value={departInDays}
            onChange={(e) => setDepartInDays(Number.parseInt(e.target.value) || 1)}
            className="form-input"
          />
        </Field>
        <Field label="Return in (days, optional)">
          <input
            type="number"
            min={1}
            max={180}
            value={returnInDays}
            onChange={(e) =>
              setReturnInDays(e.target.value === '' ? '' : Number.parseInt(e.target.value) || 1)
            }
            className="form-input"
          />
        </Field>
        <Field label="Suitcase slots" hint="Each slot is one buyer's small request.">
          <input
            type="number"
            min={1}
            max={40}
            value={slotsTotal}
            onChange={(e) => setSlotsTotal(Number.parseInt(e.target.value) || 1)}
            className="form-input"
          />
        </Field>
      </div>

      <Field
        label="Default finder's fee per slot (EUR)"
        hint="Buyers can offer more; this is your floor."
      >
        <input
          type="number"
          min={0}
          max={500}
          value={defaultPerSlotFee}
          onChange={(e) => setDefaultPerSlotFee(Number.parseFloat(e.target.value) || 0)}
          className="form-input"
        />
      </Field>

      <Field
        label="Things you'll definitely grab"
        hint="Optional. Listed buyers see this as a 'guaranteed item' tag."
      >
        <ProductPicker
          value={picker}
          onChange={(next) => {
            setPicker(next);
            if (next.freeformName?.trim()) {
              setIntended((prev) => [
                ...prev,
                {
                  foodItemId: next.foodItemId,
                  freeformName: next.freeformName!.trim(),
                  photo: next.photos[0]?.url,
                },
              ]);
              setPicker({ photos: [] });
            }
          }}
          purpose="food-item-proposal"
        />
        {intended.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {intended.map((it, idx) => (
              <li
                key={idx}
                className="border-ink/10 bg-paper inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
              >
                {it.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.photo} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : null}
                <span>{it.freeformName}</span>
                <button
                  type="button"
                  onClick={() => setIntended((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-ash hover:text-ink"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </Field>

      <Field
        label="Notes for buyers"
        hint="Pickup spots you prefer, customs limits, anything important."
      >
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="form-input min-h-28 resize-y"
          placeholder="Returning Sunday evening; can meet near Hauptbahnhof Mon-Wed."
        />
      </Field>

      {error ? <p className="text-danger text-sm">{error}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-ash text-xs">
          By posting you agree to handle your own customs declarations and food-safety obligations.
          Eushop's take rate appears to buyers as a small platform fee on top of your finder's fee.
        </p>
        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? 'Posting…' : 'Publish trip'}
        </Button>
      </div>

      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          background: var(--color-paper);
          border: 1px solid color-mix(in oklch, var(--color-ink) 10%, transparent);
          border-radius: 1rem;
          padding: 0.75rem 1rem;
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

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="form-input">
      {COUNTRIES.map((c) => (
        <option key={c.iso2} value={c.iso2}>
          {c.flagEmoji} {c.name}
        </option>
      ))}
    </select>
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
    <div>
      <p className="text-ink text-sm font-medium">{label}</p>
      {hint ? <p className="text-ash mt-0.5 text-xs">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}
