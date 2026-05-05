# Eushop

> **Get something from somewhere. Bring something for someone.**

Eushop is the open peer layer for **trips**, **locals**, and **open asks**: spare
luggage capacity on routes people are already taking, finder-fee shares between
locals, and open asks that notify matching supply. Discovery, identity, and chat
first; trip reservations can use **Stripe Connect** holds when enabled — see ops docs — while many listings still settle off-platform.

The category is global. We are launching in dense **EU diaspora corridors** because that
is where the flows are best documented and the community is ready — and we are designing
every primitive (geo cells, identity, chat, fees) to travel anywhere people travel.

Large-scale cross-border mobility in Europe is a long-standing statistical fact, not a
vendor TAM we invent here. When we mention that context in marketing copy, we point to
official sources from **2007 or earlier** (plus Eurostat’s first 2007 headline release,
documented in 2008)—see **[docs/pre-2008-sources.md](docs/pre-2008-sources.md)** and the
public web bibliography at **`/sources`**.

Three primitives, one network:

1. **Trip offers** — a verified user announces a trip ("Munich → Warsaw,
   May 14, 6 bag slots, here's what I'll grab"), each slot reservable at an
   **agreed fee per slot**. *Reservations are the monetisable event.*
2. **Open asks** — a buyer posts what they want; matching trips and listings
   in the same corridor or radius light it up automatically.
3. **Local listings** — neighbourhood-scale finder-fee posts ("half a tin of
   Krówki, €3, pickup at Goetheplatz") with privacy-preserving geohash discovery.

We charge a small platform fee on each confirmed reservation:
`platformFee = min(€1.50, 12% × finderFee)` (the Zod field name is historical; trip UI
calls this an **agreed slot fee**). Settlement of the goods themselves stays between
the parties — we are introductions, identity, and chat, not customs, freight, or
regulated payments.

> Discovery is tied to **places, routes, and corridors**. Profiles are photo-forward
> and trust-graphed. Listings and trips render with a 5 km privacy cell and
> deterministic jitter so handoffs stay practical without exposing anyone's home.

## Product scope (shipped vs roadmap)

**In this repo today**

- **Trip marketplace** (`/trips`, `/trips/new`, `/reservations`) on web and mobile,
  backed by `trip_offers`, `trip_reservations`, `payouts` schemas and a full
  `trips` tRPC router (create / search / reserve / confirm / complete / cancel).
- **Hybrid product catalog** — curated taste-of-home foods + Open Food Facts
  importer (CC-BY-SA, attributed in-app) + UGC moderation queue
  (`food_item_candidates`, `food_item_image_proposals`).
- **Product picker** with three image candidates, photo upload, paste-image-URL
  (server-side download + R2 re-host), and "propose this product" UGC flow.
- **Local listings & open asks** with PostGIS, Meilisearch, and privacy geohash cells.
- **Realtime chat** (PartyKit Durable Objects), Better Auth, Inngest workflows
  (Open Food Facts importer, trip-reservation notifications, departure reminders),
  and an admin moderation cockpit.
- **Investor surfaces** — public `/manifesto`, live `/traction` (real DB counts,
  never invented), and a token-gated `/investors` deck rendered from
  `apps/web/content/pitch.md`. Optional `ENABLE_DEMO_MODE` + `?demo=1` on staging
  shows a **labelled** catalog-derived showcase when the DB is empty; production
  leaves this off so empty states stay honest.

**Roadmap (direction of travel)**

- **Stripe Connect** — trip reservations mint manual-capture PaymentIntents when the seller has charges enabled; see [`docs/ops/stripe-connect.md`](docs/ops/stripe-connect.md). Listing checkout and mobile card capture remain roadmap.
- **Verified-bringer badge** (Veriff/Onfido passport-country attestation); badge surfaces on trip detail when `verified_bringer` is in profile badges.
- **Group-buys**, restock alerts, pickup hubs, multilingual catalog search,
  city leaderboards. Tracked in `[/roadmap](apps/web/src/app/(marketing)/roadmap/page.tsx)`.

Hosted in the EU by default — Hetzner Falkenstein, CDN via Cloudflare EU.

**Show friends the real app (not the Pages stub):** self-host **Coolify** (MIT) on a VPS and run **web** + **API** as separate services from this repo — step-by-step in **[docs/ops/oss-self-hosted-deploy.md](docs/ops/oss-self-hosted-deploy.md)** (FOSS stack; VPS is typically low cost — see doc for honest “no free lunch at scale” notes). **If you will not use a VPS:** see **[docs/ops/hosting-alternatives.md](docs/ops/hosting-alternatives.md)** (what “OSS Vercel-like” means vs managed PaaS). GitHub Pages here is only an **optional static stub**, not the product.

## Stack (validated 2026)

- **Monorepo** — Turborepo + pnpm
- **Web** — Next.js 15 · Tailwind v4 · shadcn-style components · Framer Motion · next-intl
- **Mobile** — Expo SDK 54 · Expo Router v4 · NativeWind v4 · Moti
- **API** — Hono on Bun-or-Node · tRPC v11 · Better Auth · Zod
- **Data** — PostgreSQL 17 + PostGIS + pgvector · Drizzle ORM · Meilisearch · Redis
- **Realtime** — PartyKit (Cloudflare Durable Objects)
- **Jobs** — Inngest
- **Storage** — Cloudflare R2
- **Hosting (production)** — Hetzner Cloud (EU) + Coolify · Cloudflare CDN
- **Preview / friend demos** — self-hosted Coolify + Docker or pnpm build ([OSS self-hosted deploy](docs/ops/oss-self-hosted-deploy.md)); GitHub Pages ships a static mirror only

The trip marketplace (`trip_offers`, `trip_reservations`, `payouts`) is the
monetisable complement to listings and requests; the platform fee on each confirmed
reservation is the take rate that powers the YC-style unit economics in
`apps/web/content/pitch.md`.

## Readiness quick start

- Readiness operating docs: [`docs/readiness/README.md`](docs/readiness/README.md)
- Daily control panel: [`docs/readiness/operator-cockpit.md`](docs/readiness/operator-cockpit.md)
- Day-back execution order: [`docs/readiness/final-return-checklist.md`](docs/readiness/final-return-checklist.md)
- One-command readiness gate:
  - `pnpm readiness:verify`
  - RC alias: `pnpm readiness:rc`

If `pnpm readiness:verify` fails:

1. Run `pnpm readiness:triage` (preferred repair sequence).
2. If still failing, run `pnpm readiness:status:check`, then `pnpm claims:check`, then `pnpm verify` to isolate root cause.
3. Attach outcomes in `docs/readiness/evidence-log.md`.

## Layout

Human-oriented docs live in **[docs/README.md](docs/README.md)** (operations under `docs/ops/`). Code layout:

```
apps/
  web/        Next.js 15 — `src/app/(marketing)` vs `src/app/(product)` route groups (URLs unchanged)
  mobile/     Expo (iOS + Android + web fallback)
  api/        Hono + tRPC + Better Auth + Inngest
  admin/      Catalog & moderation cockpit
  party/      PartyKit chat workers
packages/
  api-router/      tRPC routers (per domain)
  db/              Drizzle schema, migrations, seed
  auth/            Better Auth instance
  ui/              shared web primitives (Button, Badge, empty states, …)
  tokens/          palette, type, radii, country palettes
  validators/      Zod schemas reused everywhere
  catalog/         EU food seed (~150 canonical items, growing)
  i18n/            30+ locale codes (many EN stubs until translated); see docs/i18n-locale-matrix.md
  geo/             geohash + privacy helpers
  config/          shared eslint / tsconfig / prettier
```

## Parallel work (Cursor)

For merge-safe multi-agent queues, hotspot files, and claim templates, use **[docs/cursor-parallel-backlog.md](docs/cursor-parallel-backlog.md)**. Full lane rules: **[docs/agents.md](docs/agents.md)** (root [`AGENTS.md`](AGENTS.md) is a short pointer).

## Public routes (web)

When the Next.js app is running: **`/help`** (FAQ), **`/contact`**, **`/careers`**, plus existing marketing and product surfaces. Configure operations contact via env (see Production checklist below).

## Security

Report vulnerabilities per **[SECURITY.md](SECURITY.md)** (contact, scope, and ops references).

## Production & operations

Start at **[docs/README.md](docs/README.md)** (hub) and **[docs/ops/README.md](docs/ops/README.md)** (ops index). Essentials:

**Launch checklist (minimal)**

- Set `BETTER_AUTH_SECRET`, `DATABASE_URL`, and all auth/API URLs for the target domain.
- Leave `ENABLE_DEMO_MODE` unset in production unless you run a dedicated staging/demo host; `/traction` must stay real-only.
- Set `NEXT_PUBLIC_LEGAL_*` and `NEXT_PUBLIC_PRESS_EMAIL` on the web app so `/imprint` and `/press` show counsel-approved text, not bracketed placeholders.
- Set `NEXT_PUBLIC_OPERATIONS_EMAIL` (and optional `NEXT_PUBLIC_OPERATIONS_PHONE_E164`) so `/contact`, `/help`, `/careers`, and imprint show your operations line — **set only in deploy secrets**, never commit personal addresses to git.
- Optional: `INVESTOR_ACCESS_TOKENS` for `/investors`; the route stays token-gated and is `Disallow` in `robots.txt`.

- **[docs/ops/environment.md](docs/ops/environment.md)** — env matrix from `.env.example`, including `BETTER_AUTH_SECRET` (never use the admin build placeholder in live).
- **[docs/ops/deploy-runbook.md](docs/ops/deploy-runbook.md)** — migrations, `search:index`, PartyKit, smoke checks.
- **[docs/ops/stripe-connect.md](docs/ops/stripe-connect.md)** — Connect, `payments` tRPC, `/webhooks/stripe`.
- **[docs/ops/verified-bringer-kyc.md](docs/ops/verified-bringer-kyc.md)** — KYC and admin badge tooling.
- **[docs/ops/observability.md](docs/ops/observability.md)** — Sentry, PostHog EU, runbooks.
- **GitHub Actions**: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — optional manual deploy checklist for production-style hosts.
- **GitHub Pages (optional static stub only)**: [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes the small bundle under [`infra/pages/`](infra/pages/) — useful for a lightweight repo landing page, **not** the Next.js app (`apps/web` uses `output: 'standalone'`). Enable with **Settings → Pages → Build and deployment → GitHub Actions**; deployment runs on every push to `main` and can also be started manually from the Actions tab. For the real product stack, use **[docs/ops/oss-self-hosted-deploy.md](docs/ops/oss-self-hosted-deploy.md)** (or the short redirect **[docs/ops/free-preview-deploy.md](docs/ops/free-preview-deploy.md)**).
- **Short public URL while developing** (Cloudflare Tunnel): quick `*.trycloudflare.com` links are random; for a stable `demo.yourdomain` style hostname see **[docs/ops/local-demo-custom-domain.md](docs/ops/local-demo-custom-domain.md)**.

### Static export note

The full product (tRPC, auth, dynamic routes) is not a candidate for `next export` without a dedicated static marketing slice. The Pages workflow is an **optional** static mirror; **recommended** “show friends” deploys run the real stack self-hosted ([OSS self-hosted deploy](docs/ops/oss-self-hosted-deploy.md)). Production web on your own VPS stays per `docs/ops/deploy-runbook.md`.

### Unused exports (ts-prune)

There is no root `tsconfig.json`; run **`pnpm --filter <pkg> exec ts-prune`** per package, or see [`docs/audit/dead-code-registry.md`](docs/audit/dead-code-registry.md).

## Local development

Prerequisites: **Node 20.11+**, **pnpm 9+**, **Docker Desktop**.

### Windows (PowerShell 5.x, Git Bash, Husky)

- **pnpm via Corepack (recommended)** matches the root `package.json` `packageManager` field. Run `corepack enable` once (if Windows reports `EPERM` under `C:\Program Files\nodejs`, use an elevated terminal once), then from the repo root: `corepack prepare pnpm@9.12.0 --activate`. You can always invoke that build as `corepack pnpm …` (for example `corepack pnpm install`, `corepack pnpm verify`) if a global shim is misbehaving.
- A broken **global** install from `npm install -g pnpm` can leave `@pnpm/exe/pnpm` empty and make Git Bash fail with `This: command not found`. Prefer `npm uninstall -g pnpm` and Corepack instead.
- **PowerShell 5.1** does not treat `&&` as a command separator. Use **`pnpm verify`** (format check, typecheck, lint, unit tests, build — same bar as CI) instead of chaining scripts manually, or run each script on its own line.
- **Husky**: committed hooks here only run **Node** and **lint-staged** (see `.husky/pre-commit`). They do not call `pnpm`. If you use `~/.config/husky/init.sh`, keep it free of a broken global `pnpm`, or rely on Corepack as above.
- **`next build` / ENOENT**: The `@eushop/web` production script removes `apps/web/.next` and `tsconfig.tsbuildinfo` before each `next build` so Turbo/CI does not reuse a half-written output (avoids sporadic `Cannot find module …` / `PageNotFoundError` on Windows). For `next dev`, if the dev server acts up, stop it and delete `apps/web/.next` manually. Rarely, antivirus scanning `.next` during a build can still cause races—retry once.

### Web-only vs full stack (pick one path)

| What you need | Command | Typical ports |
| --- | --- | --- |
| **A — Web UI only** (marketing, static pages, no local API) | `pnpm dev:web` | `:3000` |
| **B — Web + API** (tRPC, auth, needs DB + search from Docker or your own URLs in `.env`) | `pnpm dev:web-api` (alias: `pnpm demo`) | `:3000`, `:3001` |
| **B + local data services** (Postgres, Meilisearch, Redis, Mailhog) | `pnpm dev:stack` (alias: `pnpm demo:stack`) | same + Docker services |

Magic links: without `RESEND_API_KEY`, sign-in links are **logged to the API console** (use Mailhog at `:8025` when the stack is up). With `RESEND_API_KEY` and `EMAIL_FROM` set, magic links are sent via **Resend**.

Background jobs: set **`INNGEST_EVENT_KEY`** in the root `.env` (it is already listed in `turbo.json` `globalEnv`). **Next.js** (`apps/web`, `apps/admin`) uses the same key when Server Components / Server Actions call tRPC locally so flows like **`catalog.reindex` after UGC approval** and **`trip.offer.created`** are not silently dropped. The **API** also skips outbound Inngest sends when the key is unset. If a key is missing, those enqueue paths no-op safely (see [docs/ops/zero-cost-stack.md](docs/ops/zero-cost-stack.md)).

```bash
pnpm install
cp .env.example .env

# Start Postgres + Meilisearch + Redis + Mailhog
pnpm db:up

# Apply schema and seed the catalog
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Push the catalog to Meilisearch
pnpm search:index

# Start everything in parallel
pnpm dev
```

Then open:

- http://localhost:3000 — web
- http://localhost:3001 — api
- http://localhost:3002 — admin
- Expo Dev Tools — mobile (run `pnpm --filter @eushop/mobile dev`)
- http://localhost:8025 — Mailhog inbox (catches magic-link emails in dev)

## Catalog seed

The seed catalog (`packages/catalog`) still powers **niche taste-of-home foods**
and country editorial pages—Krówki, Stroopwafels, Mastiha, Liverwurst, Sült, Halloumi,
and many more. That remains useful for finder-fee local listings; **trip / luggage**
surfaces are orthogonal and keyed off routes and **slot** metadata.

|              |                                      |
| ------------ | ------------------------------------ |
| Countries    | 30 (EU + EEA)                        |
| Categories   | 16                                   |
| Brands       | 50+                                  |
| Food items   | 150+ (curated) — admin UI grows them |

## GDPR

Eushop hosts in the EU by default and is built for GDPR:

- All data hosted in EU regions (Hetzner Falkenstein, Cloudflare EU).
- Approximate addresses only — geohash precision 5 (~5 km cell) is the maximum a
  client ever receives for map-style discovery. Pins are deterministically jittered inside the cell.
- Consent banner with EU "reject all" parity (default off for analytics).
- One-click data export (`/profile` → Export my data) and account deletion.
- Cascading FK deletes scrub listings, requests, messages, reviews, device tokens (and
  trip-related rows as those tables mature).

## Architecture

```
Clients (Next.js web · Expo iOS/Android · Cloudflare CDN)
  ↓ tRPC v11
Hono API (modular monolith)
  ├─ identity / catalog / listings / requests / trips
  ├─ messaging / media / trust / notifications
  └─ recommendations
        ↓
PostgreSQL 17 + PostGIS + pgvector · Meilisearch · Redis
PartyKit DO (chat) · Inngest workflows · Cloudflare R2 (media)
```

Each module under `packages/api-router/src/routers/*` is microservice-ready: own
domain boundaries, exposed via tRPC, can be split out into its own service when load
demands. We start as a modular monolith — the productive default in 2026.

## Historic statistics (citations)

Used for **editorial / mobility context** only—not as implied revenue market size:

1. United Nations, DESA, Population Division (2006). *International Migration Report 2006*.  
   https://www.un.org/en/development/desa/population/publications/pdf/migration/migration-report2006.pdf  
2. OECD (2007). *International Migration Outlook 2007* (SOPEMI).  
   https://www.oecd.org/migration/imo/  
3. Eurostat (2008; reference period 2007). *Population in Europe 2007: first results* (KS-SF-08-081).  
   https://ec.europa.eu/eurostat/en/web/products-statistics-in-focus/-/ks-sf-08-081  

## License

Source-available, commercial license forthcoming.
