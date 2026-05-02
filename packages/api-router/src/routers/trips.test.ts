import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { tripsRouter } from './trips';
import { createCallerFactory } from '../trpc';

/**
 * Minimal in-memory stub for the slice of the Drizzle/Postgres surface that
 * `tripsRouter` touches. We are not trying to faithfully reimplement Drizzle —
 * we only need to control the shape of the values and the chainable builders
 * so we can assert on call sequences and return paths.
 *
 * Concurrency is modelled by allowing the test to override the row returned
 * from the atomic `update().returning()` call used by `trips.reserve` (the
 * one that does `WHERE slots_available > 0 RETURNING ...`).
 */

type TripRow = {
  id: string;
  sellerId: string;
  status: 'open' | 'closed' | 'completed';
  defaultPerSlotFee: string;
  slotsAvailable: number;
  slotsTotal: number;
  currency: string;
  departAt: Date;
  cellGeohashOrigin: string;
  cellGeohashDestination: string;
  originLocation: { lat: number; lng: number };
  destinationLocation: { lat: number; lng: number };
};

type ReservationRow = {
  id: string;
  tripOfferId: string;
  buyerId: string;
  status: string;
  qty: number;
  agreedFinderFee: string;
  platformFee: string;
  currency: string;
};

interface Stubs {
  trip: TripRow | null;
  reservation: ReservationRow | null;
  /** When false, the atomic decrement returns `[]` (no rows updated). */
  slotDecrementSucceeds: boolean;
  /** Capture insert payloads. */
  insertedReservations: any[];
  insertedFinancialEvents: any[];
  insertedPayouts: any[];
  /** Rejects the reservation insert if true. */
  reservationInsertThrows: Error | null;
}

function makeDb(stubs: Stubs) {
  const queryStub = {
    tripOffers: { findFirst: vi.fn(async () => stubs.trip) },
    tripReservations: { findFirst: vi.fn(async () => stubs.reservation) },
  };

  // Each chain method just returns `this` until a terminator (returning,
  // limit, etc) which resolves to a value.
  const updateBuilder = (terminator: () => unknown) => {
    const chain: any = {
      set: () => chain,
      where: () => chain,
      returning: vi.fn(async () => terminator()),
    };
    return chain;
  };

  const insertBuilder = (terminator: () => unknown) => {
    const chain: any = {
      values: () => chain,
      returning: vi.fn(async () => terminator()),
    };
    return chain;
  };

  const selectBuilder = (terminator: () => unknown) => {
    const chain: any = {
      from: () => chain,
      where: () => chain,
      orderBy: () => chain,
      groupBy: () => chain,
      limit: vi.fn(async () => terminator()),
    };
    // Allow awaiting the chain itself (drizzle supports this).
    chain.then = (resolve: any, reject: any) => Promise.resolve(terminator()).then(resolve, reject);
    return chain;
  };

  const db: any = {
    query: queryStub,
    update: vi.fn((_table: any) => {
      // Decide what `returning()` resolves to based on call count: the first
      // update on `trip_offers` in `reserve` is the slot decrement, which is
      // controlled by `slotDecrementSucceeds`. Everything else is a no-op
      // returning the row that was set (we just return [{}]).
      return updateBuilder(() => {
        if (db._reserveSlotCallCount === 0) {
          db._reserveSlotCallCount = 1;
          return stubs.slotDecrementSucceeds
            ? [{ slotsAvailable: (stubs.trip?.slotsAvailable ?? 1) - 1 }]
            : [];
        }
        return [{}];
      });
    }),
    insert: vi.fn((_table: any) => {
      // The first insert in `reserve` is always against `trip_reservations`;
      // we route by call order to keep the stub independent of Drizzle's
      // table identifier internals.
      return insertBuilder(() => {
        if (db._insertCallCount === 0) {
          db._insertCallCount = 1;
          if (stubs.reservationInsertThrows) {
            throw stubs.reservationInsertThrows;
          }
          const row: ReservationRow = {
            id: 'res-1',
            tripOfferId: stubs.trip!.id,
            buyerId: 'buyer-1',
            status: 'pending',
            qty: 1,
            agreedFinderFee: '10.00',
            platformFee: '1.20',
            currency: stubs.trip!.currency,
          };
          stubs.insertedReservations.push(row);
          return [row];
        }
        db._insertCallCount += 1;
        return [{}];
      });
    }),
    select: vi.fn(() => selectBuilder(() => [])),
    _reserveSlotCallCount: 0,
    _insertCallCount: 0,
  };
  return db;
}

