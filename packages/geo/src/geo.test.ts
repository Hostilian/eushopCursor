import { describe, expect, it } from 'vitest';
import { encode, PRECISION_DISPLAY, publicCell, publicPoint } from './index';

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
});
