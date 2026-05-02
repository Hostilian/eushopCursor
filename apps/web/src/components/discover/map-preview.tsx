'use client';

import { MapPin } from 'lucide-react';
import { useMemo } from 'react';

/**
 * Privacy-preserving map preview: shows an OSM embed centred on the user's
 * approximate area without ever sending precise coordinates to a third party
 * from the server — the parent passes only a coarse centre (e.g. city centre).
 */
export function MapPreview({ label, lat, lng }: { label: string; lat: number; lng: number }) {
  const src = useMemo(() => {
    const bbox = 0.08;
    const left = lng - bbox;
    const bottom = lat - bbox * 0.7;
    const right = lng + bbox;
    const top = lat + bbox * 0.7;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik`;
  }, [lat, lng]);

  return (
    <div className="border-ink/10 bg-porcelain overflow-hidden rounded-3xl border shadow-sm">
      <div className="border-ink/10 text-ash flex items-center gap-2 border-b px-4 py-3 text-xs">
        <MapPin className="h-3.5 w-3.5" />
        <span>Approximate area · {label}</span>
      </div>
      <iframe
        title="Map preview"
        className="h-72 w-full contrast-125 grayscale"
        loading="lazy"
        src={src}
      />
      <p className="border-ink/10 text-ash border-t px-4 py-2 text-[10px] leading-relaxed">
        Pins on Eushop are never exact addresses — they jitter inside an approximate area for
        safety.
      </p>
    </div>
  );
}
