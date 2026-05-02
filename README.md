# Eushop

A pan-EU lead-generation marketplace where diaspora users discover fellow countrymen nearby
who hold stashes of niche home-country foods (Krówki, Stroopwafels, Mastiha, Liverwurst,
Sült…), connect via in-app chat, and arrange a "finder's fee" handoff off-platform.

> Eushop is a discovery & messaging service. We do **not** handle payments, package, ship,
> or verify food safety. Buyers and sellers settle in person.

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

The seed catalog (`packages/catalog-data`) covers the major niche EU foods. It is
intentionally biased toward "you can't easily find this in a regular EU supermarket
outside its origin country" — Krówki, Stroopwafels, Mastiha, Liverwurst, Sült, Halloumi,
Kremšnita, Manner, Túró Rudi, Pastéis de nata and many more. Every country has a country
landing page that doubles as an editorial.

| | |
| --- | --- |
| Countries | 30 (EU + EEA) |
| Categories | 16 |
| Brands | 50+ |
| Food items | 150+ (curated) — admin UI grows the catalog |

## GDPR

Eushop is built EU-first:

- All data hosted in EU regions (Hetzner Falkenstein, Cloudflare EU).
- Approximate addresses only — geohash precision 5 (~5 km cell) is the maximum a
  client ever receives. Pins are deterministically jittered inside the cell.
- Consent banner with EU "reject all" parity (default off for analytics).
- One-click data export (`/profile` → Export my data) and account deletion.
- Cascading FK deletes scrub listings, requests, messages, reviews, device tokens.

## Architecture

```
Clients (Next.js web · Expo iOS/Android · Cloudflare CDN)
  ↓ tRPC v11
Hono API (modular monolith)
  ├─ identity / catalog / listings / requests
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
