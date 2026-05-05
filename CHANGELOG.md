# Changelog

## 0.2.5 — 2026-05-05 — Admin polish and session/accessibility UX

- **Admin**: improved read-only scanability for listings/payments tables (captions, column scopes, hover affordances) in `apps/admin`.
- **Mobile**: profile screen now distinguishes expired auth sessions from signed-out state and prompts a clear “sign in again” action.
- **Web**: trips feed accessibility pass with explicit list labelling and locale-aware departure date formatting via `Intl.DateTimeFormat`.
- **Ops docs**: added `docs/ops/branch-protection-checklist.md` for safer GitHub merge policy setup.

## 0.2.4 — 2026-05-05 — Product picker catalog gallery

- **Web**: [`ProductPicker`](apps/web/src/components/catalog/product-picker.tsx) — **Pics** opens a scrollable gallery from `catalog.browse` (tap to select product + photo); propose-product modal layout and ISO2 field; in-modal photo strip and link to Pics; picker toolbar grid supports four actions on wide screens.
- **Mobile**: [`ProductPicker`](apps/mobile/src/components/ProductPicker.tsx) — same **Pics** entry point and bottom-sheet gallery from `catalog.browse` (EN copy in-component for now).
- **i18n**: `productPicker` strings for Pics / gallery / proposal photo strip (synced across locales from `en.json`).

## 0.2.3 — 2026-05-02 — Post-0.2.2 backlog remainder

- **Legal / product**: [`docs/ops/terms-privacy-payments-review.md`](docs/ops/terms-privacy-payments-review.md); Terms/Privacy updated for trip checkout, Stripe, refunds/chargebacks; reservations + pay step copy with `/terms` anchors.
- **Ops**: [`docs/ops/stripe-reconciliation-repair.md`](docs/ops/stripe-reconciliation-repair.md); admin **Payments** lists `payouts` via `payments.adminListPayouts`; [`docs/ops/corridor-playbooks.md`](docs/ops/corridor-playbooks.md), [`docs/ops/build-runtime.md`](docs/ops/build-runtime.md).
- **Tests**: [`trips-confirm-reservation.test.ts`](packages/api-router/src/routers/trips-confirm-reservation.test.ts) (valid UUID inputs), [`stripe-webhook.test.ts`](apps/api/src/routes/stripe-webhook.test.ts) (Vitest includes `apps/api`).
- **Analytics**: PostHog initializes only after **analytics consent** (`Providers` + [`consent-banner`](apps/web/src/components/layout/consent-banner.tsx)).
- **i18n**: `reservationPayment` + payments notices; `productPicker.searchPlaceholder`; mobile chat uses shared `en.json` chat keys; [`pitch.md`](apps/web/content/pitch.md) “how to read this deck”.

## 0.2.2 — 2026-05-02 — Launch docs and product hardening

- Rewrote **[`docs/ops/stripe-connect.md`](docs/ops/stripe-connect.md)** and added **[`docs/ops/stripe-e2e-matrix.md`](docs/ops/stripe-e2e-matrix.md)**, **[`docs/ops/legal-launch-checklist.md`](docs/ops/legal-launch-checklist.md)**, **[`docs/ops/investor-access.md`](docs/ops/investor-access.md)**, **[`docs/ops/mobile-payments-parity.md`](docs/ops/mobile-payments-parity.md)**, **[`docs/roadmap-epics.md`](docs/roadmap-epics.md)**; expanded deploy runbook and workflow notes.
- **Web**: verified-bringer badge on trip detail; chat placeholders via **next-intl**; notifications status **`aria-live`**; **`/messages`** on sitemap; ESLint via **`eslint.config.mjs`** (not `next lint`); Sentry hook in **`instrumentation.ts`** when `@sentry/nextjs` is installed.
- **Mobile**: **`EXPO_PUBLIC_SITE_URL`** in **`eas.json`**; post-reserve prompt when **`paymentClientSecret`** is returned; verified-bringer label on trip screen.
- **API**: Stripe webhook financial kind mapping shared in **`@eushop/api-router/lib/stripe-webhook-financial-kind`** with unit tests.

## 0.2.1 — 2026-05-02 — Sell-ready cleanup

- **Staging demo (opt-in)**: when **`ENABLE_DEMO_MODE=1`**, `?demo=1` / `?demo=0` in [`apps/web/src/middleware.ts`](apps/web/src/middleware.ts) toggles a labelled showcase cookie for **empty** marketplace pages only; **`/traction` stays real DB metrics**. Omit the env var in production.
- Renamed `packages/api-router/src/lib/mock-fallback.ts` → **`catalog-fallback.ts`** (curated catalog static fallbacks before seed only).
- Grouped operations docs under **`docs/ops/`** with **`docs/README.md`** as the index; updated cross-links across the repo.

## 0.2.0 — 2026-05-02 — Trip marketplace pivot

> Suitcase capacity is the new last-mile.

The narrative reframe. Pantry listings and requests stay as primitives, but the
primary monetisable surface is now **trip offers + reservations**: a verified
diaspora user announces a trip with N suitcase slots, buyers reserve specific
items at an agreed finder's fee, and the platform charges
`min(€1.50, 12% × finderFee)` on each confirmation.

### All mock data killed
- Deleted `packages/mock-data` entirely (every fictional listing, request, user,
  conversation, message, audit row).
- `catalog-fallback.ts` (then named `mock-fallback.ts`) kept only for the curated catalog (countries, categories,
  brands, items). User-generated endpoints now return real data or `[]` — never
  synthetic rows.
