/**
 * Stripe may deliver the same `evt_…` more than once. The HTTP handler records
 * each event in `financial_events` keyed by `stripe_event_id` (unique); when
 * a row already exists, processing must short-circuit.
 */
export function shouldProcessStripeWebhookEvent(existingRowCount: number): boolean {
  return existingRowCount === 0;
}
