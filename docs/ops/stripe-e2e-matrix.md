# Stripe trip payments — E2E matrix and webhooks

Companion to [stripe-connect.md](./stripe-connect.md). Use for QA staging and reconciliation playbooks.

## Happy paths (manual QA)

| Step | Seller Connect | Buyer | Expected |
|------|----------------|-------|----------|
| Reserve | `chargesEnabled` | Signed in | Slot decrements; optional `paymentClientSecret` when PI created |
| Reserve | No Connect / not enabled | Signed in | Reservation only; no `reservation_payments` row from PI |
| Confirm | — | Seller | Reservation `confirmed`; PI **captured** when present |
| Complete | — | Both sides per product rules | Payout / ledger as implemented |
| Cancel (buyer/seller) | — | — | PI cancelled or refunded per branch in `trips` router |

Run with Stripe test mode, test cards, and a Connect Express test account.

## Webhook → `financial_events.kind`

Handled mappings live in [`mapStripeEventTypeToFinancialKind`](../../packages/api-router/src/lib/stripe-webhook-financial-kind.ts) (used by [`stripe-webhook.ts`](../../apps/api/src/routes/stripe-webhook.ts)).

| Stripe `event.type` | Stored `kind` |
|---------------------|---------------|
| `payment_intent.created` | `payment_intent.created` |
| `payment_intent.requires_action` | `payment_intent.requires_action` |
| `payment_intent.succeeded` | `payment_intent.succeeded` |
| `payment_intent.amount_capturable_updated` | `payment_intent.succeeded` |
| `payment_intent.canceled` | `payment_intent.canceled` |
| `charge.captured`, `charge.succeeded` | `charge.captured` |
| `charge.refunded` | `charge.refunded` |
| `charge.dispute.created` | `charge.dispute.created` |
| `charge.dispute.closed` | `charge.dispute.closed` |
| `transfer.created` | `transfer.created` |
| `transfer.failed` | `transfer.failed` |
| `payout.paid` | `payout.paid` |
| `payout.failed` | `payout.failed` |
| `account.updated` | `connect.account.updated` |

Other types log `[stripe webhook] unhandled` and **do not** receive a mapped `kind` (no `financial_events` row for those unless you extend the mapper).

## Side effects (summary)

- `account.updated`: refresh `connect_accounts` flags.
- Payment / charge / dispute events (subset): patch `reservation_payments` when `reservationId` resolves.
- `payout.paid` / `payout.failed`: update `payouts` by `stripeTransferId`.

## Stuck states (ops)

| Symptom | Checks |
|---------|--------|
| Reservation pending, PI succeeded in Dashboard | Confirm seller called `confirmReservation`; webhook `payment_intent.succeeded` applied |
| PI authorized, never captured | Seller confirm path or manual capture in Dashboard; then align DB |
| `reservation_payments` out of sync | Compare Stripe PI status vs row; replay event or patch with audit note |
| Payout stuck | `payouts` row vs Stripe payout; verify `stripeTransferId` linkage |

Optional: periodic job comparing open reservations with PI status (document in Inngest when built).
