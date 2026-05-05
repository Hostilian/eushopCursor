'use client';

import { ExternalLink, Route } from 'lucide-react';
import Link from 'next/link';

interface Corridor {
  id: string;
  from: string;
  to: string;
}

const CORRIDORS: Corridor[] = [
  { id: 'berlin-paris', from: 'Berlin', to: 'Paris' },
  { id: 'milan-munich', from: 'Milan', to: 'Munich' },
  { id: 'madrid-barcelona', from: 'Madrid', to: 'Barcelona' },
  { id: 'amsterdam-brussels', from: 'Amsterdam', to: 'Brussels' },
];

export function TravelCorridors() {
  return (
    <section className="border-ink/10 bg-porcelain mt-8 rounded-3xl border p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-ash text-xs tracking-widest uppercase">Travel routes</p>
          <h2 className="text-ink mt-1 font-serif text-2xl">Popular corridors</h2>
        </div>
        <Route className="text-ink/50 h-5 w-5" />
      </div>
      <p className="text-ash mt-2 text-sm">
        Open map directions quickly and check ride-share options for frequent routes.
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {CORRIDORS.map((corridor) => {
          const route = `${corridor.from}, Europe to ${corridor.to}, Europe`;
          const googleDirectionsHref = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
            corridor.from,
          )}&destination=${encodeURIComponent(corridor.to)}`;
          const osmDirectionsHref = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(
            `${corridor.from};${corridor.to}`,
          )}`;
          const ridesLookupHref = `https://www.google.com/search?q=${encodeURIComponent(
            `blablacar ${corridor.from} ${corridor.to}`,
          )}`;

          return (
            <li key={corridor.id} className="border-ink/10 bg-paper rounded-2xl border p-4">
              <p className="text-ink text-sm font-semibold">{route}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={googleDirectionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-ink/15 hover:border-ink/40 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors"
                >
                  Google route <ExternalLink className="h-3 w-3" />
                </Link>
                <Link
                  href={osmDirectionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-ink/15 hover:border-ink/40 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors"
                >
                  OSM route <ExternalLink className="h-3 w-3" />
                </Link>
                <Link
                  href={ridesLookupHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-ink/15 hover:border-ink/40 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors"
                >
                  Ride-share lookup <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
