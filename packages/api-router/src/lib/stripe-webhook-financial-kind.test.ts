import { describe, expect, it } from 'vitest';
import { mapStripeEventTypeToFinancialKind } from './stripe-webhook-financial-kind';

describe('mapStripeEventTypeToFinancialKind', () => {
  it('maps payment intent lifecycle', () => {
    expect(mapStripeEventTypeToFinancialKind('payment_intent.created')).toBe(
      'payment_intent.created',
    );
    expect(mapStripeEventTypeToFinancialKind('payment_intent.requires_action')).toBe(
      'payment_intent.requires_action',
    );
    expect(mapStripeEventTypeToFinancialKind('payment_intent.succeeded')).toBe(
      'payment_intent.succeeded',
    );
    expect(mapStripeEventTypeToFinancialKind('payment_intent.amount_capturable_updated')).toBe(
      'payment_intent.succeeded',
    );
    expect(mapStripeEventTypeToFinancialKind('payment_intent.canceled')).toBe(
      'payment_intent.canceled',
    );
  });

  it('maps charges, transfers, payouts, and Connect', () => {
    expect(mapStripeEventTypeToFinancialKind('charge.captured')).toBe('charge.captured');
    expect(mapStripeEventTypeToFinancialKind('charge.succeeded')).toBe('charge.captured');
    expect(mapStripeEventTypeToFinancialKind('charge.refunded')).toBe('charge.refunded');
    expect(mapStripeEventTypeToFinancialKind('charge.dispute.created')).toBe(
      'charge.dispute.created',
    );
    expect(mapStripeEventTypeToFinancialKind('charge.dispute.closed')).toBe(
      'charge.dispute.closed',
    );
    expect(mapStripeEventTypeToFinancialKind('transfer.created')).toBe('transfer.created');
    expect(mapStripeEventTypeToFinancialKind('transfer.failed')).toBe('transfer.failed');
    expect(mapStripeEventTypeToFinancialKind('payout.paid')).toBe('payout.paid');
    expect(mapStripeEventTypeToFinancialKind('payout.failed')).toBe('payout.failed');
    expect(mapStripeEventTypeToFinancialKind('account.updated')).toBe('connect.account.updated');
  });

  it('returns null for unhandled Stripe types', () => {
    expect(mapStripeEventTypeToFinancialKind('customer.created')).toBeNull();
    expect(mapStripeEventTypeToFinancialKind('invoice.paid')).toBeNull();
  });
});
