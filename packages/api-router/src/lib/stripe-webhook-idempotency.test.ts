import { describe, expect, it } from 'vitest';
import {
  reservationPaymentPatchForStripeEvent,
  shouldProcessStripeWebhookEvent,
} from './stripe-webhook-idempotency';

describe('shouldProcessStripeWebhookEvent', () => {
  it('allows first delivery', () => {
    expect(shouldProcessStripeWebhookEvent(0)).toBe(true);
  });

  it('skips duplicate delivery (idempotent replay)', () => {
    expect(shouldProcessStripeWebhookEvent(1)).toBe(false);
  });
});

describe('reservationPaymentPatchForStripeEvent', () => {
  const now = new Date('2026-01-01T12:00:00.000Z');

  it('maps payment_intent.succeeded to captured state', () => {
    expect(reservationPaymentPatchForStripeEvent('payment_intent.succeeded', now)).toEqual({
      status: 'succeeded',
      capturedAt: now,
      updatedAt: now,
    });
  });

  it('maps payment_intent.canceled to canceled state', () => {
    expect(reservationPaymentPatchForStripeEvent('payment_intent.canceled', now)).toEqual({
      status: 'canceled',
      cancelledAt: now,
      updatedAt: now,
    });
  });

  it('maps charge.refunded to refunded state', () => {
    expect(reservationPaymentPatchForStripeEvent('charge.refunded', now)).toEqual({
      status: 'refunded',
      refundedAt: now,
      updatedAt: now,
    });
  });

  it('maps charge.dispute.created to dispute timestamp only', () => {
    expect(reservationPaymentPatchForStripeEvent('charge.dispute.created', now)).toEqual({
      disputedAt: now,
      updatedAt: now,
    });
  });

  it('returns null for unrelated webhook types', () => {
    expect(reservationPaymentPatchForStripeEvent('account.updated', now)).toBeNull();
  });
});
