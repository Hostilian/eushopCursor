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

  const obj = event.data.object as Record<string, unknown>;
  const stripeObjectId = (obj.id as string | undefined) ?? null;

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
  let amountCents: string | null = null;
  let currency: string | null = null;
  let reservationId: string | null = null;

  // Pull amount/currency from the Stripe object when present.
  if (typeof obj.amount === 'number') amountCents = String(obj.amount);
  if (typeof obj.currency === 'string') currency = String(obj.currency).toUpperCase();

  // Map back to a reservation via metadata.reservationId or the stored PI id.
  const meta = (obj.metadata as Record<string, string> | undefined) ?? undefined;
  if (meta?.reservationId) reservationId = meta.reservationId;
  if (!reservationId && typeof obj.payment_intent === 'string') {
    const [pay] = await db
      .select({ reservationId: reservationPayments.reservationId })
      .from(reservationPayments)
      .where(eq(reservationPayments.stripePaymentIntentId, obj.payment_intent as string))
      .limit(1);
    if (pay) reservationId = pay.reservationId;
  }
  if (!reservationId && typeof obj.id === 'string' && event.type.startsWith('payment_intent.')) {
    const [pay] = await db
      .select({ reservationId: reservationPayments.reservationId })
      .from(reservationPayments)
      .where(eq(reservationPayments.stripePaymentIntentId, obj.id as string))
      .limit(1);
    if (pay) reservationId = pay.reservationId;
  }

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
    if (event.type === 'account.updated' && typeof obj.id === 'string') {
      const [row] = await db
        .select()
        .from(connectAccounts)
        .where(eq(connectAccounts.stripeAccountId, obj.id as string))
        .limit(1);
      if (row) {
        const chargesEnabled = Boolean(obj.charges_enabled);
        const payoutsEnabled = Boolean(obj.payouts_enabled);
        const detailsSubmitted = Boolean(obj.details_submitted);
        const reqs =
          (obj.requirements as
            | { currently_due?: string[]; disabled_reason?: string | null }
            | undefined) ?? {};
        await db
          .update(connectAccounts)
          .set({
            chargesEnabled,
            payoutsEnabled,
            detailsSubmitted,
            requirementsCurrentlyDue: reqs.currently_due ?? [],
            requirementsDisabledReason: reqs.disabled_reason ?? null,
            status:
              chargesEnabled && payoutsEnabled
                ? 'active'
                : detailsSubmitted
                  ? 'restricted'
                  : 'pending',
            updatedAt: new Date(),
          })
          .where(eq(connectAccounts.id, row.id));
      }
    }

    if (reservationId) {
      const patch = reservationPaymentPatchForStripeEvent(event.type);
      if (patch) {
        await db
          .update(reservationPayments)
          .set(patch)
          .where(eq(reservationPayments.reservationId, reservationId));
      }
    }

    if (event.type === 'payout.paid' && typeof obj.id === 'string') {
      await db
        .update(payouts)
        .set({ status: 'paid', updatedAt: new Date() })
        .where(eq(payouts.stripeTransferId, obj.id as string));
    }
    if (event.type === 'payout.failed' && typeof obj.id === 'string') {
      await db
        .update(payouts)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(payouts.stripeTransferId, obj.id as string));
    }
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
