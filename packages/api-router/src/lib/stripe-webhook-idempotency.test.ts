import { describe, expect, it } from 'vitest';
import { shouldProcessStripeWebhookEvent } from './stripe-webhook-idempotency';

describe('shouldProcessStripeWebhookEvent', () => {
  it('allows first delivery', () => {
    expect(shouldProcessStripeWebhookEvent(0)).toBe(true);
  });

  it('skips duplicate delivery (idempotent replay)', () => {
    expect(shouldProcessStripeWebhookEvent(1)).toBe(false);
  });
});
