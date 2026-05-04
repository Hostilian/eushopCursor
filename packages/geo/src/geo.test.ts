import { describe, expect, it } from 'vitest';
import {
  decode,
  encode,
  neighborsWithinRadius,
  PRECISION_DISPLAY,
  PRECISION_INDEX,
  publicCell,
  publicPoint,
} from './index';

describe('geo', () => {
  it('publicPoint is deterministic for the same geohash and listing id', () => {
    const hash = encode({ lat: 52.52, lng: 13.405 }, 7);
    const cell = publicCell(hash);
    expect(cell.length).toBe(PRECISION_DISPLAY);

    const a = publicPoint(hash, 'listing-uuid-1');
    const b = publicPoint(hash, 'listing-uuid-1');
    expect(a.lat).toBe(b.lat);
    expect(a.lng).toBe(b.lng);
  });

  it('publicPoint differs for different listing ids in the same cell', () => {
    const hash = encode({ lat: 48.8566, lng: 2.3522 }, 7);
    const a = publicPoint(hash, 'id-a');
    const b = publicPoint(hash, 'id-b');
    expect(a.lat === b.lat && a.lng === b.lng).toBe(false);
  });

  it('encode then decode returns the geohash centre (within cell)', () => {
    const point = { lat: 50.0614, lng: 19.9366 };
    const hash = encode(point, PRECISION_INDEX);
    const back = decode(hash);
    expect(Math.abs(back.lat - point.lat)).toBeLessThan(0.02);
    expect(Math.abs(back.lng - point.lng)).toBeLessThan(0.02);
  });

  it('publicCell truncates index hash to display precision', () => {
    const hash = encode({ lat: 52.52, lng: 13.405 }, PRECISION_INDEX);
    expect(publicCell(hash).length).toBe(PRECISION_DISPLAY);
    expect(hash.startsWith(publicCell(hash))).toBe(true);
  });

  it('neighborsWithinRadius always includes the centre cell', () => {
    const centre = { lat: 50.05, lng: 19.95 };
    const cells = neighborsWithinRadius(centre, 3, PRECISION_DISPLAY);
    const centreCell = encode(centre, PRECISION_DISPLAY);
    expect(cells).toContain(centreCell);
    expect(cells.length).toBeGreaterThanOrEqual(1);
  });
});
