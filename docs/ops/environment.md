# Production environment matrix

Copy from [`.env.example`](../../.env.example) and set **real** values per deployment (Coolify, Docker/Kubernetes, bare metal, etc.). Never commit secrets.

**Cost / SaaS posture:** [zero-cost-stack.md](./zero-cost-stack.md) lists which variables are optional, which vendors are replaceable, and what cannot be free forever (cards, deliverability at scale).

## Required for a functioning marketplace

| Variable | Used by | Production notes |
|----------|---------|-------------------|
| `DATABASE_URL` | API, migrations, Drizzle | TLS URL, pooler if serverless workers; run `pnpm --filter @eushop/db migrate` on deploy. |
| `REDIS_URL` | API (rate limits, sessions if configured) | Persistent Redis; EU region. |
| `BETTER_AUTH_SECRET` | `@eushop/auth`, web/admin builds | **≥32 characters**, must **not** equal the dev fallback string in [`packages/auth/src/index.ts`](../../packages/auth/src/index.ts). Set in **every** runtime that imports `auth` (API, web SSR, admin). The admin app’s local build script only injects a throwaway value when this is **unset**—production deploys **must** set the real secret. |
| `BETTER_AUTH_URL` | Auth | Public API base, e.g. `https://api.eushop.eu`. |
| `NEXT_PUBLIC_SITE_URL` | Web, sitemap, OG | Canonical site URL, e.g. `https://eushop.eu`. |
| `NEXT_PUBLIC_API_URL` | Web, admin (tRPC from browser) | Public API origin for `/trpc`. |
| `MEILI_HOST` / `MEILI_MASTER_KEY` | API indexing | Production Meilisearch; rotate master key; run `pnpm search:index` after deploy/migrations when needed. |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | API, Inngest dashboard | Same event pipeline as configured in Inngest Cloud; signing key for `/api/inngest`. Without `INNGEST_EVENT_KEY`, API and Next.js callers **do not** emit outbound events (safe no-op for demos). |

## Email, storage, realtime

| Variable | Notes |
|----------|--------|
| `RESEND_API_KEY` / `EMAIL_FROM` | Magic links and transactional mail; without key, dev logs links (see README). |
| `R2_*` / `R2_PUBLIC_URL` | Media uploads; align `NEXT_PUBLIC_MEDIA_HOSTNAME` with `next/image` remote patterns if needed. |
| `PARTYKIT_HOST` | Production PartyKit URL; match `NEXT_PUBLIC_PARTYKIT_HOST` on web/mobile. |
| `EXPO_PUSH_ACCESS_TOKEN` | Expo push for mobile prod. |
| `EXPO_PUBLIC_SITE_URL` | Mobile → web deep links (e.g. payment completion); match `NEXT_PUBLIC_SITE_URL` per environment ([mobile-payments-parity.md](./mobile-payments-parity.md)). |

## Optional / feature flags

### Stripe staging E2E (sell-ready checklist)

Run this once per staging environment so Connect, card holds, and webhooks are proven end-to-end:

1. **Secrets:** Set `STRIPE_SECRET_KEY` (test mode), `STRIPE_WEBHOOK_SECRET` from Stripe CLI or Dashboard webhook endpoint, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` on the web app. See [stripe-connect.md](./stripe-connect.md) for variable roles.
2. **Webhook URL:** Stripe Dashboard (or `stripe listen --forward-to https://<api>/webhooks/stripe`) must hit the API route handled in [`apps/api/src/routes/stripe-webhook.ts`](../../apps/api/src/routes/stripe-webhook.ts). Mismatched signing secret is the most common 400.
3. **Happy path:** Seller completes Connect Express onboarding (`charges_enabled` true) → buyer reserves a trip slot (PaymentIntent created) → buyer confirms payment in web Elements → seller **confirms** reservation (capture attempted) → Stripe sends events → `financial_events` / `reservation_payments` rows update (verify in admin **Payments** or DB).
4. **Idempotency:** Replay the same `evt_…` in Stripe CLI; the API should respond with `{ idempotent: true }` after the first persist (unique `stripe_event_id` on `financial_events`). Maps to backlog **EUSHOP-O-001** (staging proof) and **EUSHOP-B-001** (replay spot-check after deploy).

Document any staging-only URLs or CLI commands in your team wiki; keep this matrix limited to **which variables and routes must exist**.

| Variable | Notes |
|----------|--------|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | See [stripe-connect.md](./stripe-connect.md). |
| `KYC_VENDOR`, `VERIFF_API_KEY`, `VERIFF_BASE_URL`, optional `VERIFF_WEBHOOK_SECRET`, optional Onfido token | [verified-bringer-kyc.md](./verified-bringer-kyc.md), [`trust.startKyc`](../../packages/api-router/src/routers/trust.ts). |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | See [observability.md](./observability.md). |
| `POSTHOG_KEY`, `POSTHOG_HOST` (server), `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (web) | EU PostHog; respect consent banner. |
| `INVESTOR_ACCESS_TOKENS` | Comma-separated tokens for `/investors`; rotate per policy. |
| `ENABLE_DEMO_MODE` | Set to `1` only on staging or controlled demos so `?demo=1` can show a labelled catalog showcase. Omit in production. |
| `NEXT_PUBLIC_LEGAL_REGISTERED_NAME`, `NEXT_PUBLIC_LEGAL_REGISTERED_OFFICE`, `NEXT_PUBLIC_LEGAL_REGISTER_ID`, `NEXT_PUBLIC_LEGAL_VAT_ID`, `NEXT_PUBLIC_LEGAL_SUPERVISORY_NOTE` | Imprint (`/imprint`); required for launch copy (defaults are bracketed dev hints). |
| `NEXT_PUBLIC_PRESS_EMAIL` | Press contact shown on `/press`; defaults to `press@eushop.eu` if unset. |
| `NEXT_PUBLIC_OPERATIONS_EMAIL`, `NEXT_PUBLIC_OPERATIONS_PHONE_E164` | Shown on `/contact`, `/help`, `/careers`, and `/imprint` when set; use deploy secrets only. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, Apple vars | Social login when enabled. |

## Health checks

| Mode | When to use |
|------|----------------|
| `GET /health` | Default load-balancer probe; returns `{ ok: true, ts }`. |
| `GET /health?deep=1` with `HEALTHCHECK_DEEP=1` on the API | Optional dependency check: runs `select 1` against `DATABASE_URL`; returns **503** with `{ checks: { database: 'fail' } }` if Postgres is unreachable. Leave `HEALTHCHECK_DEEP` unset unless you intentionally want probes to hit the DB. |

## CI reference

GitHub Actions [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) sets a **non-secret** `BETTER_AUTH_SECRET` for builds only. Production values must come from your secret store, not from CI defaults.

CI exports `MEILI_HOST` / `MEILI_MASTER_KEY` but does **not** start Meilisearch or Redis containers — `pnpm build` must not require a live Meili or Redis connection at compile time. Runtime features that need those services belong in integration tests or staging, not in the default build graph.
