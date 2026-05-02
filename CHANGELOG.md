# Changelog

## 0.1.0 — 2026-05-02 — MVP scaffold

The full Eushop monorepo is in place. All 11 phases of the original plan are
implemented as a working scaffold with one local `pnpm dev` command.

### Phase 0 — Foundation
- Turborepo + pnpm workspaces (`apps/*`, `packages/*`)
- TypeScript / ESLint / Prettier shared via `@eushop/config`
- Docker Compose for Postgres 17 + PostGIS + pgvector + Meilisearch + Redis + Mailhog + imgproxy
- GitHub Actions CI (Postgres service, format check, typecheck, lint, build)

### Phase 1 — Auth + schema
- Better Auth wired to Drizzle with email + magic link + Google + Apple slots
- Drizzle schemas split per domain: `auth`, `profiles`, `catalog`, `listings`, `requests`, `messaging`, `trust`, `notifications`
- Migration + seed scripts (`pnpm db:migrate`, `pnpm db:seed`)
- Admin app with catalog overview at `:3002`

### Phase 2 — Catalog + search
- Meilisearch indexing pipeline (`pnpm search:index` + Inngest job)
- tRPC `catalog` router (countries, categories, brands, items, search)
- Web pages: home, /countries, /countries/[iso2], /items/[slug], /categories/[slug]
- Mobile screens mirroring all of the above

### Phase 3 — Listings + photo upload
- Listings schema with PostGIS Point + GIST index, geohash5 cell, photos JSONB
- R2 presigned upload mutation (graceful dev placeholder fallback)
- Multi-photo, drag-style listing form on web with freshness window, fee, qty, expiresAt
- Camera-first listing flow on mobile via `expo-camera`

### Phase 4 — Geo discovery
- `@eushop/geo` package: geohash encode/decode, public-cell jitter, neighborsWithinRadius helper
- PostGIS GIST index on `listings.location`
- Discover feed with country, radius, freshness filters

### Phase 5 — Requests board
- Requests schema, create-request flow on web + mobile
- Inngest workflow `match-listing-to-open-requests` fires when a new listing matches an open request
- Notification record + Expo push pipeline

### Phase 6 — Messaging
- PartyKit Durable Object per conversation in `apps/party`, hibernating, with a 200-message buffer
- Conversations + messages schema, tRPC router with safe templates
- Realtime chat UI on web and mobile
- Inngest `notify-on-new-message` writes in-app + Expo Push

### Phase 7 — Trust + reviews
- 5-star review with tag chips (fresh, on-time, friendly, true-to-photo, fair-fee, easy-pickup)
- Successful-exchange counter on profile (auto-incremented on review)
- Reports + admin moderation queue
- Block/unblock relation on `profiles`

### Phase 8 — Premium polish (Goop aesthetic)
- Editorial country landing pages with parallax flag heroes
- Magazine-grid item gallery, country-flavored palettes per ISO2
- Fraunces serif + Inter sans typography pairing
- Framer Motion scroll animations on hero, country rail, editorial blocks
- Dark mode via `next-themes`
- next-intl with EN / DE / FR / ES / IT / PL launch translations

### Phase 9 — Mobile-native features
- Expo Push registration + token sync to API
- `expo-sharing` native share sheet on item screens
- `expo-camera` for camera-first photo capture
- Offline catalog cache via `expo-sqlite` (`apps/mobile/src/lib/offline-cache.ts`)
- Deep linking via Expo Router scheme `eushop://`

### Phase 10 — Launch prep
- GDPR consent banner with EU "reject all" parity, default analytics off
- `/profile` data export (Art. 15 + 20) + account deletion (Art. 17)
- ToS, Privacy, Imprint, Safety, How-it-works pages
- Marketplace terms make explicit: no payment handling, no commercial sellers
- README with full setup instructions
