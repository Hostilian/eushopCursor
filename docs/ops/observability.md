# Observability and incidents

## Sentry (optional)

- Set `SENTRY_DSN` on API and `NEXT_PUBLIC_SENTRY_DSN` on web/admin if using Sentry’s Next SDK in the browser.
- Web [`instrumentation.ts`](../../apps/web/src/instrumentation.ts) calls `Sentry.init` on the **Node** runtime when `SENTRY_DSN` is set and `@sentry/nextjs` is installed (otherwise logs a one-line hint). Add the dependency to `apps/web` when you enable it; tune `beforeSend` for PII and use the EU DSN/host if required by your DPA.
- [`apps/web/src/app/error.tsx`](../../apps/web/src/app/error.tsx) is the app error boundary (client `reset()` + home link). Call `Sentry.captureException(error)` from `useEffect` there when the browser SDK is active.

## PostHog (optional)

- Use `POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_KEY` and EU `POSTHOG_HOST` (default in `.env.example`).
- Wire through the existing consent banner—do not load trackers before consent.

## Runbooks (quick)

| Symptom | Checks |
|---------|--------|
| Auth failures | `BETTER_AUTH_SECRET` length, `BETTER_AUTH_URL` matches deployed API, cookie domain. |
| Empty search | Meilisearch up, `pnpm search:index`, `MEILI_HOST` / key. |
| Jobs not running | Inngest dashboard, `INNGEST_SIGNING_KEY`, API `/api/inngest` reachable. |
| Chat down | `PARTYKIT_HOST`, PartyKit deploy status. |
| Upload failures | R2 credentials, bucket CORS, `R2_PUBLIC_URL`. |

## Status page

Optional: external status (e.g. Better Stack, Instatus) listing API + web + PartyKit components.

## CI and lint migration

- Run **`pnpm verify`** at the repo root before merging substantive changes (format, typecheck, lint, unit tests, build).
- Moving off `next lint` is tracked in [`docs/eslint-next-migration.md`](../eslint-next-migration.md).