- **Demo cookie**: production should leave **`ENABLE_DEMO_MODE` unset**; optional staging-only showcase when the flag is on (see 0.2.1 above).
- Honest empty states everywhere: home, discover, requests, listings, admin
  moderation queue, mobile today screen.

### Trip marketplace spine
- New schemas in `packages/db/src/schema/trips.ts`: `trip_offers`,
  `trip_reservations`, `payouts`, with status enums and PostGIS `geographyPoint`
  endpoints. Migration `0002_trip_marketplace.sql`.
- New tRPC router `packages/api-router/src/routers/trips.ts` — `create`,
  `byRoute`, `feedNear`, `byId`, `mineAsSeller`, `mineReservations`,
  `reserve`, `confirmReservation`, `rejectReservation`,
  `completeReservation`, `cancelReservation`. Atomic slot decrement and
  platform-fee calculation live in the reserve mutation.
- Validators in `packages/validators` for the full trip lifecycle, plus
  `calculatePlatformFeeCents` helper.
- Web routes: `/trips`, `/trips/new`, `/trips/[id]`, `/reservations`.
- Mobile mirrors under `apps/mobile/app/(tabs)/trips.tsx`, `app/trip/new.tsx`,
  `app/trip/[id].tsx`.
- Inngest workflows: `notify-reservation-created`,
  `notify-trip-departure-soon` + fanout, `auto-close-stale-trips`.

### Hybrid product catalog with real images
- `food_items` extended with `barcode`, `openFoodFactsId`, `imageVariants`,
  `verifiedAt`, `submittedById`. New tables `food_item_candidates`,
  `food_item_image_proposals`, `food_item_image_votes` for the UGC pipeline.
- `packages/catalog/src/openfoodfacts/` — read-only CC-BY-SA client over
  the Open Food Facts public API. Inngest `import-openfoodfacts-batch` +
  daily cron to seed unverified rows for the moderation queue.
- New tRPC procedures `catalog.proposeItem`, `catalog.proposeImage`,
  `catalog.upvoteImage`, `catalog.searchWithSuggestions`.
- New `media.fetchRemoteImage` mutation downloads + re-hosts user-pasted
  image URLs on R2 (strips EXIF, prevents hotlinking).
- `ProductPicker` component (web + mobile mirror) — debounced catalog search,
  three image candidates per result, upload / paste-URL / propose-product
  fallbacks. Wired into listing form, request form, trip-offer form,
  reservation form.
- `apps/web/src/app/(product)/items/[slug]/page.tsx` renders the real catalog image and
  attributes Open Food Facts when the source warrants.

### Investor / YC readiness
- New `/manifesto` — the long-form public pitch.
- New `/traction` — live counts via `traction.liveCounts` and a 12-week
  growth sparkline via `traction.weeklyGrowth`. Real numbers only; if it's
  zero, it says zero.
- New `/investors` — token-gated long-form deck, rendered from
  `apps/web/content/pitch.md` via a tiny dependency-free Markdown renderer.
  Tokens configured via `INVESTOR_ACCESS_TOKENS` env var; without one the
  page renders a public stub plus links to /manifesto and /traction.
- ~~Demo mode banner~~ removed in 0.2.1.
- README rewritten to lead with the new manifesto.
- **Platform fee formula** aligned with the product spec:
  `platformFee = min(€1.50, 12% × finderFee)` (was incorrectly implemented as `max` briefly).
- **`match-request-to-trip` Inngest job** — on `trip.offer.created`, notifies buyers whose open
  requests match the trip origin country (via catalog `food_items.origin_country_iso2`) or
  overlap `intendedItemIds`. `trip.reservation.created` and `trip.offer.created` are now emitted
  from the API `createContext` → `inngest.send` bridge.
- **`/safety/handoff-protocol`** — investor-oriented narrative on public handoffs, food safety,
  KYC roadmap, and moderation; linked from `/safety`.
- **`listing.created` / `request.created`** — tRPC `listings.create` and `requests.create` now emit
  Inngest events via the same `enqueueEvent` bridge as trips (so `match-listing-to-open-requests`
  actually runs). Matcher decodes `listing.indexGeohash` for real 50 km cell overlap instead of a
  placeholder origin.
- **Version strings** — root + `@eushop/web` package.json set to `0.2.0`; footer badge reads
  `v0.2 · Trip marketplace`.
- **`requests.create` country** — `country_iso2` is now inferred from the request pin via
  `@eushop/geo` coarse catalog bounding boxes (same approach as listings), falling back to `EU`.
- **`requests.matchesFor`** — uses `decode(request.cell_geohash)` + the buyer’s `radius_km`
  instead of a hardcoded central-Europe anchor.
- **`match-trips-for-open-request` (Inngest)** — on `request.created`, when the request has a
  `food_item_id`, notifies distinct **trip sellers** whose open offer’s destination cell overlaps
  the buyer’s radius and whose origin or `intended_item_ids` plausibly cover that catalog item
  (`system` notifications with `requestId` + `tripOfferId` in `data`).
- **Sitemap** — static entries for `/trips`, `/trips/new`, `/reservations`, `/manifesto`,
  `/traction`, `/investors`, `/safety/handoff-protocol`.
- **`@eushop/api-server`** package version `0.2.0`.
- **Notifications inbox** — `notifications.markRead` tRPC mutation; web `/notifications` with
  `NotificationsPanel` (list, deep links by kind, per-row + mark-all read); nav + footer + profile
  entry points; sitemap entry.
- **Admin `/trips`** — read-only list of recent open trip offers with “Open in web” links; sidebar
  nav item **Trips**.

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
