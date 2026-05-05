# Observability and incidents

## Sentry (optional)

- Set `SENTRY_DSN` on API and `NEXT_PUBLIC_SENTRY_DSN` on web/admin if using Sentry’s Next SDK in the browser.
- Web [`instrumentation.ts`](../../apps/web/src/instrumentation.ts) calls `Sentry.init` on the **Node** runtime when `SENTRY_DSN` is set and `@sentry/nextjs` is installed (otherwise logs a one-line hint). Add the dependency to `apps/web` when you enable it; tune `beforeSend` for PII and use the EU DSN/host if required by your DPA.
- [`apps/web/src/app/error.tsx`](../../apps/web/src/app/error.tsx) is the app error boundary (client `reset()` + home link). Call `Sentry.captureException(error)` from `useEffect` there when the browser SDK is active.

## PostHog (optional)

- Use `POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_KEY` and EU `POSTHOG_HOST` (default in `.env.example`).
- **Consent-first:** [`apps/web/src/providers.tsx`](../../apps/web/src/providers.tsx) only calls `initPostHog()` when `localStorage` (`eushop.consent.v1`) already has `analytics: true`; [`consent-banner.tsx`](../../apps/web/src/components/layout/consent-banner.tsx) calls `initPostHog()` when the user taps **Accept analytics**. Do not initialize before that.
- **Release check:** With analytics keys present, load the site in a private window — verify Network tab shows **no** `posthog.com` requests until consent is accepted (maps backlog **EUSHOP-A-018**).

## Rate limits (API)

Per-IP sliding windows in [`apps/api/src/rate-limit.ts`](../../apps/api/src/rate-limit.ts): `API_RATE_LIMIT_PER_MIN` (default **240**) on `/trpc`, `API_AUTH_RATE_LIMIT_PER_MIN` (**60**) on auth-heavy routes, looser limits on `/health` and Inngest. Router-level caps also apply (e.g. [`packages/api-router/src/routers/media.ts`](../../packages/api-router/src/routers/media.ts) `rateLimited` scopes). Tune env vars when prod traffic exceeds assumptions (**EUSHOP-B-006**).

## Abuse reports

User reports land via [`trust.report`](../../packages/api-router/src/routers/trust.ts) → `reports` table; operators use admin **Users & moderation** (`trust.moderationQueue`) and [`audit`](../../apps/admin/src/app/audit/page.tsx) (**EUSHOP-B-007**). Escalation workflow stays product/legal owned — keep DB review under 24h SLA when queue is non-empty.

## Runbooks (quick)

| Symptom | Checks |
|---------|--------|
| Auth failures | `BETTER_AUTH_SECRET` length, `BETTER_AUTH_URL` matches deployed API, cookie domain. |
| Empty search | Meilisearch up, `pnpm search:index`, `MEILI_HOST` / key. |
| Jobs not running | Inngest dashboard, `INNGEST_SIGNING_KEY`, API `/api/inngest` reachable. |
| Chat down | `PARTYKIT_HOST`, PartyKit deploy status. |
| Upload failures | R2 credentials, bucket CORS, `R2_PUBLIC_URL`. |

## Status page

Optional: external status (e.g. Better Stack, Instatus) listing **API** (`/health`), **web**, **admin**, **PartyKit**, and **email** (Resend) as separate components. Link it from `/press` or the footer only after the page is live—avoid broken promises during private beta.

## CI and lint migration

- Run **`pnpm verify`** at the repo root before merging substantive changes (format, typecheck, lint, unit tests, build).
- Moving off `next lint` is tracked in [`docs/eslint-next-migration.md`](../eslint-next-migration.md).
