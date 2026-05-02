# Eushop

> **Suitcase capacity is the new last-mile.**

Eushop is the diaspora trip & errand marketplace for the EU. Two hundred million
Europeans live somewhere other than where they grew up — and most of them are flying
home in the next ninety days with three empty kilos in their checked bag. We are the
coordination layer that turns those wasted kilos into cravings finally met.

Three primitives, one network:

1. **Trip offers** — a verified diaspora user announces a trip ("Munich → Warsaw,
   May 14, 6 suitcase slots, here's what I'll grab"), each slot reservable at an
   agreed finder's fee. *Reservations are the monetisable event.*
2. **Open requests** — a buyer posts what they want; matching trips and listings
   in the same corridor or 5 km cell light it up automatically.
3. **Pantry listings** — neighbourhood-scale finder-fee posts ("half a tin of
   Krówki, €3, pickup at Goetheplatz") with privacy-preserving geohash discovery.

We charge a small platform fee on each confirmed reservation:
`platformFee = min(€1.50, 12% × finderFee)`. Settlement of the goods themselves stays
between the parties — we are introductions, identity, and chat, not customs, freight,
or regulated payments.

> Discovery is tied to **places, routes, and corridors**. Profiles are photo-forward
> and trust-graphed. Listings and trips render with a 5 km privacy cell and
> deterministic jitter so handoffs stay practical without exposing anyone's home.

## Product scope (shipped vs roadmap)

**In this repo today**

- **Trip marketplace** (`/trips`, `/trips/new`, `/reservations`) on web and mobile,
  backed by `trip_offers`, `trip_reservations`, `payouts` schemas and a full
  `trips` tRPC router (create / search / reserve / confirm / complete / cancel).
- **Hybrid product catalog** — curated EU foods + Open Food Facts importer
  (CC-BY-SA, attributed in-app) + UGC moderation queue (`food_item_candidates`,
  `food_item_image_proposals`).
- **Product picker** with three image candidates, photo upload, paste-image-URL
  (server-side download + R2 re-host), and "propose this product" UGC flow.
- **Pantry listings & requests** with PostGIS, Meilisearch, and 5 km geohash cells.
- **Realtime chat** (PartyKit Durable Objects), Better Auth, Inngest workflows
  (Open Food Facts importer, trip-reservation notifications, departure reminders),
  and an admin moderation cockpit.
- **Investor surfaces** — public `/manifesto`, live `/traction` (real DB counts,
  never invented), and a token-gated `/investors` deck rendered from
  `apps/web/content/pitch.md`. Optional `?demo=1` cookie surfaces a clearly
  labelled showcase dataset for board meetings without polluting production.

**Roadmap (direction of travel)**

- **Stripe Connect** wire-up so platform fees actually collect on confirmation.
- **Verified-bringer badge** (Veriff/Onfido passport-country attestation).
- **Group-buys**, restock alerts, pickup hubs, multilingual catalog search,
  city leaderboards. Tracked in `[/roadmap](apps/web/src/app/roadmap/page.tsx)`.

EU-first by construction. Hosting in Hetzner Falkenstein, CDN via Cloudflare EU.

## Stack (validated 2026)

- **Monorepo** — Turborepo + pnpm
- **Web** — Next.js 15 · Tailwind v4 · shadcn-style components · Framer Motion · next-intl
- **Mobile** — Expo SDK 54 · Expo Router v4 · NativeWind v4 · Moti
- **API** — Hono on Bun-or-Node · tRPC v11 · Better Auth · Zod
- **Data** — PostgreSQL 17 + PostGIS + pgvector · Drizzle ORM · Meilisearch · Redis
- **Realtime** — PartyKit (Cloudflare Durable Objects)
- **Jobs** — Inngest
- **Storage** — Cloudflare R2
- **Hosting** — Hetzner Cloud (EU) + Coolify · Cloudflare CDN

The trip marketplace (`trip_offers`, `trip_reservations`, `payouts`) is the
monetisable complement to listings and requests; the platform fee on each confirmed
reservation is the take rate that powers the YC-style unit economics in
`apps/web/content/pitch.md`.

## Layout

```
apps/
  web/        Next.js 15 marketing + product
  mobile/     Expo (iOS + Android + web fallback)
  api/        Hono + tRPC + Better Auth + Inngest
  admin/      Catalog & moderation cockpit
  party/      PartyKit chat workers
packages/
  api-router/      tRPC routers (per domain)
  db/              Drizzle schema, migrations, seed
  auth/            Better Auth instance
  ui-web/          shared web primitives (currently inside apps/web)
  design-tokens/   palette, type, radii, country palettes
  validators/      Zod schemas reused everywhere
  catalog-data/    EU food seed (~150 canonical items, growing)
  i18n/            EN/DE/FR/ES/IT/PL launch translations
  geo/             geohash + privacy helpers
  config/          shared eslint / tsconfig / prettier
```

## Local development

Prerequisites: **Node 20.11+**, **pnpm 9+**, **Docker Desktop**.

### Windows (PowerShell 5.x, Git Bash, Husky)

- **pnpm via Corepack (recommended)** matches the root `package.json` `packageManager` field. Run `corepack enable` once (if Windows reports `EPERM` under `C:\Program Files\nodejs`, use an elevated terminal once), then from the repo root: `corepack prepare pnpm@9.12.0 --activate`. You can always invoke that build as `corepack pnpm …` (for example `corepack pnpm install`, `corepack pnpm verify`) if a global shim is misbehaving.
- A broken **global** install from `npm install -g pnpm` can leave `@pnpm/exe/pnpm` empty and make Git Bash fail with `This: command not found`. Prefer `npm uninstall -g pnpm` and Corepack instead.
- **PowerShell 5.1** does not treat `&&` as a command separator. Use **`pnpm verify`** (typecheck, lint, build) instead of pasting `pnpm typecheck && pnpm lint && pnpm build`, or run each script on its own line.
- **Husky**: committed hooks here only run **Node** and **lint-staged** (see `.husky/pre-commit`). They do not call `pnpm`. If you use `~/.config/husky/init.sh`, keep it free of a broken global `pnpm`, or rely on Corepack as above.
- **`next build` / ENOENT**: If a production build fails with missing files under `apps/web/.next` (for example `build-manifest.json` or `pages-manifest.json`), delete `apps/web/.next` and `apps/web/tsconfig.tsbuildinfo`, ensure nothing else is touching that folder, and run `pnpm --filter @eushop/web build` again. Aggressive antivirus or parallel tools scanning `.next` can occasionally race the build on Windows.

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

The seed catalog (`packages/catalog-data`) still powers **niche EU foods** and country
editorial pages—Krówki, Stroopwafels, Mastiha, Liverwurst, Sült, Halloumi, and many more.
That remains useful for finder-fee “taste of home” listings; **trip / luggage** surfaces
are orthogonal and keyed off routes and capacity metadata.

|              |                                      |
| ------------ | ------------------------------------ |
| Countries    | 30 (EU + EEA)                        |
| Categories   | 16                                   |
| Brands       | 50+                                  |
| Food items   | 150+ (curated) — admin UI grows them |

## GDPR

Eushop is built EU-first:

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

## License

Source-available, commercial license forthcoming.
