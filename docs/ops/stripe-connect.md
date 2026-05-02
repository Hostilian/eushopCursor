# Stripe Connect and trip reservation payments

Platform fee on trips: [`calculatePlatformFeeCents`](../../packages/validators/src/index.ts) (`min(150, round(0.12 × agreedSlotFeeCents))` in cents).

When **`STRIPE_SECRET_KEY`** is set, the stack supports **Stripe Connect Express** for sellers and **manual-capture PaymentIntents** on trip reservations (buyer → seller destination + application fee to the platform). Without Stripe, reservations still work; no card hold is created.

## Environment

From [`.env.example`](../../.env.example):

| Variable | Role |
|----------|------|
| `STRIPE_SECRET_KEY` | API: Connect, PaymentIntents, captures, refunds |
| `STRIPE_WEBHOOK_SECRET` | Verify `POST /webhooks/stripe` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Web: Stripe.js (confirm/collect payment method when you wire Elements) |
| `STRIPE_CONNECT_CLIENT_ID` | Optional OAuth-style flows if you add them |
| `KYC_VENDOR` | Optional label surfaced on `payments.capabilities` / manifesto |

## Webhook logs (operators)

After signature verification and idempotency, the API logs one JSON line per event:

`[stripe webhook] {"type":"…","evt":"evt_…","stripeObjectId":"…","reservationId":…,"financialKind":…}`

Search logs in staging/production to trace disputes, refunds, and PaymentIntent transitions alongside `financial_events` and admin **Payments**.

## tRPC: `payments`

Implemented in [`packages/api-router/src/routers/payments.ts`](../../packages/api-router/src/routers/payments.ts):

| Procedure | Access | Behaviour |
|-----------|--------|-----------|
| `capabilities` | public | `stripeConnectEnabled`, `kycVendor`, `platformFeeFormula` |
| `publicCapabilities` | public | `paymentsLive`, `kycVendor` (manifesto-style) |
| `myConnectAccount` | protected | Local `connect_accounts` row + latest `kyc_sessions` |
| `startConnectOnboarding` | protected | Creates Express account if needed, returns **Account Link** URL (`returnUrl` / `refreshUrl` from input). Requires verified user email. `PRECONDITION_FAILED` if Stripe unset. |
| `refreshConnectAccount` | protected | Re-pulls account from Stripe, updates local status (`active` / `restricted` / `pending`) |
| `adminListConnectAccounts` | admin | Join with users for ops |
| `adminListReservationPayments` | admin | Ledger rows |

Input: `connectOnboardingInput` from `@eushop/validators` (country ISO2, return/refresh URLs).

## Web UI (buyer + seller)

- **Profile:** [`apps/web/src/components/profile/profile-payouts-card.tsx`](../../apps/web/src/components/profile/profile-payouts-card.tsx) calls `startConnectOnboarding` / `myConnectAccount` so sellers can finish Express onboarding and refresh status.
- **Reservation checkout:** when `trips.reserve` returns `paymentClientSecret`, [`apps/web/src/components/trips/reservation-payment-step.tsx`](../../apps/web/src/components/trips/reservation-payment-step.tsx) mounts Stripe `Elements` + `PaymentElement` and confirms the PaymentIntent (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` required in the browser).

## Trips: money flow

Implemented in [`packages/api-router/src/routers/trips.ts`](../../packages/api-router/src/routers/trips.ts):

1. **`trips.reserve`** — Decrements slot; creates reservation with frozen platform fee. If seller has **`connect_accounts.chargesEnabled`**, creates a **manual-capture** PaymentIntent (destination = seller, `application_fee_amount` = platform fee), inserts [`reservation_payments`](../../packages/db/src/schema/payments.ts), logs [`financial_events`](../../packages/db/src/schema/payments.ts). Returns `paymentClientSecret` for the client when a PI was created. Stripe failures **do not** roll back the reservation (logged).
2. **`trips.confirmReservation`** (seller) — Sets reservation `confirmed`; **captures** the PaymentIntent when present (reconciliation via webhook if capture fails).
3. **`trips.completeReservation`** / **`cancelReservation`** / refund paths — Cancel PI, refund, or capture as implemented; see router for exact branches.

## HTTP: `POST /webhooks/stripe`

Handler: [`apps/api/src/routes/stripe-webhook.ts`](../../apps/api/src/routes/stripe-webhook.ts).

- **501** if `STRIPE_WEBHOOK_SECRET` missing.
- **400** on bad signature (Stripe SDK verify).
- **Idempotency**: duplicate `evt_…` ids are ignored after first persist on `financial_events`.
- **Side effects** (non-exhaustive): `account.updated` → refresh `connect_accounts`; payment / charge / dispute events → update `reservation_payments`; `payout.paid` / `payout.failed` → update trip `payouts` when keyed by `stripeTransferId`.
- Unknown `event.type` values are logged and still recorded when a `kind` is derived; see [stripe-e2e-matrix.md](./stripe-e2e-matrix.md) for the inventory.

## Reconciliation and ops

- Admin audit UI can use `payments.adminListConnectAccounts` and `payments.adminListReservationPayments`.
- Cross-check Stripe Dashboard with DB; see [stripe-e2e-matrix.md](./stripe-e2e-matrix.md) for stuck-state ideas.

## Legal

Update **Terms** and **Privacy** with counsel when in-app payments and KYC are live for your jurisdictions. Refund / chargeback policy should match product copy.
