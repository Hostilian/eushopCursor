# Verified-bringer (KYC) badge

Goal: attest that a trip seller’s **passport country** (or equivalent) matches expectations before showing a **verified bringer** badge on profile and trip surfaces.

## Operational path (today)

1. Operator completes KYC out-of-band (Veriff, Onfido, manual document check).
2. In **Admin → Users & moderation**, use **Verified bringer** tool: enter the user’s UUID and grant or revoke the badge.
3. The profile’s `badges` JSON array gains or loses the string `verified_bringer` (no separate KYC table yet).

## Environment (vendor integration)

Placeholders in [`.env.example`](../../.env.example): `VERIFF_API_KEY`, `VERIFF_BASE_URL`, `VERIFF_WEBHOOK_SECRET` (rename for Onfido if you switch vendors).

## Future automation

- Webhook from Veriff/Onfido → API route → set badge + audit row.
- Trip creation optional rule: require badge for offers above N slots or € fee (product policy).
- Admin audit: link moderation actions to KYC decision IDs.
