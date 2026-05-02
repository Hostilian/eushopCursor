# Investor deck access (`INVESTOR_ACCESS_TOKENS`)

The [`/investors`](../../apps/web/src/app/(marketing)/investors/page.tsx) route is gated by tokens from `INVESTOR_ACCESS_TOKENS` (comma-separated) on the **API** runtime that serves auth/session — see [`.env.example`](../../.env.example).

## Policy

- Generate long random tokens per recipient or per campaign; store only in a secret manager.
- **Rotate** after team changes, leaks, or when a fundraising round closes — revoke old tokens in the env and redeploy.
- Do not commit tokens; use distinct values per environment (staging vs production).
- Prefer short-lived links or SSO for external data rooms when sensitivity increases; treat tokens as **shared secrets**, not user passwords.
