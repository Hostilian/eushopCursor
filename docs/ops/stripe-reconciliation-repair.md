# Stripe reconciliation and manual repair

Companion to [stripe-e2e-matrix.md](./stripe-e2e-matrix.md). Use when admin [Payments](../../apps/admin/src/app/payments/page.tsx) disagrees with Stripe Dashboard.

## Admin surfaces

- **Reservation payments**: `payments.adminListReservationPayments` → `reservation_payments` (PI id, status, amounts, capture time).
- **Payouts**: `payments.adminListPayouts` → `payouts` (gross/fee/net, `stripe_transfer_id`, status).
- **Connect**: `payments.adminListConnectAccounts` (also on Audit).
- **Events**: `financial_events` in DB vs Stripe **Events** (same `evt_` id after webhook).

## Manual repair (ops)

1. Identify the **PaymentIntent** in Stripe; note status (`requires_capture`, `succeeded`, `canceled`).
2. Find the row in `reservation_payments` by `stripe_payment_intent_id`.
3. If the webhook never arrived, use **Stripe Dashboard → Send test webhook** or replay; ensure `STRIPE_WEBHOOK_SECRET` matches the endpoint environment.
4. If DB must be patched after counsel/Stripe support decision, update `reservation_payments.status` / timestamps and append an internal audit note (do not edit `financial_events` rows; add a new support entry if you model one).

## Optional automation

- An **Inngest** cron can list `reservation_payments` stuck in `requires_capture` with reservations already `cancelled` and cancel the PI via API — not shipped by default; add under `apps/api/src/inngest/functions/` when ops volume justifies it.
