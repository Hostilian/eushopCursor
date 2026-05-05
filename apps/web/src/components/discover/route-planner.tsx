'use client';

import { ExternalLink, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const CITIES = [
  'Berlin',
  'Paris',
  'Milan',
  'Munich',
  'Madrid',
  'Barcelona',
  'Amsterdam',
  'Brussels',
];

export function RoutePlanner() {
  const [from, setFrom] = useState('Berlin');
  const [to, setTo] = useState('Paris');

  const links = useMemo(() => {
    const googleDirectionsHref = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      from,
    )}&destination=${encodeURIComponent(to)}`;
    const osmDirectionsHref = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(
      `${from};${to}`,
    )}`;
    const ridesLookupHref = `https://www.google.com/search?q=${encodeURIComponent(
      `blablacar ${from} ${to}`,
    )}`;
    return { googleDirectionsHref, osmDirectionsHref, ridesLookupHref };
  }, [from, to]);

  return (
    <section className="border-ink/10 bg-paper mt-8 rounded-3xl border p-5 sm:p-6">
      <p className="text-ash text-xs tracking-widest uppercase">Plan your route</p>
      <h2 className="text-ink mt-1 font-serif text-2xl">Map shortcuts</h2>
      <p className="text-ash mt-2 text-sm">
        Pick two cities and jump directly to route guidance in your preferred map app.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <select
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="border-ink/15 rounded-xl border px-3 py-2 text-sm"
        >
          {CITIES.map((city) => (
            <option key={`from-${city}`} value={city}>
              {city}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          className="border-ink/15 hover:border-ink/40 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs"
          aria-label="Swap route"
        >
          <Shuffle className="h-4 w-4" />
        </button>

        <select
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="border-ink/15 rounded-xl border px-3 py-2 text-sm"
        >
          {CITIES.map((city) => (
            <option key={`to-${city}`} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={links.googleDirectionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="border-ink/15 hover:border-ink/40 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors"
        >
          Google Maps route <ExternalLink className="h-3 w-3" />
        </Link>
        <Link
          href={links.osmDirectionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="border-ink/15 hover:border-ink/40 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors"
        >
          OSM route <ExternalLink className="h-3 w-3" />
        </Link>
        <Link
          href={links.ridesLookupHref}
          target="_blank"
          rel="noopener noreferrer"
          className="border-ink/15 hover:border-ink/40 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors"
        >
          Ride-share lookup <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}
