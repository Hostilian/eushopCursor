import {
  connectAccounts,
  db,
  financialEvents,
  payouts,
  reservationPayments,
  tripReservations,
} from '@eushop/db';
import { verifyWebhookSignature } from '@eushop/api-router/lib/stripe';
import { mapStripeEventTypeToFinancialKind } from '@eushop/api-router/lib/stripe-webhook-financial-kind';
import {
  reservationPaymentPatchForStripeEvent,
  shouldProcessStripeWebhookEvent,
} from '@eushop/api-router/lib/stripe-webhook-idempotency';
import { eq } from 'drizzle-orm';
import type { Context } from 'hono';

type StripeObject = Record<string, unknown>;

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function parseMoneyFields(obj: StripeObject): {
  amountCents: string | null;
  currency: string | null;
} {
  const amountCents = typeof obj.amount === 'number' ? String(obj.amount) : null;
  const currency = typeof obj.currency === 'string' ? String(obj.currency).toUpperCase() : null;
  return { amountCents, currency };
}

async function findReservationIdForPaymentIntent(paymentIntentId: string): Promise<string | null> {
  const [pay] = await db
    .select({ reservationId: reservationPayments.reservationId })
    .from(reservationPayments)
    .where(eq(reservationPayments.stripePaymentIntentId, paymentIntentId))
    .limit(1);
  return pay?.reservationId ?? null;
}

async function resolveReservationId(eventType: string, obj: StripeObject): Promise<string | null> {
  const metadata = obj.metadata;
  if (metadata && typeof metadata === 'object') {
    const reservationFromMeta = asString((metadata as Record<string, unknown>).reservationId);
    if (reservationFromMeta) return reservationFromMeta;
  }

  const paymentIntentRef = asString(obj.payment_intent);
  if (paymentIntentRef) {
    const fromPaymentRef = await findReservationIdForPaymentIntent(paymentIntentRef);
    if (fromPaymentRef) return fromPaymentRef;
  }

  if (eventType.startsWith('payment_intent.')) {
    const piId = asString(obj.id);
    if (piId) {
      const fromPi = await findReservationIdForPaymentIntent(piId);
      if (fromPi) return fromPi;
    }
  }

  return null;
}

function connectAccountStatusForUpdate(input: {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}): 'active' | 'restricted' | 'pending' {
  if (input.chargesEnabled && input.payoutsEnabled) return 'active';
  if (input.detailsSubmitted) return 'restricted';
  return 'pending';
}

async function handleAccountUpdated(obj: StripeObject): Promise<void> {
  const stripeAccountId = asString(obj.id);
  if (!stripeAccountId) return;
  const [row] = await db
    .select()
    .from(connectAccounts)
    .where(eq(connectAccounts.stripeAccountId, stripeAccountId))
    .limit(1);
  if (!row) return;

  const chargesEnabled = Boolean(obj.charges_enabled);
  const payoutsEnabled = Boolean(obj.payouts_enabled);
  const detailsSubmitted = Boolean(obj.details_submitted);
  const requirementsRaw = obj.requirements;
  const requirements =
    requirementsRaw && typeof requirementsRaw === 'object'
      ? (requirementsRaw as { currently_due?: string[]; disabled_reason?: string | null })
      : {};

  await db
    .update(connectAccounts)
    .set({
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      requirementsCurrentlyDue: requirements.currently_due ?? [],
      requirementsDisabledReason: requirements.disabled_reason ?? null,
      status: connectAccountStatusForUpdate({ chargesEnabled, payoutsEnabled, detailsSubmitted }),
      updatedAt: new Date(),
    })
    .where(eq(connectAccounts.id, row.id));
}

