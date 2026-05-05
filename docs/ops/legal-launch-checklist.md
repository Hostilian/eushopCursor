# Legal launch checklist (web + payments)

Use with counsel before enabling **in-app trip payments** and **KYC-gated badges** in production.

## Imprint and press

- Set production values for `NEXT_PUBLIC_LEGAL_REGISTERED_NAME`, `NEXT_PUBLIC_LEGAL_REGISTERED_OFFICE`, `NEXT_PUBLIC_LEGAL_REGISTER_ID`, `NEXT_PUBLIC_LEGAL_VAT_ID`, `NEXT_PUBLIC_LEGAL_SUPERVISORY_NOTE`, and `NEXT_PUBLIC_PRESS_EMAIL` (see [environment.md](./environment.md)).
- Confirm [`/imprint`](../../apps/web/src/app/(marketing)/imprint/page.tsx) and [`/press`](../../apps/web/src/app/(marketing)/press/page.tsx) render counsel-approved copy with no bracketed placeholders.

## Terms and Privacy

- Track counsel review in **[terms-privacy-payments-review.md](./terms-privacy-payments-review.md)** (human-owned; pair with sell-ready tasks **EUSHOP-O-001** / **EUSHOP-A-001** in [cursor-parallel-backlog.md](../cursor-parallel-backlog.md) when payments copy ships).
- **Peer-to-peer role**: Terms should describe Eushop as introductions, identity, chat, and (where enabled) payment **infrastructure**, not as seller of the goods or carrier.
- **Payments**: When Stripe Connect and manual-capture holds are live, add or update sections on: authorization vs capture, refunds, disputes/chargebacks, and platform fee disclosure (aligned with [`calculatePlatformFeeCents`](../../packages/validators/src/index.ts)).
- **KYC / verified bringer**: If you show a verified badge, Privacy should cover identity verification data, vendor subprocessors, retention, and user rights; Terms should not over-claim liability for third-party verification outcomes.

## Ongoing

- Re-review when adding **listing** checkout, auctions, or new countries.
