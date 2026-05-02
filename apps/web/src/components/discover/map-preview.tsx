'use client';

import { MapPin } from 'lucide-react';
import { useMemo } from 'react';

/**
 * Privacy-preserving map preview: shows an OSM embed centred on the user's
 * approximate area without ever sending precise coordinates to a third party
 * from the server — the parent passes only a coarse centre (e.g. city centre).
 */
export function MapPreview({
  label,
  lat,
  lng,
  zoom = 11,
}: {
  label: string;
  lat: number;
  lng: number;
  zoom?: number;
}) {
  const src = useMemo(() => {
    const bbox = 0.08;
    const left = lng - bbox;
    const bottom = lat - bbox * 0.7;
    const right = lng + bbox;
    const top = lat + bbox * 0.7;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik`;
  }, [lat, lng]);

  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-porcelain shadow-sm">
      <div className="flex items-center gap-2 border-b border-ink/10 px-4 py-3 text-xs text-ash">
        <MapPin className="h-3.5 w-3.5" />
        <span>Approximate area · {label}</span>
      </div>
      <iframe title="Map preview" className="h-72 w-full grayscale contrast-125" loading="lazy" src={src} />
      <p className="border-t border-ink/10 px-4 py-2 text-[10px] leading-relaxed text-ash">
        Pins on Eushop are never exact addresses — they jitter inside a ~5 km cell for safety.
      </p>
    </div>
  );
}
