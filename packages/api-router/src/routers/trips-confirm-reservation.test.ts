import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import * as stripeLib from '../lib/stripe';
import { tripsRouter } from './trips';
import { createCallerFactory } from '../trpc';

const callerFactory = createCallerFactory(tripsRouter);

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

const baseTrip: TripRow = {
  id: '11111111-1111-1111-1111-111111111111',
  sellerId: 'seller-1',
  status: 'open',
  defaultPerSlotFee: '10.00',
  slotsAvailable: 1,
  slotsTotal: 2,
  currency: 'EUR',
  departAt: new Date(Date.now() + 86_400_000),
  cellGeohashOrigin: 'u281y',
  cellGeohashDestination: 'u3h0z',
  originLocation: { lat: 52.52, lng: 13.405 },
  destinationLocation: { lat: 52.23, lng: 21.01 },
};

function makeConfirmCtx(opts: {
  payment: {
    id: string;
    stripePaymentIntentId: string;
    amountTotalCents: string;
    currency: string;
  } | null;
}) {
  const reservation = {
    id: 'res-confirm-1',
    tripOfferId: baseTrip.id,
    buyerId: 'buyer-1',
    status: 'pending',
    qty: 1,
    agreedFinderFee: '10.00',
    platformFee: '1.20',
    currency: 'EUR',
  };
  let updateCount = 0;
  const financialInserts: unknown[] = [];
  const db: any = {
    query: {
      tripReservations: { findFirst: vi.fn(async () => reservation) },
      tripOffers: { findFirst: vi.fn(async () => baseTrip) },
    },
    update: vi.fn(() => {
      updateCount += 1;
      if (updateCount === 1) {
        return {
          set: () => ({
            where: () => ({
              returning: vi.fn(async () => [{ ...reservation, status: 'confirmed' }]),
            }),
          }),
        };
      }
      return {
        set: () => ({
          where: () => Promise.resolve(),
        }),
      };
    }),
    select: vi.fn(() => ({
      from: () => ({
        where: () => ({
          limit: vi.fn(async () => (opts.payment ? [opts.payment] : [])),
        }),
      }),
    })),
    insert: vi.fn(() => ({
      values: (row: unknown) => {
        financialInserts.push(row);
        return Promise.resolve();
      },
    })),
  };
  const ctx = {
    db,
    meili: {} as any,
    auth: {} as any,
    user: { id: 'seller-1', email: 's@e.com', role: 'user' } as any,
    headers: new Headers(),
    enqueueEvent: vi.fn(async () => {}),
  };
  return { ctx, financialInserts, reservation };
}

describe('tripsRouter.confirmReservation', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  });
  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    vi.restoreAllMocks();
  });

  it('confirms without calling Stripe when no reservation_payment row exists', async () => {
    const capture = vi.spyOn(stripeLib, 'capturePaymentIntent');
    const { ctx, financialInserts } = makeConfirmCtx({ payment: null });
    const caller = callerFactory(ctx as any);
    const out = await caller.confirmReservation({ reservationId: 'res-confirm-1' });
    expect(out?.status).toBe('confirmed');
    expect(capture).not.toHaveBeenCalled();
    expect(financialInserts).toHaveLength(0);
  });

  it('captures PaymentIntent and records financial_events when payment row exists', async () => {
    vi.spyOn(stripeLib, 'capturePaymentIntent').mockResolvedValue({
      status: 'succeeded',
      latest_charge: 'ch_123',
    } as any);
    const { ctx, financialInserts } = makeConfirmCtx({
      payment: {
        id: 'pay-1',
        stripePaymentIntentId: 'pi_abc',
        amountTotalCents: '1120',
        currency: 'eur',
      },
    });
    const caller = callerFactory(ctx as any);
    await caller.confirmReservation({ reservationId: 'res-confirm-1' });
    expect(stripeLib.capturePaymentIntent).toHaveBeenCalledWith('pi_abc');
    expect(financialInserts.length).toBeGreaterThanOrEqual(1);
    expect(financialInserts[0]).toMatchObject({
      kind: 'charge.captured',
      stripeObjectId: 'pi_abc',
    });
  });
});
