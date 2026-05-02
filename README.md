# Eushop

A **city- and location-first** peer marketplace. Travelers publish real journeys—start
and end places, dates, legs (e.g. Kilimanjaro → Fiji → Antarctica), and **spare luggage
capacity**: volume, dimensions, weight limits, and what they are willing to carry. Others
can **buy that capacity** at a listed price or compete in **bids**, the same way
familiar marketplaces surface offers and demand.

Alongside that, people who want something specific can still post **requests** and offer a
**finder's fee**—so the product is both “I have extra space on this trip” (often the
stronger commercial lane for the platform) and “someone find this for me.”

Discovery is tied to **places and routes**, not a single country filter: your city,
your corridor, your handoff point. Profiles are meant to feel **social and trustworthy**
(clear photo, identity cues) while browsing, offers, and checkout-style flows aim to
feel **as seamless as eBay**—fast scan, clear price or auction state, low friction to
message and close a deal.

> Eushop is a discovery & messaging layer. Settlement, customs, carrier rules, and
> liability stay between the parties unless and until the product adds regulated
> payment flows. Many handoffs stay local; multi-leg trips are first-class in how
> routes are described.

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

Trip offers and reservations are modeled in the DB (`packages/db` trip tables) as the
monetisable complement to listings and requests.

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
