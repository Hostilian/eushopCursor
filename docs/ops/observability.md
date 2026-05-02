# Observability and incidents

## Sentry (optional)

- Set `SENTRY_DSN` on API and `NEXT_PUBLIC_SENTRY_DSN` on web/admin if using Sentry’s Next SDK in the browser.
- Web includes a stub [`apps/web/src/instrumentation.ts`](../../apps/web/src/instrumentation.ts) hook — replace the log line with `@sentry/nextjs` `Sentry.init` when you add the dependency.
- Scrub PII (emails, tokens) in `beforeSend`; EU region if required by DPA.

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
