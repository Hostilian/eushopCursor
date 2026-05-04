# Zero-profit / zero-SaaS posture (honest inventory)

This document is the **canonical map** of external services referenced in the monorepo (env vars, dependencies, and ops docs). Use it when you **cannot spend on SaaS** or want **self-hostable / optional** integrations only.

**Reality check:** “100% free forever” for a marketplace with cards, email at scale, and always-on infra is **not honest**. Some capabilities **always** involve regulated processors (card networks, licensed identity vendors) or infrastructure someone pays for (a VPS, power, bandwidth). This table marks what is **optional**, **self-hostable OSS**, or **vendor-locked**, and the recommended stance until revenue.

**Deploy topology:** See [oss-self-hosted-deploy.md](./oss-self-hosted-deploy.md) (Coolify-first, Docker) and [environment.md](./environment.md) for the full env matrix.

## Service inventory (code + `.env.example`)

| Integration | Where used | Class | Default without keys / self-host |
|-------------|------------|-------|-----------------------------------|
| **PostgreSQL** | `DATABASE_URL`, Drizzle, API | **A** — OSS, self-host | Required for real product; local `docker compose` / managed Postgres. |
| **Redis** | `REDIS_URL`, API rate limits | **A** — OSS | Optional; many paths degrade or no-op when unset (see [build-runtime.md](./build-runtime.md)). |
| **Meilisearch** | `MEILI_*`, catalog search | **A** — OSS | Optional for demos; search degrades without Meili. |
| **Better Auth** | `BETTER_AUTH_*`, `@eushop/auth` | **A** — OSS library | Self-hosted; magic links need *some* mail path (below). |
| **Google / Apple OAuth** | `GOOGLE_*`, `APPLE_*` | **C** — vendor IdPs | Optional; leave unset to disable social login. |
| **Resend** | Magic link (`packages/auth`), transactional (`apps/api` notify) | **B** — paid SaaS API | **No key → log to console** (magic links); notify emails skip Resend and log (`notify.ts`). **Replacement:** any SMTP-capable MTA (Postfix, Mailpit in CI, etc.) — *not* wired in code yet; add a small adapter if you need SMTP instead of Resend. |
| **Mailhog** | `docker compose` (local) | **A** — OSS | Dev-only inbox at `:8025`; not for production. |
| **Cloudflare R2** | `R2_*`, `packages/api-router` media router | **B** — vendor object storage (S3 API) | Without keys, presign/upload paths fail fast where implemented — treat uploads as **off** until you configure R2 **or** point the same S3-compatible env at **MinIO** / Garage / AWS S3 (code uses R2-style account endpoint; confirm compatibility before swapping). |
| **Inngest** | `inngest` package, `/api/inngest`, `enqueueEvent` | **C** — cloud job plane (OSS SDK) | **`INNGEST_EVENT_KEY` unset:** Next.js tRPC callers already no-op (`packages/api-router/src/context.ts`); **API** skips `inngest.send` when the key is unset (same contract). Cron/workers still need a **dev server** or **self-hosted Inngest** + signing keys for `/api/inngest`. |
| **PartyKit** | `apps/party`, `PARTYKIT_HOST` | **C** — hosted realtime (local dev server) | Local `partykit dev`; production is PartyKit’s hosted model unless you fork architecture. Chat is optional for catalog browsing. |
| **Stripe Connect** | `STRIPE_*`, web Elements, webhooks | **C** — regulated payments | **No `STRIPE_SECRET_KEY`:** no PaymentIntents, Connect onboarding hidden/disabled in UI; reservations can still exist off-card (see i18n `stripeKeyMissing`). **Do not remove** payment code paths when keys are set. |
| **Veriff / Onfido** | `VERIFF_*`, `KYC_VENDOR`, `trust` router | **C** — regulated KYC | **`manual`** / missing vendor keys → badge flows off or manual ops; see [verified-bringer-kyc.md](./verified-bringer-kyc.md). |
| **Expo push** | `EXPO_PUSH_ACCESS_TOKEN`, `notify.ts` | **C** — Expo cloud API | No token → push attempts fail softly; mobile still works without push. |
| **Sentry** | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, optional deps | **B** — SaaS (self-hostable) | **No DSN → no init** (`apps/api`, `apps/web`, `apps/admin`). **Replacement:** self-hosted Sentry or [GlitchTip](https://glitchtip.com/) (Sentry-compatible ingest). |
| **PostHog** | `POSTHOG_*`, `NEXT_PUBLIC_POSTHOG_*`, consent banner | **B** — SaaS (self-hostable) | **No public key → no client init**; consent required before init. **Replacement:** self-hosted PostHog, Plausible, Matomo — swap `NEXT_PUBLIC_POSTHOG_HOST` if you self-host PostHog. |
| **GitHub Actions** | `.github/workflows/ci.yml` | **D** — CI vendor | Free tier for public/open-source style usage; brings **no runtime** dependency. |
| **Neon / Coolify / Hetzner** | docs only | **D** — infra choices | Mentioned as **patterns**, not hardcoded SDK dependencies. |

**Legend:** **A** = OSS you run yourself · **B** = replaceable SaaS or swap with self-host OSS · **C** = core vendor/regulated or hosted plane — keep code, **gate on env** · **D** = platform/docs, not app runtime.

## What cannot be “pure OSS + €0”

| Capability | Why | Recommended stance until revenue |
|------------|-----|-----------------------------------|
| **Card payments (Stripe)** | Card networks and PSP licensing | Keep Stripe **optional**; document “payments off” for demos; never assume keys exist. |
| **Deliverability at scale** | SMTP reputation, SPF/DKIM, abuse controls | Use Mailhog/dev logs without budget; production mail is **never** zero-cost at quality — plan Postfix + domain or a transactional provider when funded. |
| **Government-grade KYC** | Regulated identity vendors | Feature-flag / env-gate Veriff/Onfido; use `manual` review in small pilots. |
| **Mobile push** | Apple/Google push infrastructure | Expo still talks to Apple/Google; token is “free tier” bounded. |

## Related docs

- [observability.md](./observability.md) — Sentry + PostHog runbooks  
- [stripe-connect.md](./stripe-connect.md) — when Stripe is on  
- [hosting-contract.md](./hosting-contract.md) — build/start contract for any host  
