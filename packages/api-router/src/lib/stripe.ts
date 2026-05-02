/**
 * Minimal Stripe client.
 *
 * We deliberately do **not** depend on the Stripe SDK here so the API server
 * stays lightweight and the lockfile stays stable. Every call goes through
 * the documented REST surface and returns the parsed JSON.
 *
 * Webhook signature verification uses the same algorithm Stripe documents
 * (HMAC-SHA256 over `${timestamp}.${payload}` with the webhook secret),
 * with constant-time comparison via `crypto.timingSafeEqual`.
 */

import { TRPCError } from '@trpc/server';
import crypto from 'node:crypto';

const STRIPE_API = 'https://api.stripe.com/v1';

export interface StripeAccountSummary {
  id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  country: string;
  requirements?: {
    currently_due?: string[];
    disabled_reason?: string | null;
  };
}

export interface StripePaymentIntentSummary {
  id: string;
  status: string;
  amount: number;
  amount_capturable?: number;
  amount_received?: number;
  currency: string;
  application_fee_amount?: number;
  client_secret?: string | null;
  latest_charge?: string | null;
  transfer_data?: { destination: string } | null;
}

export class StripeNotConfiguredError extends Error {
  constructor() {
    super('STRIPE_SECRET_KEY is not set');
    this.name = 'StripeNotConfiguredError';
  }
}

export function stripeSecret(): string {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new StripeNotConfiguredError();
  return k;
}

function flatten(obj: unknown, prefix: string, out: URLSearchParams): void {
  if (obj == null) return;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
    return;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      flatten(v, prefix ? `${prefix}[${k}]` : k, out);
    }
    return;
  }
  out.append(prefix, String(obj));
}

function encodeForm(body: Record<string, unknown>): string {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) flatten(v, k, out);
  return out.toString();
}

async function stripeFetch<T>(
  path: string,
  init: {
    method: 'GET' | 'POST' | 'DELETE';
    body?: Record<string, unknown>;
    stripeAccount?: string;
  },
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${stripeSecret()}`,
  };
  if (init.body) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  if (init.stripeAccount) headers['Stripe-Account'] = init.stripeAccount;
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: init.method,
    headers,
    body: init.body ? encodeForm(init.body) : undefined,
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text.length > 0 ? JSON.parse(text) : {};
  } catch {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Stripe returned non-JSON (${res.status})`,
    });
  }
  if (!res.ok) {
    const message =
      (json as { error?: { message?: string } })?.error?.message ?? `Stripe HTTP ${res.status}`;
    throw new TRPCError({
      code: res.status === 404 ? 'NOT_FOUND' : 'BAD_GATEWAY',
      message,
    });
  }
  return json as T;
}

/* ------------------------------ Connect ------------------------------ */

export function createExpressAccount(opts: {
  email: string;
  countryIso2: string;
}): Promise<StripeAccountSummary> {
  return stripeFetch<StripeAccountSummary>('/accounts', {
    method: 'POST',
    body: {
      type: 'express',
      country: opts.countryIso2,
      email: opts.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
    },
  });
}

export function retrieveAccount(stripeAccountId: string): Promise<StripeAccountSummary> {
  return stripeFetch<StripeAccountSummary>(`/accounts/${encodeURIComponent(stripeAccountId)}`, {
    method: 'GET',
  });
}

export function createAccountLink(opts: {
  stripeAccountId: string;
  returnUrl: string;
  refreshUrl: string;
}): Promise<{ url: string; expires_at: number }> {
  return stripeFetch('/account_links', {
    method: 'POST',
    body: {
      account: opts.stripeAccountId,
      type: 'account_onboarding',
      return_url: opts.returnUrl,
      refresh_url: opts.refreshUrl,
    },
  });
}

/* --------------------------- Payment Intents ------------------------- */

export function createPaymentIntent(opts: {
  amountCents: number;
  applicationFeeCents: number;
  currency: string;
  destinationAccountId: string;
  metadata?: Record<string, string>;
  description?: string;
}): Promise<StripePaymentIntentSummary> {
  return stripeFetch<StripePaymentIntentSummary>('/payment_intents', {
    method: 'POST',
    body: {
      amount: opts.amountCents,
      currency: opts.currency.toLowerCase(),
      application_fee_amount: opts.applicationFeeCents,
      capture_method: 'manual',
      transfer_data: { destination: opts.destinationAccountId },
      automatic_payment_methods: { enabled: true },
      metadata: opts.metadata ?? {},
      description: opts.description,
    },
  });
}

export function capturePaymentIntent(id: string): Promise<StripePaymentIntentSummary> {
  return stripeFetch<StripePaymentIntentSummary>(
    `/payment_intents/${encodeURIComponent(id)}/capture`,
    {
      method: 'POST',
    },
  );
}

export function cancelPaymentIntent(id: string): Promise<StripePaymentIntentSummary> {
  return stripeFetch<StripePaymentIntentSummary>(
    `/payment_intents/${encodeURIComponent(id)}/cancel`,
    {
      method: 'POST',
    },
  );
}

export function retrievePaymentIntent(id: string): Promise<StripePaymentIntentSummary> {
  return stripeFetch<StripePaymentIntentSummary>(`/payment_intents/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
}

export function createRefund(opts: {
  paymentIntentId: string;
  amountCents?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  reverseTransfer?: boolean;
  refundApplicationFee?: boolean;
}): Promise<{ id: string; status: string; amount: number }> {
  return stripeFetch('/refunds', {
    method: 'POST',
    body: {
      payment_intent: opts.paymentIntentId,
      amount: opts.amountCents,
      reason: opts.reason,
      reverse_transfer: opts.reverseTransfer ?? true,
      refund_application_fee: opts.refundApplicationFee ?? true,
    },
  });
}

/* ----------------------- Webhook signature verify -------------------- */

/**
 * Verify a Stripe webhook signature. Returns the parsed event payload on
 * success or throws a `TRPCError({ code: 'UNAUTHORIZED' })` if the signature
 * does not match. Implements the documented `t=…,v1=…` scheme.
 */
export function verifyWebhookSignature(opts: {
  rawBody: string;
  signatureHeader: string | null;
  secret: string;
  toleranceSeconds?: number;
}): { id: string; type: string; data: { object: Record<string, unknown> } } {
  const tol = opts.toleranceSeconds ?? 300;
  if (!opts.signatureHeader) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing Stripe-Signature header' });
  }
  const parts = opts.signatureHeader.split(',').map((p) => p.trim());
  let timestamp = '';
  const v1: string[] = [];
  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k === 't' && v) timestamp = v;
    else if (k === 'v1' && v) v1.push(v);
  }
  if (!timestamp || v1.length === 0) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Malformed Stripe signature' });
  }
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Bad timestamp' });
  }
  if (Math.abs(Date.now() / 1000 - ts) > tol) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Stripe signature too old' });
  }
  const payload = `${timestamp}.${opts.rawBody}`;
  const expected = crypto.createHmac('sha256', opts.secret).update(payload).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  let ok = false;
  for (const candidate of v1) {
    const candBuf = Buffer.from(candidate, 'utf8');
    if (candBuf.length === expectedBuf.length && crypto.timingSafeEqual(candBuf, expectedBuf)) {
      ok = true;
      break;
    }
  }
  if (!ok) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Bad Stripe signature' });
  }
  let parsed: { id: string; type: string; data: { object: Record<string, unknown> } };
  try {
    parsed = JSON.parse(opts.rawBody);
  } catch {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Webhook body is not JSON' });
  }
  return parsed;
}
