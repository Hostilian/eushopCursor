# Stripe Connect (platform fees)

Trip reservations freeze a **platform fee** via [`calculatePlatformFeeCents`](../../packages/validators/src/index.ts). Today settlement is in person; Connect is the path to collecting that fee in-app.

## Environment

See [`.env.example`](../../.env.example): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, optional `STRIPE_CONNECT_CLIENT_ID`.

## API surface (stub)

- tRPC `payments.capabilities` — whether `STRIPE_SECRET_KEY` is set (public).
- tRPC `payments.connectOnboardingUrl` — `PRECONDITION_FAILED` without secret; otherwise `NOT_IMPLEMENTED` until Express/Custom Connect onboarding is implemented.
- HTTP `POST /webhooks/stripe` on the API server — returns `501` when `STRIPE_WEBHOOK_SECRET` is unset; verify signatures with the Stripe SDK before trusting events.

## Implementation checklist (next PRs)

1. **Connect Express** accounts for sellers; store `stripe_connect_account_id` on `users` or `profiles` (migration).
2. **PaymentIntent** or **Checkout** for platform fee on `trip_reservations` state transition to `confirmed` / `completed` (product decision).
3. **Webhook** handlers: `account.updated`, `payment_intent.succeeded`, disputes; update `payouts` / reservation rows.
4. **Idempotency** keys per reservation; reconciliation job for stuck states.
5. **Legal**: update Terms/Privacy for regulated payments and refund policy (counsel).
