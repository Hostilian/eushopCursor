import { describe, expect, it } from 'vitest';
import {
  createTripOfferInput,
  listingByCountryFeedInput,
  requestsFeedInput,
  tractionWeeklyGrowthInput,
  tripSearchInput,
  uuidIdParam,
} from '@eushop/validators';

describe('router input schemas', () => {
  it('uuidIdParam accepts a valid UUID', () => {
    expect(() => uuidIdParam.parse({ id: '123e4567-e89b-12d3-a456-426614174000' })).not.toThrow();
  });

  it('tractionWeeklyGrowthInput defaults weeks', () => {
    expect(tractionWeeklyGrowthInput.parse(undefined)).toBeUndefined();
    expect(tractionWeeklyGrowthInput.parse({})).toEqual({ weeks: 12 });
  });

  it('requestsFeedInput uppercases country', () => {
    const out = requestsFeedInput.parse({ countryIso2: 'de', limit: 10 });
    expect(out.countryIso2).toBe('DE');
    expect(out.limit).toBe(10);
  });

  it('listingByCountryFeedInput normalizes iso2', () => {
    const out = listingByCountryFeedInput.parse({ iso2: 'pl', limit: 8 });
    expect(out.iso2).toBe('PL');
    expect(out.limit).toBe(8);
  });

  it('tripSearchInput accepts empty filter', () => {
    const out = tripSearchInput.parse({});
    expect(out.onlyOpen).toBe(true);
    expect(out.limit).toBe(24);
  });

  it('createTripOfferInput requires future departAt', () => {
    const past = new Date(Date.now() - 86_400_000);
    const res = createTripOfferInput.safeParse({
      originCountryIso2: 'DE',
      originCity: 'Berlin',
      originLocation: { lat: 52.52, lng: 13.405 },
      destinationCountryIso2: 'PL',
      destinationCity: 'Warsaw',
      destinationLocation: { lat: 52.23, lng: 21.01 },
      departAt: past,
      slotsTotal: 2,
      defaultPerSlotFee: 10,
    });
    expect(res.success).toBe(false);
  });
});
