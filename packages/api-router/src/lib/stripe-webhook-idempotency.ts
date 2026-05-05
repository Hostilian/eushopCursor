/**
 * Stripe may deliver the same `evt_…` more than once. The HTTP handler records
 * each event in `financial_events` keyed by `stripe_event_id` (unique); when
 * a row already exists, processing must short-circuit.
 */
export function shouldProcessStripeWebhookEvent(existingRowCount: number): boolean {
  return existingRowCount === 0;
}

type ReservationPaymentPatch = {
  status?: 'succeeded' | 'canceled' | 'refunded';
  capturedAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  disputedAt?: Date;
  updatedAt: Date;
};

/**
 * Produces the reservation_payments patch for Stripe event types that mutate
 * reservation payment lifecycle state. Returns null for event types that do
 * not affect reservation payment rows.
 */
export function reservationPaymentPatchForStripeEvent(
  eventType: string,
  now: Date = new Date(),
): ReservationPaymentPatch | null {
  const patch: ReservationPaymentPatch = { updatedAt: now };
  if (eventType === 'payment_intent.succeeded') {
    patch.status = 'succeeded';
    patch.capturedAt = now;
    return patch;
  }
  if (eventType === 'payment_intent.canceled') {
    patch.status = 'canceled';
    patch.cancelledAt = now;
    return patch;
  }
  if (eventType === 'charge.refunded') {
    patch.status = 'refunded';
    patch.refundedAt = now;
    return patch;
  }
  if (eventType === 'charge.dispute.created') {
    patch.disputedAt = now;
    return patch;
  }
  return null;
}
