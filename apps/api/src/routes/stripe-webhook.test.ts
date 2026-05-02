import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { handleStripeWebhook } from './stripe-webhook';

const limitMock = vi.fn();
const insertValuesMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@eushop/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: limitMock,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: insertValuesMock,
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
    query: {
      tripReservations: {
        findFirst: vi.fn(async () => ({ tripOfferId: 'trip-1', buyerId: 'buyer-1' })),
      },
    },
  },
  connectAccounts: {},
  financialEvents: {},
  reservationPayments: {},
  payouts: {},
  tripReservations: {},
}));

const verifyMock = vi.fn();

vi.mock('@eushop/api-router/lib/stripe', () => ({
  verifyWebhookSignature: (...args: unknown[]) => verifyMock(...args),
}));

describe('handleStripeWebhook', () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    limitMock.mockReset();
    limitMock.mockResolvedValue([]);
    insertValuesMock.mockClear();
    verifyMock.mockReset();
  });
  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('returns 501 when STRIPE_WEBHOOK_SECRET is missing', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const { handleStripeWebhook } = await import('./stripe-webhook.js');
    const app = new Hono();
    app.post('/wh', handleStripeWebhook);
    const res = await app.request('/wh', { method: 'POST', body: '{}' });
    expect(res.status).toBe(501);
  });

  it('returns 400 on signature failure', async () => {
    verifyMock.mockImplementation(() => {
      throw new Error('bad sig');
    });
    const app = new Hono();
    app.post('/wh', handleStripeWebhook);
    const res = await app.request('/wh', {
      method: 'POST',
      headers: { 'stripe-signature': 'v0=abc' },
      body: '{}',
    });
    expect(res.status).toBe(400);
  });

  it('returns idempotent JSON when event already recorded', async () => {
    verifyMock.mockReturnValue({
      id: 'evt_dup',
      type: 'payment_intent.created',
      data: { object: { id: 'pi_1' } },
    });
    limitMock.mockResolvedValueOnce([{ id: 'fe-1' }]);
    const { handleStripeWebhook } = await import('./stripe-webhook.js');
    const app = new Hono();
    app.post('/wh', handleStripeWebhook);
    const res = await app.request('/wh', {
      method: 'POST',
      headers: { 'stripe-signature': 't=1,v1=x' },
      body: '{}',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.idempotent).toBe(true);
    expect(insertValuesMock).not.toHaveBeenCalled();
  });

  it('inserts financial_events for handled Stripe types', async () => {
    verifyMock.mockReturnValue({
      id: 'evt_new',
      type: 'payment_intent.created',
      data: { object: { id: 'pi_new', amount: 500, currency: 'eur' } },
    });
    const app = new Hono();
    app.post('/wh', handleStripeWebhook);
    const res = await app.request('/wh', {
      method: 'POST',
      headers: { 'stripe-signature': 't=1,v1=x' },
      body: '{}',
    });
    expect(res.status).toBe(200);
    expect(insertValuesMock).toHaveBeenCalledTimes(1);
    const firstCall = insertValuesMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    expect(firstCall?.[0]).toMatchObject({
      kind: 'payment_intent.created',
      stripeEventId: 'evt_new',
    });
  });
});