function makeCtx(over: Partial<{ user: { id: string; role: string } | null }> = {}) {
  const stubs: Stubs = {
    trip: null,
    reservation: null,
    slotDecrementSucceeds: true,
    insertedReservations: [],
    insertedFinancialEvents: [],
    insertedPayouts: [],
    reservationInsertThrows: null,
  };
  const db = makeDb(stubs);
  const ctx = {
    db,
    meili: {} as any,
    auth: {} as any,
    user:
      over.user === undefined
        ? ({ id: 'buyer-1', email: 'b@e.com', role: 'user' } as any)
        : over.user,
    headers: new Headers(),
    enqueueEvent: vi.fn(async () => {}),
  };
  return { ctx, stubs, db };
}

const callerFactory = createCallerFactory(tripsRouter);

const baseTrip: TripRow = {
  id: '11111111-1111-1111-1111-111111111111',
  sellerId: 'seller-1',
  status: 'open',
  defaultPerSlotFee: '10.00',
  slotsAvailable: 1,
  slotsTotal: 2,
  currency: 'EUR',
  departAt: new Date(Date.now() + 86_400_000), // tomorrow
  cellGeohashOrigin: 'u281y',
  cellGeohashDestination: 'u3h0z',
  originLocation: { lat: 52.52, lng: 13.405 },
  destinationLocation: { lat: 52.23, lng: 21.01 },
};

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.STRIPE_SECRET_KEY;
});

