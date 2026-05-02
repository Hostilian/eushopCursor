# Terms and Privacy — payments review checklist (counsel)

Internal tracker aligned with [legal-launch-checklist.md](./legal-launch-checklist.md). Update when Stripe Connect trip checkout or KYC changes.

## Terms ([`apps/web/src/app/(marketing)/terms/page.tsx`](../../apps/web/src/app/(marketing)/terms/page.tsx))

| Topic | Status | Notes |
|-------|--------|--------|
| Platform role vs seller of goods | Review | Peer introductions + optional payment infrastructure. |
| Trip payments: authorize vs capture | Review | Manual capture; traveller confirms before capture. |
| Platform fee formula | Review | Must match [`calculatePlatformFeeCents`](../../packages/validators/src/index.ts). |
| Refunds / cancellations | Review | Who initiates, timing vs departure. |
| Card disputes / chargebacks | Review | Issuer process; platform as Connect facilitator. |
| Listing finder fees (off-platform) | Review | Still accurate where trips use Stripe. |

## Privacy ([`apps/web/src/app/(marketing)/privacy/page.tsx`](../../apps/web/src/app/(marketing)/privacy/page.tsx))

| Topic | Status | Notes |
|-------|--------|--------|
| Card data (Stripe) | Review | Processor role; what we do not store vs what Stripe holds. |
| Payment metadata in our DB | Review | Reservation amounts, PI ids, reconciliation. |
| KYC / verified bringer | Review | Vendor subprocessor, retention, legal basis. |
| PostHog / analytics | Review | Consent-first; EU hosting claim. |

## Product copy

| Surface | Purpose |
|---------|---------|
| Reservations list | High-level refunds/disputes pointer + Terms link. |
| Reservation / pay step | Hold vs capture; disputes summary + Terms anchor. |

## Operator / engineering (P0)

- Staging Stripe E2E and webhook idempotency checks: [stripe-e2e-matrix.md](./stripe-e2e-matrix.md) (Priority 0 section). Does not replace counsel sign-off above.

Last updated: product copy reflects optional trip checkout; **counsel must approve** before production claims.
