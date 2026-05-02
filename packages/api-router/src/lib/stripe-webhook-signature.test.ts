import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { TRPCError } from '@trpc/server';
import { verifyWebhookSignature } from './stripe';

function signStripeWebhook(secret: string, rawBody: string, ts: number): string {
  const payload = `${ts}.${rawBody}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `t=${ts},v1=${sig}`;
}

describe('verifyWebhookSignature', () => {
  const secret = 'whsec_test_secret_32chars_minimum_ok_xxxx';

  it('accepts a correctly signed payload', () => {
    const raw = JSON.stringify({
      id: 'evt_test_webhook',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123', amount: 1000, currency: 'eur' } },
    });
    const ts = Math.floor(Date.now() / 1000);
    const header = signStripeWebhook(secret, raw, ts);
    const out = verifyWebhookSignature({ rawBody: raw, signatureHeader: header, secret });
    expect(out.id).toBe('evt_test_webhook');
    expect(out.type).toBe('payment_intent.succeeded');
  });

  it('rejects tampered body', () => {
    const raw = JSON.stringify({ id: 'evt_1', type: 'x', data: { object: {} } });
    const ts = Math.floor(Date.now() / 1000);
    const header = signStripeWebhook(secret, raw, ts);
    const tampered = raw.replace('evt_1', 'evt_2');
    expect(() =>
      verifyWebhookSignature({ rawBody: tampered, signatureHeader: header, secret }),
    ).toThrow(TRPCError);
  });

  it('rejects missing header', () => {
    expect(() =>
      verifyWebhookSignature({
        rawBody: '{}',
        signatureHeader: null,
        secret,
      }),
    ).toThrow(TRPCError);
  });
});
