# Verified-bringer (KYC) badge

Goal: attest that a trip seller’s **passport country** (or equivalent) matches expectations before showing a **verified bringer** badge on profile and trip surfaces.

## Operational path (today)

1. Operator completes KYC out-of-band (Veriff, Onfido, manual document check).
2. In **Admin → Users & moderation**, use **Verified bringer** tool: enter the user’s UUID and grant or revoke the badge.
3. The profile’s `badges` JSON array gains or loses the string `verified_bringer`.

The schema also includes **`kyc_sessions`** ([`packages/db/src/schema/payments.ts`](../../packages/db/src/schema/payments.ts)) for vendor session tracking; automation (webhook → API → badge) can write here while still updating `profiles.badges` for display. Until webhooks ship, sessions may be empty and the badge remains **operator-driven**.

## Environment (vendor integration)

The API reads **`KYC_VENDOR`** (`veriff` \| `onfido` \| `manual`, default `manual`) from [`trust.startKyc`](../../packages/api-router/src/routers/trust.ts). Placeholders in [`.env.example`](../../.env.example): **`KYC_VENDOR`**, `VERIFF_API_KEY`, `VERIFF_BASE_URL`, optional **Onfido** token when you wire `onfido`. Add **`VERIFF_WEBHOOK_SECRET`** when you expose a webhook route for automated decisions (see Future automation).

## Future automation

- Webhook from Veriff/Onfido → API route → set badge + audit row.
- Trip creation optional rule: require badge for offers above N slots or € fee (product policy).
- Admin audit: link moderation actions to KYC decision IDs.
