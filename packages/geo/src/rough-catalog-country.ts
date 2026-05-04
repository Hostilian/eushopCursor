/** Axis-aligned WGS84 bounds for seed countries in `catalog` (rough, not legal borders). */
type Bbox = { iso2: string; south: number; north: number; west: number; east: number };

const CATALOG_COUNTRY_BBOXES: Bbox[] = [
  { iso2: 'CY', south: 34.5, north: 35.75, west: 32, east: 34.65 },
  { iso2: 'LU', south: 49.44, north: 50.19, west: 5.72, east: 6.53 },
  { iso2: 'MT', south: 35.77, north: 36.32, west: 14.18, east: 14.58 },
  { iso2: 'SI', south: 45.42, north: 46.88, west: 13.38, east: 16.61 },
  { iso2: 'CH', south: 45.82, north: 47.81, west: 5.96, east: 10.49 },
  { iso2: 'AT', south: 46.37, north: 49.02, west: 9.53, east: 17.16 },
  { iso2: 'BE', south: 49.5, north: 51.51, west: 2.52, east: 6.41 },
  { iso2: 'NL', south: 50.75, north: 53.68, west: 3.31, east: 7.23 },
  { iso2: 'DK', south: 54.56, north: 57.75, west: 8.07, east: 15.16 },
  { iso2: 'EE', south: 57.51, north: 59.68, west: 21.77, east: 28.21 },
  { iso2: 'LV', south: 55.67, north: 58.09, west: 20.97, east: 28.24 },
  { iso2: 'LT', south: 53.9, north: 56.45, west: 20.94, east: 26.84 },
  { iso2: 'IE', south: 51.22, north: 55.43, west: -10.48, east: -5.99 },
  { iso2: 'PT', south: 36.95, north: 42.15, west: -9.56, east: -6.19 },
  { iso2: 'HR', south: 42.48, north: 46.55, west: 13.49, east: 19.39 },
  { iso2: 'HU', south: 45.74, north: 48.58, west: 16.11, east: 22.91 },
  { iso2: 'SK', south: 47.73, north: 49.61, west: 16.84, east: 22.56 },
  { iso2: 'CZ', south: 48.55, north: 51.06, west: 12.09, east: 18.86 },
  { iso2: 'BG', south: 41.23, north: 44.22, west: 22.36, east: 28.61 },
  { iso2: 'GR', south: 34.8, north: 41.75, west: 19.37, east: 28.25 },
  { iso2: 'IS', south: 63.28, north: 66.55, west: -24.52, east: -13.49 },
  { iso2: 'NO', south: 57.93, north: 71.3, west: 4.64, east: 31.29 },
  { iso2: 'FI', south: 59.81, north: 70.09, west: 20.55, east: 31.59 },
  { iso2: 'SE', south: 55.34, north: 69.07, west: 11.03, east: 24.17 },
  { iso2: 'RO', south: 43.62, north: 48.27, west: 20.22, east: 29.72 },
  { iso2: 'PL', south: 49, north: 54.84, west: 14.12, east: 24.15 },
  { iso2: 'ES', south: 35.17, north: 43.95, west: -9.39, east: 4.33 },
  { iso2: 'IT', south: 35.49, north: 47.1, west: 6.62, east: 18.52 },
  { iso2: 'FR', south: 41.33, north: 51.09, west: -5.14, east: 9.56 },
  { iso2: 'DE', south: 47.27, north: 55.06, west: 5.87, east: 15.04 },
];

function bboxAreaKm2(b: Bbox): number {
  const latKm = (b.north - b.south) * 111;
  const midLat = (b.south + b.north) / 2;
  const lngKm = (b.east - b.west) * 111 * Math.cos((midLat * Math.PI) / 180);
  return Math.abs(latKm * lngKm);
}

/**
 * Best-effort ISO2 for catalog seed countries from a pin. Uses coarse bounding
 * boxes; when several match, the smallest box wins (e.g. Luxembourg over France).
 * Returns null outside all boxes — callers typically fall back to `EU`.
 */
export function roughCatalogCountryIso2FromLatLng(p: { lat: number; lng: number }): string | null {
  const { lat, lng } = p;
  const hits: Bbox[] = [];
  for (const b of CATALOG_COUNTRY_BBOXES) {
    if (lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east) hits.push(b);
  }
  if (hits.length === 0) return null;
  hits.sort((a, b) => bboxAreaKm2(a) - bboxAreaKm2(b));
  return hits[0]!.iso2;
}