async function applyReservationPaymentPatch(
  eventType: string,
  obj: StripeObject,
  reservationId: string,
): Promise<void> {
  const patch = reservationPaymentPatchForStripeEvent(eventType);
  const piStatus = eventType.startsWith('payment_intent.') ? asString(obj.status) : null;
  if (!patch && !piStatus) return;

  const merged: {
    status?: string;
    capturedAt?: Date;
    cancelledAt?: Date;
    refundedAt?: Date;
    disputedAt?: Date;
    updatedAt: Date;
  } = { updatedAt: new Date() };
  if (patch) Object.assign(merged, patch);
  if (piStatus) merged.status = piStatus;
  await db
    .update(reservationPayments)
    .set(merged)
    .where(eq(reservationPayments.reservationId, reservationId));
}

async function handlePayoutStatus(eventType: string, obj: StripeObject): Promise<void> {
  const payoutId = asString(obj.id);
  if (!payoutId) return;
  if (eventType === 'payout.paid') {
    await db
      .update(payouts)
      .set({ status: 'paid', updatedAt: new Date() })
      .where(eq(payouts.stripeTransferId, payoutId));
  }
  if (eventType === 'payout.failed') {
    await db
      .update(payouts)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(eq(payouts.stripeTransferId, payoutId));
  }
}

/**
 * Stripe webhook handler.
 *
 * The endpoint mirrors every interesting object Stripe surfaces about our
 * marketplace into our local tables so admin tools, payouts and reconciliation
 * never need to call Stripe to know "what really happened".
 *
 * Idempotency: every event lands in `financial_events` keyed on the Stripe
 * `evt_…` id. Duplicate webhook deliveries are absorbed by the unique index.
 */
export async function handleStripeWebhook(c: Context): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return c.json({ error: 'STRIPE_WEBHOOK_SECRET not configured' }, 501);
  }
  const raw = await c.req.text();
  let event: Awaited<ReturnType<typeof verifyWebhookSignature>>;
  try {
    event = verifyWebhookSignature({
      rawBody: raw,
      signatureHeader: c.req.header('stripe-signature') ?? null,
      secret,
    });
  } catch (e) {
    console.warn('[stripe webhook] signature reject', e instanceof Error ? e.message : e);
    return c.json({ error: 'Bad signature' }, 400);
  }

  const obj = event.data.object as StripeObject;
  const stripeObjectId = asString(obj.id);

  // Idempotency: skip if this event id has already been recorded.
  const existing = await db
    .select({ id: financialEvents.id })
    .from(financialEvents)
    .where(eq(financialEvents.stripeEventId, event.id))
    .limit(1);
  if (!shouldProcessStripeWebhookEvent(existing.length)) {
    return c.json({ received: true, idempotent: true });
  }

  const kind = mapStripeEventTypeToFinancialKind(event.type);
  if (!kind) {
    console.info('[stripe webhook] unhandled', event.type);
  }
  const { amountCents, currency } = parseMoneyFields(obj);
  const reservationId = await resolveReservationId(event.type, obj);

  console.info(
    '[stripe webhook]',
    JSON.stringify({
      type: event.type,
      evt: event.id,
      stripeObjectId,
      reservationId,
      financialKind: kind ?? null,
    }),
  );

  // Side effects per type.
  try {
    if (event.type === 'account.updated') await handleAccountUpdated(obj);
    if (reservationId) await applyReservationPaymentPatch(event.type, obj, reservationId);
    await handlePayoutStatus(event.type, obj);
  } catch (e) {
    console.error('[stripe webhook] side-effect failure', event.type, e);
  }

  if (kind) {
    let resForLookup: typeof tripReservations.$inferSelect | undefined;
    if (reservationId) {
      resForLookup = await db.query.tripReservations.findFirst({
        where: eq(tripReservations.id, reservationId),
      });
    }
    await db.insert(financialEvents).values({
      kind,
      stripeEventId: event.id,
      stripeObjectId,
      reservationId,
      tripOfferId: resForLookup?.tripOfferId ?? null,
      sellerUserId: null,
      buyerUserId: resForLookup?.buyerId ?? null,
      amountCents,
      currency,
      payload: obj,
    });
  }

  return c.json({ received: true });
}
