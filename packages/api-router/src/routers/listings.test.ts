import { describe, expect, it, vi } from 'vitest';
import { listingsRouter } from './listings';
import { createCallerFactory } from '../trpc';

const callerFactory = createCallerFactory(listingsRouter);

const LISTING_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

function baseListingRow(overrides: Partial<{ status: string }> = {}) {
  return {
    id: LISTING_ID,
    sellerId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    foodItemId: null as string | null,
    freeformName: 'Test item',
    brandName: null,
    notes: null,
    qty: 1,
    unit: 'item',
    finderFee: '5.00',
    currency: 'EUR',
    freshness: 'week' as const,
    status: 'live' as const,
    location: { lat: 48.14, lng: 11.58 },
    cellGeohash: 'u281y',
    indexGeohash: 'u281y0000000',
    approximateCity: 'Munich',
    countryIso2: 'DE',
    photos: [] as { url: string }[],
    expiresAt: null as Date | null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('listingsRouter public queries', () => {
  it('byId returns a live listing', async () => {
    const row = baseListingRow();
    const ctx = {
      db: {
        query: {
          listings: {
            findFirst: vi.fn(async () => row),
          },
          foodItems: {
            findFirst: vi.fn(async () => null),
          },
        },
      },
      enqueueEvent: vi.fn(),
    } as any;
    const caller = callerFactory(ctx);
    const out = await caller.byId({ id: LISTING_ID });
    expect(out.id).toBe(LISTING_ID);
    expect(ctx.db.query.listings.findFirst).toHaveBeenCalledTimes(1);
  });

  it('byId returns NOT_FOUND when a removed listing row is returned (defensive guard)', async () => {
    const row = baseListingRow({ status: 'removed' });
    const ctx = {
      db: {
        query: {
          listings: {
            findFirst: vi.fn(async () => row),
          },
          foodItems: {
            findFirst: vi.fn(async () => null),
          },
        },
      },
      enqueueEvent: vi.fn(),
    } as any;
    const caller = callerFactory(ctx);
    await expect(caller.byId({ id: LISTING_ID })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('byId returns NOT_FOUND when no live listing matches (e.g. removed or missing)', async () => {
    const ctx = {
      db: {
        query: {
          listings: {
            findFirst: vi.fn(async () => null),
          },
          foodItems: {
            findFirst: vi.fn(async () => null),
          },
        },
      },
      enqueueEvent: vi.fn(),
    } as any;
    const caller = callerFactory(ctx);
    await expect(caller.byId({ id: LISTING_ID })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