describe('tripsRouter.reserve', () => {
  it('rejects when the buyer is the seller', async () => {
    const { ctx, stubs } = makeCtx();
    stubs.trip = { ...baseTrip, sellerId: 'buyer-1' };
    const caller = callerFactory(ctx as any);
    await expect(
      caller.reserve({
        tripOfferId: baseTrip.id,
        freeformText: 'test',
        qty: 1,
        agreedFinderFee: 10,
      }),
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: /cannot reserve their own trip/i,
    });
  });

  it('rejects when trip is not open', async () => {
    const { ctx, stubs } = makeCtx();
    stubs.trip = { ...baseTrip, status: 'closed' };
    const caller = callerFactory(ctx as any);
    await expect(
      caller.reserve({
        tripOfferId: baseTrip.id,
        freeformText: 'test',
        qty: 1,
        agreedFinderFee: 10,
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', message: /not accepting/i });
  });

  it('rejects when departAt is in the past', async () => {
    const { ctx, stubs } = makeCtx();
    stubs.trip = { ...baseTrip, departAt: new Date(Date.now() - 1_000) };
    const caller = callerFactory(ctx as any);
    await expect(
      caller.reserve({
        tripOfferId: baseTrip.id,
        freeformText: 'test',
        qty: 1,
        agreedFinderFee: 10,
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', message: /already departed/i });
  });

  it('enforces the agreedFinderFee floor', async () => {
    const { ctx, stubs } = makeCtx();
    stubs.trip = { ...baseTrip, defaultPerSlotFee: '15.00' };
    const caller = callerFactory(ctx as any);
    await expect(
      caller.reserve({
        tripOfferId: baseTrip.id,
        freeformText: 'test',
        qty: 1,
        agreedFinderFee: 10,
      }),
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: /minimum finder fee/i,
    });
  });

  it('returns "No slots remaining" when the atomic decrement returns 0 rows', async () => {
    // This is the concurrency case: two buyers race to reserve the last slot,
    // the first wins, and the second sees `update().returning()` come back
    // empty because `slots_available > 0` no longer holds.
    const { ctx, stubs } = makeCtx();
    stubs.trip = { ...baseTrip, slotsAvailable: 1 };
    stubs.slotDecrementSucceeds = false;
    const caller = callerFactory(ctx as any);
    await expect(
      caller.reserve({
        tripOfferId: baseTrip.id,
        freeformText: 'test',
        qty: 1,
        agreedFinderFee: 10,
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', message: /No slots remaining/i });
  });

  it('happy path: writes a reservation and emits trip.reservation.created', async () => {
    const { ctx, stubs } = makeCtx();
    stubs.trip = { ...baseTrip };
    const caller = callerFactory(ctx as any);
    const out = await caller.reserve({
      tripOfferId: baseTrip.id,
      freeformText: 'tomato sauce',
      qty: 1,
      agreedFinderFee: 10,
    });
    expect(out.id).toBe('res-1');
    expect(stubs.insertedReservations).toHaveLength(1);
    expect(ctx.enqueueEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'trip.reservation.created' }),
    );
  });

  it('rolls back the slot when the reservation insert fails', async () => {
    const { ctx, stubs, db } = makeCtx();
    stubs.trip = { ...baseTrip };
    stubs.reservationInsertThrows = new Error('unique violation');
    const caller = callerFactory(ctx as any);
    await expect(
      caller.reserve({
        tripOfferId: baseTrip.id,
        freeformText: 'tomato sauce',
        qty: 1,
        agreedFinderFee: 10,
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    // Two updates against trip_offers: the decrement and the rollback.
    expect(db.update).toHaveBeenCalledTimes(2);
  });
});

describe('tripsRouter.byId', () => {
  it('returns reservationSummary (no buyerId) to non-sellers', async () => {
    const { ctx, stubs } = makeCtx();
    stubs.trip = { ...baseTrip };
    const caller = callerFactory(ctx as any);
    const res = (await caller.byId({ id: baseTrip.id })) as any;
    expect(res.viewerIsSeller).toBe(false);
    expect(res.reservationSummary).toBeDefined();
    expect((res as any).reservations).toBeUndefined();
  });

  it('returns the full reservations list to the seller', async () => {
    const { ctx, stubs } = makeCtx({ user: { id: 'seller-1', role: 'user' } });
    stubs.trip = { ...baseTrip };
    const caller = callerFactory(ctx as any);
    const res = (await caller.byId({ id: baseTrip.id })) as any;
    expect(res.viewerIsSeller).toBe(true);
    expect(Array.isArray(res.reservations)).toBe(true);
  });
});

describe('tripsRouter.cancelReservation', () => {
  it('refuses cancel after departure', async () => {
    const { ctx, stubs } = makeCtx();
    stubs.reservation = {
      id: 'res-1',
      tripOfferId: baseTrip.id,
      buyerId: 'buyer-1',
      status: 'confirmed',
      qty: 1,
      agreedFinderFee: '10.00',
      platformFee: '1.20',
      currency: 'EUR',
    };
    stubs.trip = { ...baseTrip, departAt: new Date(Date.now() - 1_000) };
    const caller = callerFactory(ctx as any);
    await expect(caller.cancelReservation({ reservationId: 'res-1' })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: /already departed/i,
    });
  });

  it('refuses cancel when reservation is already completed', async () => {
    const { ctx, stubs } = makeCtx();
    stubs.reservation = {
      id: 'res-1',
      tripOfferId: baseTrip.id,
      buyerId: 'buyer-1',
      status: 'completed',
      qty: 1,
      agreedFinderFee: '10.00',
      platformFee: '1.20',
      currency: 'EUR',
    };
    const caller = callerFactory(ctx as any);
    await expect(caller.cancelReservation({ reservationId: 'res-1' })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: /Cannot cancel from this state/i,
    });
  });

  it('refuses cancel when buyer is not the requester', async () => {
    const { ctx, stubs } = makeCtx();
    stubs.reservation = {
      id: 'res-1',
      tripOfferId: baseTrip.id,
      buyerId: 'someone-else',
      status: 'pending',
      qty: 1,
      agreedFinderFee: '10.00',
      platformFee: '1.20',
      currency: 'EUR',
    };
    const caller = callerFactory(ctx as any);
    await expect(caller.cancelReservation({ reservationId: 'res-1' })).rejects.toBeInstanceOf(
      TRPCError,
    );
  });
});
