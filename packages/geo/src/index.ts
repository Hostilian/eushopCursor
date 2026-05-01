import geohash from 'ngeohash';

/**
 * Approximate-address policy.
 *
 * We never expose precise lat/lng. Instead we encode the seller's pin to a
 * geohash with PRECISION_DISPLAY characters (~5km cell at precision 5) and
 * deterministically jitter the displayed marker within the cell using the
 * geohash itself as a seed — so the displayed point is stable across views
 * but does not leak the real location.
 */
export const PRECISION_INDEX = 7; // ~150m, used server-side for ordering / recommend
export const PRECISION_DISPLAY = 5; // ~5km cell shown to clients

export interface LatLng {
  lat: number;
  lng: number;
}

export function encode(point: LatLng, precision = PRECISION_INDEX): string {
  return geohash.encode(point.lat, point.lng, precision);
}

export function decode(hash: string): LatLng {
  const { latitude, longitude } = geohash.decode(hash);
  return { lat: latitude, lng: longitude };
}

export function publicCell(hash: string): string {
  return hash.slice(0, PRECISION_DISPLAY);
}

/**
 * Hash a string into a stable [0,1) float — used to jitter approximate pins
 * within their geohash cell deterministically.
 */
function stableRand(seed: string, salt: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = 0; i < salt.length; i++) {
    h ^= salt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * Public coordinate to render on a map. Centred inside the geohash-5 cell with
 * a deterministic jitter, so the same listing always shows in the same spot
 * but no two listings stack perfectly even when they share a cell.
 */
export function publicPoint(hash: string, listingId: string): LatLng {
  const cell = hash.slice(0, PRECISION_DISPLAY);
  const bbox = geohash.decode_bbox(cell);
  const [minLat, minLng, maxLat, maxLng] = bbox;
  const jLat = stableRand(listingId, 'lat') * 0.7 + 0.15;
  const jLng = stableRand(listingId, 'lng') * 0.7 + 0.15;
  return {
    lat: minLat + (maxLat - minLat) * jLat,
    lng: minLng + (maxLng - minLng) * jLng,
  };
}

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Set of all geohashes intersecting (or contained in) a circular search of
 * `radiusKm` around `point` at the given precision. Use the result as a cheap
 * pre-filter when querying Meilisearch facets — PostGIS GIST does the precise
 * filtering server-side.
 */
export function neighborsWithinRadius(
  point: LatLng,
  radiusKm: number,
  precision: number = PRECISION_DISPLAY,
): string[] {
  const center = geohash.encode(point.lat, point.lng, precision);
  const cells = new Set<string>([center]);
  const queue: string[] = [center];
  while (queue.length) {
    const cell = queue.shift()!;
    const neighbours = geohash.neighbors(cell);
    for (const n of neighbours) {
      if (cells.has(n)) continue;
      const { latitude, longitude } = geohash.decode(n);
      if (haversineKm(point, { lat: latitude, lng: longitude }) <= radiusKm + 5) {
        cells.add(n);
        queue.push(n);
      }
    }
  }
  return [...cells];
}

export function bboxOf(hash: string): { sw: LatLng; ne: LatLng } {
  const [minLat, minLng, maxLat, maxLng] = geohash.decode_bbox(hash);
  return { sw: { lat: minLat, lng: minLng }, ne: { lat: maxLat, lng: maxLng } };
}
