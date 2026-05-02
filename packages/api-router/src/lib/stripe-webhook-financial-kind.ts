import { financialEventKindEnum } from '@eushop/db';

export type FinancialEventKind = (typeof financialEventKindEnum.enumValues)[number];

/**
 * Maps Stripe `event.type` to the `financial_events.kind` we persist.
 * Unknown types return `null` (handler may still log / skip insert).
 */
export function mapStripeEventTypeToFinancialKind(eventType: string): FinancialEventKind | null {
  switch (eventType) {
    case 'payment_intent.created':
      return 'payment_intent.created';
    case 'payment_intent.requires_action':
      return 'payment_intent.requires_action';
    case 'payment_intent.succeeded':
    case 'payment_intent.amount_capturable_updated':
      return 'payment_intent.succeeded';
    case 'payment_intent.canceled':
      return 'payment_intent.canceled';
    case 'charge.captured':
    case 'charge.succeeded':
      return 'charge.captured';
    case 'charge.refunded':
      return 'charge.refunded';
    case 'charge.dispute.created':
      return 'charge.dispute.created';
    case 'charge.dispute.closed':
      return 'charge.dispute.closed';
    case 'transfer.created':
      return 'transfer.created';
    case 'transfer.failed':
      return 'transfer.failed';
    case 'payout.paid':
      return 'payout.paid';
    case 'payout.failed':
      return 'payout.failed';
    case 'account.updated':
      return 'connect.account.updated';
    default:
      return null;
  }
}
