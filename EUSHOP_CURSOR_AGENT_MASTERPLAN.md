# EUSHOP — CURSOR AI AGENT MASTER PLAN
## YC-Ready Overhaul: Full Codebase Renovation Instructions
### Version 1.0 — May 2026 | Estimated Agent Runtime: 20–40 Hours

---

> **READ THIS FIRST.** This document is your complete operating contract.
> Work through phases in order. Do NOT skip phases. Cross-reference every
> completed goal before marking it done. Treat every `MUST` as a hard
> requirement and every `VERIFY` block as a mandatory checkpoint.

---

## ═══════════════════════════════════════════
## PART 0: ORIENTATION & OPERATING RULES
## ═══════════════════════════════════════════

### 0.1 — What Eushop Is

Eushop is a **peer-to-peer trip/goods exchange marketplace** targeting EU diaspora mobility
corridors. Core primitives:
- **Trip offers**: travellers announce routes with reservable cargo slots.
- **Open asks**: demand posts that trigger matching supply signals.
- **Local listings**: neighbourhood finder-fee offers with privacy-preserving geohash discovery.

Monetisation: `platformFee = min(EUR 1.50, 12% of agreed slot fee)` triggered on confirmed reservation.

YC bar: real traction story, zero AI slop, zero mock data, zero dead code, polished product
narrative, defensible architecture, and investor surfaces that actually work.

---

### 0.2 — Agent Operating Contract

```
PRIORITY ORDER:
  1. Source code truth > this document
  2. README.md / AGENTS.md / claims/README.md > this document
  3. This document > any prior conversation context

CLAIM RULE: Before touching any file listed in §4 hotspots, create
  claims/EUSHOP-<LANE>-<NNN>.yaml first. Run `pnpm claims:check` before
  any merge-ready commit.

VERIFY CADENCE: Run `pnpm verify` after every 2-3 task completions per lane.

FORBIDDEN:
  - Committing secrets
  - Describing roadmap items as shipped
  - Skipping the claims step on hotspot files
  - Parallel edits to lockfile/dependency files
  - Any AI-generated placeholder text ("Lorem ipsum", "TODO: add real data",
    "Sample user", "Test trip", hardcoded fake metrics)
```

---

### 0.3 — Lane Map

| Lane | Scope |
|------|-------|
| **Lane A** | Web UI, i18n, design tokens, catalog-data, mobile UI |
| **Lane B** | API routers, DB schema/migrations, auth, validators, geo, PartyKit |
| **Lane O** | Root config, CI/CD, monorepo orchestration, docs, lockfile |

---

### 0.4 — Hotspot Serialisation (ONE active claim at a time per hotspot)

| ID | Path |
|----|------|
| H1-router | `packages/api-router/src/router.ts` |
| H2-context | `packages/api-router/src/context.ts` |
| H3-schema | `packages/db/src/schema/**` |
| H4-i18n | `packages/i18n/src/messages/**` |
| H5-shell | `apps/web/src/app/layout.tsx` + shell files |
| H6-deps | Root package/dependency orchestration |

---

## ═══════════════════════════════════════════
## PART 1: AUDIT PHASE — UNDERSTAND BEFORE TOUCHING
## ═══════════════════════════════════════════

**Estimated time: 2–4 hours. Do NOT edit anything during this phase.**

### TASK 1.1 — Full Repository Inventory

Walk every package and app directory. For each, document:

```yaml
# Fill this out for each package:
package: <name>
purpose: <one sentence>
status: shipped | partial | stub | dead
has_mock_data: true | false
has_hardcoded_strings: true | false
has_unused_exports: true | false
test_coverage: none | partial | good
last_meaningful_commit: <approximate>
notes: <anything odd>
```

Packages to audit:
- `apps/web`
- `apps/mobile`
- `apps/api`
- `apps/admin`
- `apps/party`
- `packages/api-router`
- `packages/db`
- `packages/auth`
- `packages/validators`
- `packages/i18n`
- `packages/ui-web`
- `packages/design-tokens`
- `packages/geo`
- `packages/catalog-data`
- `packages/config`

### TASK 1.2 — Mock Data & AI Slop Detection

Search codebase for all instances of:

```bash
# Run these and log every result:
grep -r "mock" --include="*.ts" --include="*.tsx" -l
grep -r "placeholder" --include="*.ts" --include="*.tsx" -l
grep -r "TODO\|FIXME\|HACK\|XXX\|lorem\|ipsum\|fake\|dummy\|sample" -l
grep -r "const.*=.*\[\]" --include="*.ts" -l  # empty hardcoded arrays
grep -r "hardcoded\|temp\|test.*data\|testUser\|mockUser" -l
grep -r '"userId":\s*"[0-9]"' -l  # fake user IDs
grep -r "console\.log" --include="*.ts" --include="*.tsx" -l  # debug logs
```

Create a file `docs/audit/mock-data-registry.md` with every finding categorised as:
- `REMOVE`: pure scaffolding with no live replacement needed
- `REPLACE-WITH-SEED`: should become proper `db:seed` data
- `REPLACE-WITH-REAL`: needs real API/DB integration
- `REPLACE-WITH-ENV`: should be an env variable

### TASK 1.3 — Dead Code & Redundancy Scan

```bash
# Find unused exports (install if needed: npx ts-prune)
npx ts-prune --ignore "index.ts" > docs/audit/unused-exports.txt

# Find duplicate type definitions
grep -r "^export type\|^export interface" --include="*.ts" | sort > docs/audit/all-types.txt

# Find files with <10 lines that might be stubs
find . -name "*.ts" -not -path "*/node_modules/*" -exec wc -l {} + | sort -n | head -50
```

Document everything in `docs/audit/dead-code-registry.md`.

### TASK 1.4 — Architecture Health Check

For each domain router in `packages/api-router/src/`, verify:
- [ ] Input validation uses `packages/validators` schemas (not inline Zod)
- [ ] Auth context is threaded via `packages/auth` (not reimplemented)
- [ ] DB queries use the correct `packages/db` schema references
- [ ] Error handling returns typed errors (not raw throws)
- [ ] No direct `fetch()` calls that should be tRPC procedures

Document findings in `docs/audit/architecture-gaps.md`.

### TASK 1.5 — Investor Surface Audit

Locate and review:
- Manifesto/traction page(s)
- Investor deck flow (tokenized access path)
- Any metrics or traction numbers displayed

Flag every metric as `REAL` (from DB) or `HARDCODED` (fake). Fake metrics are a YC
dealbreaker. Every displayed number must trace to a real DB query or be explicitly
labelled "target" or "projected."

---

### ✅ AUDIT PHASE CHECKPOINT

Before proceeding to Part 2, verify:
- [ ] `docs/audit/` directory exists with all 4 registry files
- [ ] Every mock/hardcoded item is categorised
- [ ] No edits made to source files yet
- [ ] `pnpm verify` runs clean (establish baseline)

---

## ═══════════════════════════════════════════
## PART 2: STRUCTURAL MODERNISATION
## ═══════════════════════════════════════════

**Estimated time: 4–8 hours. Lane O tasks.**

### TASK 2.1 — Monorepo Config Modernisation (Lane O)

Claim: `claims/EUSHOP-O-001.yaml`

**2.1.a — Package.json hygiene**
- Ensure all `workspace:*` dependencies are explicit (no floating versions)
- Remove any `resolutions` overrides that are no longer needed
- Ensure `engines.node` and `engines.pnpm` are pinned and correct
- Add `"type": "module"` only if all packages are ESM-ready (verify first)
- Ensure `scripts` section has no dead/broken scripts

**2.1.b — TypeScript config modernisation**
For each `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true
  }
}
```
Fix all type errors that surface. Do NOT use `any` as a fix. Use proper types.

**2.1.c — ESLint + Prettier 2026 standard**
Ensure `.eslintrc` / `eslint.config.ts` includes:
- `@typescript-eslint/recommended-type-checked`
- `import/no-cycle` (circular dependency detection)
- `unicorn/prefer-module`
- `no-console` (warn, not error — allows intentional logging)
- Prettier integrated as ESLint formatter

**2.1.d — Turbo pipeline optimisation**
Review `turbo.json`:
- Ensure `build` correctly declares all `inputs` and `outputs`
- Add `persistent: true` for dev tasks
- Add cache invalidation for env-dependent tasks
- Ensure `verify` pipeline runs in correct dependency order

**VERIFY CHECKPOINT 2.1:**
```bash
pnpm typecheck  # Must pass with zero errors
pnpm lint       # Must pass
pnpm build      # Must complete successfully
```

---

### TASK 2.2 — CI/CD Pipeline (Lane O)

Claim: `claims/EUSHOP-O-002.yaml`

Create/update `.github/workflows/`:

**`ci.yml`** — runs on every PR:
```yaml
jobs:
  verify:
    steps:
      - pnpm install --frozen-lockfile
      - pnpm typecheck
      - pnpm lint
      - pnpm test:unit
      - pnpm claims:check
      - pnpm build

  e2e:
    if: github.event_name == 'pull_request'
    steps:
      - pnpm test:e2e (if exists, else add playwright setup)
```

**`release.yml`** — runs on main merge:
```yaml
jobs:
  deploy-api:    # Deploy apps/api
  deploy-web:    # Deploy apps/web
  deploy-party:  # Deploy apps/party
  notify:        # Slack/Discord notification with deploy URL
```

**`db-migrate.yml`** — manual trigger:
```yaml
on: workflow_dispatch
jobs:
  migrate:
    steps:
      - pnpm db:migrate
      - pnpm search:index
```

Ensure ALL workflows use pinned action versions (`@v4`, not `@main`).
Add `concurrency` groups to prevent duplicate runs.

---

### TASK 2.3 — Environment Variable Governance (Lane O)

Claim: `claims/EUSHOP-O-003.yaml`

**2.3.a** Create `.env.example` at repo root with EVERY variable documented:
```bash
# ── Database ────────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@localhost:5432/eushop
# ── Redis ───────────────────────────────────────────────
REDIS_URL=redis://localhost:6379
# ── Auth ────────────────────────────────────────────────
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=http://localhost:3000
# [etc. for every variable in §7 of AI_MANIFESTO]
```

**2.3.b** Add runtime env validation using `@t3-oss/env-nextjs` or `zod.parse` at app startup:
- `apps/api/src/env.ts` — validates all server-side vars on boot
- `apps/web/src/env.ts` — validates NEXT_PUBLIC_ vars at build time
- Apps MUST crash with a clear message if required vars are missing

**2.3.c** Document environment variables in `docs/README.md` (quick reference) and the full matrix in `docs/ops/environment.md` (legacy single-file env documentation is merged into the docs hub). Include:
- Full variable reference table
- Which vars are required vs optional per environment
- How to generate secrets locally
- Production checklist

---

## ═══════════════════════════════════════════
## PART 3: DATABASE & DATA LAYER OVERHAUL
## ═══════════════════════════════════════════

**Estimated time: 4–6 hours. Lane B tasks.**

### TASK 3.1 — Schema Audit & Hardening (H3-schema)

Claim: `claims/EUSHOP-B-001.yaml`

Walk every table in `packages/db/src/schema/**`. For each:

**3.1.a — Naming consistency**
- All tables: `snake_case` plural (`trip_offers`, `open_asks`, `local_listings`)
- All columns: `snake_case`
- All foreign keys: `<table_singular>_id` pattern
- All timestamps: `created_at`, `updated_at` (with auto-update trigger or Drizzle `.defaultNow()`)
- Enum values: `SCREAMING_SNAKE_CASE`
- No abbreviations in column names (e.g. `usr_id` → `user_id`)

**3.1.b — Index review**
Every table must have indexes on:
- All foreign key columns
- Any column used in WHERE clauses in routers
- Geospatial columns must use `USING GIST` (PostGIS)
- Full-text search columns must have GIN indexes
- `created_at` on high-volume tables (for range queries)

Check `packages/api-router/src/**` for all `.where()` clauses and verify index coverage.

**3.1.c — Constraint completeness**
- `NOT NULL` on all columns that should never be null
- `CHECK` constraints on monetary amounts (must be >= 0)
- `CHECK` constraints on fee model: `platform_fee = LEAST(1.50, agreed_slot_fee * 0.12)`
- `UNIQUE` constraints where business rules require uniqueness
- Foreign key `ON DELETE` behaviour explicitly set (no implicit behaviour)

**3.1.d — Monetary precision**
- All money fields: `NUMERIC(10, 2)` — NEVER `FLOAT` or `DECIMAL` without precision
- Currency codes: `CHAR(3)` with CHECK against ISO 4217 list
- Fee calculation logic in DB as computed column OR enforced in validator layer — never in UI

**3.1.e — Soft delete pattern**
Add `deleted_at TIMESTAMP` to: `trip_offers`, `open_asks`, `local_listings`, `users` (if not present).
All list queries MUST include `WHERE deleted_at IS NULL`.

**VERIFY CHECKPOINT 3.1:**
```bash
pnpm db:migrate   # Must apply cleanly
pnpm typecheck    # Schema types must regenerate correctly
```

---

### TASK 3.2 — Seed Data Overhaul (Lane B)

Claim: `claims/EUSHOP-B-002.yaml`

**The golden rule: seed data must be BELIEVABLE, not just valid.**

Delete all existing seed files that contain:
- Names like "Test User", "User 1", "Sample Trip"
- Placeholder descriptions
- Round numbers like `fee: 10.00` with no rationale
- Fake email domains like `@test.com` (use `@example.com` per RFC 2606)

Create `packages/db/src/seed/` with:

**`seed/users.ts`** — 20–30 realistic users:
- Mix of nationalities matching EU diaspora corridors (Polish, Romanian, Ukrainian, Czech users)
- Realistic names (use locale-appropriate name lists)
- Verified status variety (some verified, some unverified)
- Created-at dates spread across past 6 months

**`seed/trips.ts`** — 40–60 trip offers:
- Real EU city pairs: Warsaw↔London, Bucharest↔Paris, Prague↔Vienna, Kyiv↔Berlin
- Realistic departure times (not "2024-01-01T00:00:00Z")
- Realistic slot fees (EUR 5–25 range)
- Mix of statuses: open, partially booked, completed, cancelled
- Route descriptions written in natural language

**`seed/listings.ts`** — 30+ local listings:
- Real neighbourhood names in real cities
- Realistic product categories (food items from Open Food Facts, household goods)
- Privacy geohash must be generated from real lat/lng (not `geohash: "abc"`)
- Realistic finder fees (EUR 2–8)

**`seed/asks.ts`** — 20+ open asks:
- Realistic demand posts ("Looking for someone travelling from Warsaw to bring X")
- Mix of fulfilled and open

**VERIFY CHECKPOINT 3.2:**
```bash
pnpm db:seed     # Must complete without errors
# Then run: SELECT COUNT(*) FROM trip_offers; -- must show seeded rows
pnpm search:index  # Meilisearch must index seeded data
```

---

### TASK 3.3 — Query Layer Hardening (Lane B)

Claim: `claims/EUSHOP-B-003.yaml`

Walk every router file in `packages/api-router/src/`. For each procedure:

**3.3.a — Input validation**
- All inputs validated with `packages/validators` schemas
- No inline `z.string()` that duplicates a shared schema
- Pagination: enforce `limit <= 100`, `offset >= 0`
- Geographic inputs: validate lat/lng bounds (-90/90, -180/180)

**3.3.b — Output serialisation**
- No raw DB row objects returned to clients (strip `password_hash`, `deleted_at`, internal fields)
- Monetary values: return as strings `"12.50"` not floats
- Dates: return as ISO 8601 strings

**3.3.c — Error handling**
Replace any bare `throw new Error(...)` with typed tRPC errors:
```typescript
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Trip offer not found or has been removed',
})
```

Standard error codes to implement:
- `UNAUTHORIZED` — not logged in
- `FORBIDDEN` — logged in but not allowed
- `NOT_FOUND` — resource doesn't exist or is soft-deleted
- `BAD_REQUEST` — validation failure
- `CONFLICT` — e.g. double-booking attempt

**3.3.d — N+1 query elimination**
Review all list procedures. Any procedure that fetches a list then queries related data
in a loop MUST be refactored to use JOIN or Drizzle's `with()` (relation queries).

---

## ═══════════════════════════════════════════
## PART 4: API & BUSINESS LOGIC HARDENING
## ═══════════════════════════════════════════

**Estimated time: 3–5 hours. Lane B tasks.**

### TASK 4.1 — Trip Marketplace Domain (Lane B)

Claim: `claims/EUSHOP-B-004.yaml`

Audit and harden the trip offer lifecycle:

**Reservation state machine — implement explicitly:**
```
DRAFT → OPEN → PARTIALLY_BOOKED → FULLY_BOOKED → COMPLETED | CANCELLED
```
- State transitions must be validated server-side (not just client-side)
- Invalid transitions must return `CONFLICT` error
- `COMPLETED` state: trigger platformFee calculation event to Inngest
- `CANCELLED` state: trigger refund workflow (or refund-placeholder if Stripe not enabled)

**Fee calculation — single source of truth:**
```typescript
// packages/validators/src/fee.ts
export function calculatePlatformFee(agreedSlotFee: number): number {
  return Math.min(1.50, agreedSlotFee * 0.12)
}
// This function must be the ONLY place this logic lives.
// Import it in API router and in any UI that previews fees.
// Test it with unit tests covering edge cases.
```

**Slot availability:**
- Slots must be checked atomically (use DB-level locking or `SELECT FOR UPDATE`)
- No race condition on double-booking (test this explicitly)
- Return remaining slots in list queries (computed, not cached)

---

### TASK 4.2 — Open Asks & Matching Domain (Lane B)

Claim: `claims/EUSHOP-B-005.yaml`

**Signal matching algorithm:**
- When an ask is created, trigger an Inngest job to find matching trip offers
- Matching criteria: overlapping route (origin/destination within N km), timeframe, item category
- Match results stored in DB (not recomputed on every read)
- Expose `GET /asks/:id/matches` procedure returning ranked matches

**Ask lifecycle:**
```
OPEN → MATCHED → NEGOTIATING → FULFILLED | EXPIRED | CANCELLED
```
State transitions server-enforced. `EXPIRED` auto-set by Inngest scheduled job for asks
older than 30 days with no activity.

---

### TASK 4.3 — Local Listings Domain (Lane B)

Claim: `claims/EUSHOP-B-006.yaml`

**Privacy-preserving geohash — verify implementation:**
- Stored geohash precision must be 6 characters (≈1.2km accuracy) for privacy
- Exact lat/lng stored separately in DB but NEVER returned in API responses
- Only geohash centre point returned to clients
- Search radius must use PostGIS `ST_DWithin` on exact coordinates server-side

**Listing discovery:**
- `GET /listings/nearby` takes `geohash` (user's approximate location) and `radiusKm`
- Results ordered by distance (PostGIS `ST_Distance`)
- Paginated with cursor-based pagination (not offset — listings change frequently)

---

### TASK 4.4 — Auth & Trust Layer (Lane B)

Claim: `claims/EUSHOP-B-007.yaml`

**Session hardening:**
- Verify Better Auth session cookies use `httpOnly: true`, `secure: true`, `sameSite: "lax"`
- Session expiry: 7 days rolling for web, 30 days for mobile
- Refresh token rotation enabled

**Trust/verification affordances:**
- User profile must include `verificationStatus: 'unverified' | 'email_verified' | 'identity_verified'`
- Trip creation: require minimum `email_verified`
- High-value transactions: flag as requiring `identity_verified` (even if KYC vendor not yet integrated)
- Add `isTrustedBringer` boolean field (manually settable for now, API for future)

**Rate limiting:**
- Auth endpoints: 10 attempts per 15 minutes per IP
- Trip creation: 5 per hour per user
- Implement using Redis (already in stack)

---

### TASK 4.5 — Realtime Chat (PartyKit) (Lane B)

Claim: `claims/EUSHOP-B-008.yaml`

Audit `apps/party`:
- [ ] Room IDs must be scoped to reservation context (not arbitrary strings)
- [ ] Auth check on PartyKit connection (verify user owns or participates in the reservation)
- [ ] Messages persisted to DB (not lost on Durable Object eviction)
- [ ] Message history loadable via tRPC (not only via PartyKit connection)
- [ ] Typing indicators implemented
- [ ] Read receipts implemented or explicitly deferred to roadmap

---

## ═══════════════════════════════════════════
## PART 5: FRONTEND OVERHAUL
## ═══════════════════════════════════════════

**Estimated time: 5–8 hours. Lane A tasks.**

### TASK 5.1 — Design System & Tokens (Lane A)

Claim: `claims/EUSHOP-A-001.yaml`

**5.1.a — Token audit**
Review `packages/design-tokens`. Ensure:
- Colour palette defined as semantic tokens, not raw hex values in components
- Typography scale: 5–7 levels max, mapped to Tailwind config
- Spacing scale: 4px base grid
- Border radius: consistent levels (sm/md/lg/xl/full)
- Shadow levels: 3–4 levels (surface, raised, overlay, modal)
- Motion: define `transition.fast` (150ms), `transition.base` (250ms), `transition.slow` (400ms)
- Dark mode tokens defined (even if dark mode not yet shipped — avoids rework)

**5.1.b — 2026 Design Language**
Apply these principles across all UI:

*Typography:*
- Variable font if available (Inter Variable, Geist, or similar)
- Type scale using `clamp()` for fluid sizing (not fixed px)
- No system font fallbacks in headings (too inconsistent across OS)

*Colour:*
- Maximum 2 brand colours + neutral scale + semantic (success/warning/error/info)
- WCAG 2.1 AA minimum on ALL text/background combinations (use contrast checker)
- Avoid pure black (#000) — use near-black (e.g. `#0A0A0A` or `#111111`)

*Surfaces:*
- Cards: subtle border + very light shadow (not heavy box-shadow)
- Glass morphism: use SPARINGLY (only for overlays/modals, not cards)
- Micro-animations on interactive elements (hover, press states)

*Layout:*
- CSS Grid for page layouts, Flexbox for component internals
- Consistent container max-widths: `640px` | `768px` | `1024px` | `1280px` | `1440px`
- No magic pixel values — map to spacing scale

---

### TASK 5.2 — Web App Overhaul (Lane A)

Claim: `claims/EUSHOP-A-002.yaml`

**5.2.a — App shell & navigation**
Review `apps/web/src/app/layout.tsx` (H5-shell):
- Navigation: responsive, accessible (`aria-label`, keyboard navigable)
- Loading states: skeleton screens (not spinners) for data-heavy routes
- Error boundaries: per-route error UI with retry action
- Route transitions: view transitions API (with graceful fallback)

**5.2.b — Trip marketplace UI**
Trip listing card must show:
- Route (from → to with city flags/icons)
- Departure date and time (formatted for user's locale)
- Available slots remaining
- Agreed slot fee (formatted as EUR with 2 decimal places)
- Bringer trust level indicator
- One-click "Reserve slot" with optimistic UI update

Trip detail page:
- Full route details with map preview (static map embed, not full MapLibre unless already implemented)
- Bringer profile summary
- Item restrictions clearly stated
- Fee breakdown: slot fee + platform fee = total
- Reservation CTA with confirmation modal

**5.2.c — Open asks UI**
- Ask creation form: route, item category, max budget, timeframe
- Ask list: sorted by recency, filterable by corridor
- Match indicator: badge showing "N matches found" for asks with matches
- Ask detail: matched trips listed in ranked order

**5.2.d — Local listings UI**
- Map-based discovery view (geohash bounding box shown, not exact address)
- Category filter bar (horizontal scroll on mobile)
- Listing card: product, approximate location, finder fee, lister trust level

**5.2.e — Remove ALL AI slop patterns:**
- No "Welcome back, [User]!" everywhere — contextual greetings only on dashboard
- No empty state text like "No trips found. Check back later!" — replace with actionable empties:
  *"No trips on this corridor yet. Be the first to post a route →"*
- No generic "Something went wrong" errors — specific, actionable error messages
- No "Loading..." text — skeleton screens
- No placeholder avatars — initials-based avatar with brand colour background

**VERIFY CHECKPOINT 5.2:**
```bash
pnpm dev:web-api   # Must run without errors
# Manual check: navigate all main routes, verify no console errors
# Check: no hardcoded strings visible that aren't in i18n
```

---

### TASK 5.3 — Internationalisation Hardening (Lane A)

Claim: `claims/EUSHOP-A-003.yaml` (H4-i18n)

**Languages to support at launch:** EN, PL, RO (priority EU diaspora corridors)

**5.3.a — Key completeness**
- Run a missing-key audit: every key in `en.json` must exist in `pl.json` and `ro.json`
- Missing translations must fall back to English (not show key names like `trips.empty.title`)
- Add a CI check: `pnpm i18n:check` that fails if keys are out of sync

**5.3.b — Number & currency formatting**
ALL monetary values must use `Intl.NumberFormat`:
```typescript
// packages/i18n/src/formatters.ts
export function formatCurrency(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount)
}
```
Never concatenate `"€"` manually.

**5.3.c — Date formatting**
ALL dates use `Intl.DateTimeFormat` with user's locale.
Never hardcode month names. Never use `.toLocaleDateString()` without locale param.

**5.3.d — RTL readiness**
Even though no RTL language is in initial scope, ensure layout uses logical CSS properties:
`margin-inline-start` not `margin-left`, `padding-block-end` not `padding-bottom`, etc.
This makes future Arabic/Hebrew support a one-line addition.

---

### TASK 5.4 — Mobile App Parity (Lane A)

Claim: `claims/EUSHOP-A-004.yaml`

Audit `apps/mobile` against web feature list:

| Feature | Web | Mobile | Gap action |
|---------|-----|--------|------------|
| Trip listing & detail | ✓ | ? | Implement if missing |
| Trip reservation | ✓ | ? | Implement if missing |
| Open asks | ✓ | ? | Implement if missing |
| Local listings | ✓ | ? | Implement if missing |
| Realtime chat | ✓ | ? | Implement if missing |
| Auth (login/register) | ✓ | ? | Implement if missing |
| Push notifications | ? | ? | Inngest → Expo push |

For each gap: implement or file a roadmap claim. Do NOT leave empty screens.

**Mobile-specific requirements:**
- Deep linking: `eushop://trip/:id`, `eushop://ask/:id`, `eushop://listing/:id`
- Offline state handling: show cached data with "offline" banner
- Haptic feedback on reservation confirmation
- Biometric auth integration (Face ID / fingerprint) if Better Auth supports it

---

## ═══════════════════════════════════════════
## PART 6: PRODUCT CATALOG OVERHAUL
## ═══════════════════════════════════════════

**Estimated time: 2–3 hours. Lane A/B tasks.**

### TASK 6.1 — Open Food Facts Integration (Lane B)

Claim: `claims/EUSHOP-B-009.yaml`

Audit `packages/catalog-data` and the Inngest ingestion workflow:

- [ ] OFF ingestion job runs on a schedule (weekly recommended)
- [ ] Moderation queue has a UI in `apps/admin` (not just DB entries)
- [ ] Products have categories mapped to Eushop-specific transport categories
  (e.g. "dry goods", "preserved foods", "cosmetics" — not raw OFF categories)
- [ ] Item weight/size estimator present (helps bringers plan slot sizes)
- [ ] Search integration: OFF products indexed in Meilisearch with EU-relevant languages

**Prohibited items list:**
Create `packages/catalog-data/src/prohibited.ts`:
- Restricted items (live animals, currency, pharmaceuticals without proof)
- Legally complex items by corridor (verify customs rules for top 5 corridors)
- This list must be checked at trip-ask matching time (server-side)

---

### TASK 6.2 — Search Quality (Lane B)

Claim: `claims/EUSHOP-B-010.yaml`

Review Meilisearch configuration:

**6.2.a — Index settings**
For `trip_offers` index:
```json
{
  "searchableAttributes": ["origin_city", "destination_city", "description"],
  "filterableAttributes": ["status", "departure_date", "origin_country", "destination_country"],
  "sortableAttributes": ["departure_date", "platform_fee", "created_at"],
  "rankingRules": ["words", "typo", "proximity", "attribute", "sort", "exactness"]
}
```

For `local_listings` index — add geosearch:
```json
{
  "filterableAttributes": ["_geo", "category", "status"],
  "sortableAttributes": ["_geo"]
}
```

**6.2.b — Typo tolerance**
Configure typo tolerance for city names (users often misspell "Bucharest", "Wrocław", etc.)

**6.2.c — Synonyms**
Add synonym list for common corridor cities:
- "Warsaw" ↔ "Warszawa"
- "Bucharest" ↔ "București"
- "Prague" ↔ "Praha"
- "Vienna" ↔ "Wien"

---

## ═══════════════════════════════════════════
## PART 7: INVESTOR & TRACTION SURFACES
## ═══════════════════════════════════════════

**Estimated time: 2–3 hours. Lane A tasks. CRITICAL for YC.**

### TASK 7.1 — Real Metrics Infrastructure (Lane B)

Claim: `claims/EUSHOP-B-011.yaml`

**Every metric on investor surfaces must come from the DB.** Create:

`packages/api-router/src/metrics.ts` — a tRPC procedure (admin-only) returning:

```typescript
type TractionMetrics = {
  totalUsers: number                    // COUNT from users
  activeUsersLast30Days: number         // COUNT sessions/actions in last 30d
  totalTripOffers: number               // COUNT trip_offers
  totalReservations: number             // COUNT reservations
  completedReservations: number         // COUNT WHERE status = COMPLETED
  totalGmv: string                      // SUM of agreed_slot_fees (formatted)
  platformFeeRevenue: string            // SUM of platform_fees (formatted)
  topCorridors: Array<{                 // GROUP BY origin+destination
    origin: string
    destination: string
    tripCount: number
  }>
  weeklyGrowthRate: number              // Calculated from weekly cohort data
}
```

This procedure feeds the investor dashboard. Zero hardcoded numbers.

---

### TASK 7.2 — Investor Surface Polish (Lane A)

Claim: `claims/EUSHOP-A-005.yaml`

**Manifesto page requirements:**
- Clear mission statement (from §1.1 of AI_MANIFESTO: "Get something from somewhere. Bring something for someone.")
- Why now: EU diaspora mobility context, size of opportunity
- Product demo flow (screenshots or embedded demo video)
- Real traction numbers (from Task 7.1 metrics)
- Team section (real names/photos or placeholder that's clearly labelled "team photo")
- Contact/apply CTA

**Tokenized access path:**
- Token validation must work (test the full flow)
- Deck must load within 3 seconds
- Deck content must be accurate (no outdated architecture diagrams)
- Analytics: log each deck view with timestamp (for investor engagement tracking)

**Fee model callout (investors love specificity):**
- Explicitly state: `min(€1.50, 12% of slot fee)`
- Show example: "€10 slot fee → €1.20 platform fee" / "€20 slot fee → €1.50 platform fee"
- Show unit economics potential at scale

---

### TASK 7.3 — Demo Mode (Lane O)

Claim: `claims/EUSHOP-O-004.yaml`

Create a proper demo mode (controlled by `ENABLE_DEMO_MODE=true` env var):

When demo mode is enabled:
- Seeded realistic data pre-loaded
- Demo user auto-logged in (or quick 1-click login)
- Reservation flow works end-to-end but doesn't charge real money
- Chat works (PartyKit connected)
- All features accessible

When demo mode is disabled (production): seeded users cannot log in, demo flag not exposed.

**Never commit `ENABLE_DEMO_MODE=true` to production configs.**

---

## ═══════════════════════════════════════════
## PART 8: TESTING & QUALITY ASSURANCE
## ═══════════════════════════════════════════

**Estimated time: 3–4 hours. All lanes.**

### TASK 8.1 — Unit Test Coverage (Lane B)

Claim: `claims/EUSHOP-B-012.yaml`

Priority test targets (in order):

1. **Fee calculation** (`packages/validators/src/fee.ts`)
   ```typescript
   test('fee is capped at €1.50 for slot fees above €12.50', ...)
   test('fee is 12% for slot fees below €12.50', ...)
   test('fee handles zero slot fee gracefully', ...)
   test('fee handles decimal slot fees correctly', ...)
   ```

2. **State machine transitions** (trip reservation lifecycle)
   ```typescript
   test('cannot transition from COMPLETED to OPEN', ...)
   test('FULLY_BOOKED when last slot reserved', ...)
   test('CANCELLED releases all reserved slots', ...)
   ```

3. **Geohash privacy** (`packages/geo`)
   ```typescript
   test('geohash precision 6 never reveals exact coordinates', ...)
   test('nearby search returns listings within radius', ...)
   ```

4. **Validators** (`packages/validators`)
   - All schemas have positive and negative test cases
   - Edge cases: max values, special characters, Unicode in names

5. **Metrics calculations** (Task 7.1 procedure)
   - Aggregate functions return correct results with known seed data

Target: **80% coverage on business-critical paths listed above.**

---

### TASK 8.2 — Integration Tests (Lane B)

Claim: `claims/EUSHOP-B-013.yaml`

Using Vitest + test DB (Docker Compose):

```typescript
// Test: full trip reservation flow
test('user can reserve a slot and platform fee is calculated correctly', async () => {
  // 1. Create trip offer (bringer)
  // 2. Reserve slot (requester)
  // 3. Confirm reservation
  // 4. Verify platform_fee in DB = min(1.50, slot_fee * 0.12)
  // 5. Verify Inngest event fired
})

// Test: concurrent reservation (race condition)
test('two simultaneous slot reservations on last slot - only one succeeds', async () => {
  // Use Promise.all to simulate race
  // One must succeed, one must get CONFLICT error
})

// Test: geolocation search
test('nearby listings query returns results within radius and not beyond', async () => {
  // Insert listing at known coordinates
  // Query with radius that includes/excludes it
})
```

---

### TASK 8.3 — E2E Test Scaffolding (Lane A)

Claim: `claims/EUSHOP-A-006.yaml`

Set up Playwright. Priority flows:

1. **New user onboarding**: Register → verify email (mock) → complete profile → browse trips
2. **Trip creation**: Login as bringer → create trip → verify it appears in search
3. **Slot reservation**: Login as requester → find trip → reserve slot → receive confirmation
4. **Chat flow**: Both bringer and requester open chat → send messages → verify delivery

These tests run in CI against demo-mode seeded data.

---

### TASK 8.4 — Performance Baseline (Lane O)

Claim: `claims/EUSHOP-O-005.yaml`

Using Lighthouse CI:

Minimum acceptable scores:
- Performance: ≥ 85
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 85

Set up `lighthouserc.json` and add to CI. Fail PR if scores drop below thresholds.

Core Web Vitals targets:
- LCP: < 2.5s
- FID/INP: < 200ms
- CLS: < 0.1

Add to CI: `pnpm lighthouse:ci`

---

## ═══════════════════════════════════════════
## PART 9: SECURITY HARDENING
## ═══════════════════════════════════════════

**Estimated time: 2–3 hours. Lane B + O tasks.**

### TASK 9.1 — API Security Audit (Lane B)

Claim: `claims/EUSHOP-B-014.yaml`

Walk every tRPC procedure and verify:

- [ ] **Authentication**: Protected procedures verify session (not just check `ctx.user !== undefined`)
- [ ] **Authorization**: User can only modify their own resources. Verify ownership before UPDATE/DELETE.
- [ ] **Input sanitisation**: All string inputs trimmed and validated for length
- [ ] **SQL injection**: Impossible with Drizzle ORM (parameterised by default) — verify no raw SQL strings
- [ ] **Mass assignment**: API never accepts arbitrary object spread into DB update
- [ ] **Sensitive field exposure**: User objects never include `password_hash` in responses
- [ ] **Admin procedures**: Admin-only routes verified against `user.role === 'admin'`
- [ ] **Rate limiting**: Sensitive endpoints rate-limited (auth, trip creation, message sending)
- [ ] **CORS**: `apps/api` CORS origin list is explicit (not `*`)
- [ ] **Content Security Policy**: `apps/web` has CSP headers set

### TASK 9.2 — Secrets Audit (Lane O)

Claim: `claims/EUSHOP-O-006.yaml`

```bash
# Scan for accidentally committed secrets
npx secretlint "**/*" --secretlintignore .gitignore

# Check git history for any secrets ever committed
git log --all --full-history -- "*.env" "*.env.*"
trufflehog git file://. --since-commit HEAD~100
```

If any secrets found in history: rotate them immediately, use `git filter-repo` to scrub history.

Add `.gitignore` entries for all `.env.*` files except `.env.example`.
Add `git-secrets` or `detect-secrets` pre-commit hook.

---

## ═══════════════════════════════════════════
## PART 10: ADMIN & OPERATIONS TOOLS
## ═══════════════════════════════════════════

**Estimated time: 2–3 hours. Lane A/B tasks.**

### TASK 10.1 — Admin App Completeness (Lane A)

Claim: `claims/EUSHOP-A-007.yaml`

Audit `apps/admin`. It MUST have working UI for:

- [ ] **Moderation queue**: Review and approve/reject new local listings
- [ ] **Product catalog moderation**: Review OFF-ingested products before they go live
- [ ] **User management**: View users, toggle verification status, suspend accounts
- [ ] **Trip oversight**: View flagged trips, resolve disputes
- [ ] **Metrics dashboard**: Real numbers from Task 7.1 (no hardcoded stats)
- [ ] **Inngest job monitor**: Link to Inngest dashboard or embed job status

Access control: Admin app must require `user.role === 'admin'`. No admin UI accessible to regular users.

---

### TASK 10.2 — Observability (Lane O)

Claim: `claims/EUSHOP-O-007.yaml`

**Structured logging:**
All server logs must use JSON format with:
```json
{
  "level": "info",
  "timestamp": "2026-05-04T12:00:00Z",
  "service": "api",
  "requestId": "uuid",
  "userId": "uuid-or-null",
  "message": "Trip offer created",
  "duration_ms": 45,
  "correlationId": "uuid"
}
```

Remove ALL `console.log` debugging statements. Replace with structured logger.

**Error tracking:**
- Integrate Sentry (or equivalent) in `apps/api` and `apps/web`
- `SENTRY_DSN` added to env vars list
- Source maps uploaded on deploy

**Health endpoint:**
`GET /health` must return:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-05-04T12:00:00Z"
}
```

`GET /health?deep=1` must check:
- DB connection
- Redis connection
- Meilisearch reachability
- Return degraded/unhealthy if any dependency fails

---

## ═══════════════════════════════════════════
## PART 11: DOCUMENTATION OVERHAUL
## ═══════════════════════════════════════════

**Estimated time: 2–3 hours. Lane O tasks.**

### TASK 11.1 — README Overhaul (Lane O)

Claim: `claims/EUSHOP-O-008.yaml`

Root `README.md` must include:

```markdown
# Eushop

> Get something from somewhere. Bring something for someone.

[One paragraph product description]

## Quick Start (< 5 minutes to running locally)
[Exact commands, no assumptions]

## Architecture
[One diagram or clear description]

## Development
[All commands with explanations]

## Contributing
[Claim system explained clearly]

## Environment Setup
[Link to docs/README.md — Environment section]
```

**Test the Quick Start**: Follow the README instructions from scratch in a clean directory. Fix every point where it breaks.

### TASK 11.2 — AGENTS.md (Lane O)

Claim: `claims/EUSHOP-O-009.yaml`

The `AGENTS.md` file is for AI agents working on this codebase. It must include:

- Lane map and ownership
- Hotspot list with serialisation rules
- Claim file format with example
- Forbidden patterns list
- Verify cadence requirements
- Handoff template (from §9 of AI_MANIFESTO)
- Link to `claims/README.md`

### TASK 11.3 — API Documentation (Lane B)

Claim: `claims/EUSHOP-B-015.yaml`

Generate OpenAPI spec from tRPC routes (use `trpc-openapi` or similar):
- All procedures documented with descriptions
- Input/output types documented
- Error codes documented
- Served at `/docs/api` in development mode

---

## ═══════════════════════════════════════════
## PART 12: FINAL YC READINESS CHECKLIST
## ═══════════════════════════════════════════

**Run this checklist after all parts complete. Every item must be GREEN before considering YC-ready.**

### Product & Data
- [ ] Zero mock/fake/placeholder data visible anywhere in the app
- [ ] Zero "TODO", "FIXME", "HACK" comments in production-facing code
- [ ] All error messages are user-facing friendly (no stack traces, no DB errors)
- [ ] All monetary values display correctly with currency formatting
- [ ] State machines explicitly implemented and tested
- [ ] Fee calculation has unit tests passing

### Technical Quality
- [ ] `pnpm verify` passes: format + typecheck + lint + unit tests + claims + build
- [ ] Zero TypeScript `any` in core business logic
- [ ] Zero N+1 queries in list endpoints
- [ ] All secrets in env vars (none committed)
- [ ] Health endpoint returns live status
- [ ] Structured logging in place

### UX & Design
- [ ] All routes have loading states (skeletons)
- [ ] All routes have error states (with retry)
- [ ] All empty states are actionable
- [ ] Mobile responsive (verify at 375px, 768px, 1280px)
- [ ] Accessibility: keyboard navigable, ARIA labels on interactive elements
- [ ] Lighthouse scores ≥ 85 on all metrics
- [ ] No console errors in browser on any main route

### Investor Readiness
- [ ] Investor surface works end-to-end (tokenized access, deck loads)
- [ ] All displayed metrics are real (DB-sourced)
- [ ] Fee model explicitly shown: `min(€1.50, 12% of slot fee)`
- [ ] Demo mode works for investors to try the product
- [ ] Contact/apply CTA functional

### Infrastructure
- [ ] CI/CD pipeline runs on every PR
- [ ] DB migrations run in CI
- [ ] Sentry/error tracking configured
- [ ] All 3 languages (EN/PL/RO) have complete translations
- [ ] `README.md` Quick Start works from scratch

---

## ═══════════════════════════════════════════
## PART 13: AGENT HANDOFF PROTOCOL
## ═══════════════════════════════════════════

**After each work session, complete this template and commit it to `docs/handoffs/YYYY-MM-DD.md`:**

```yaml
HANDOFF_OBJECTIVE: [exact task range worked on, e.g. "Part 3 Tasks 3.1–3.2"]
HANDOFF_STATUS:
  completed:
    - [list exact tasks completed]
  in_progress:
    - [list tasks started but not finished, with current state]
  not_started:
    - [list remaining tasks]
HANDOFF_TOUCHED_PATHS:
  - [exact file paths modified]
HANDOFF_CHECKS_RUN:
  - pnpm verify: PASS | FAIL (with error summary if FAIL)
  - pnpm claims:check: PASS | FAIL
HANDOFF_BLOCKERS:
  - [anything that blocked progress or needs human decision]
HANDOFF_ASSUMPTIONS:
  - [decisions made without explicit instruction — label UNVERIFIED if uncertain]
HANDOFF_RISK_LEDGER:
  - [known regressions or risky changes]
HANDOFF_NEXT_STEP: [single best first action for next agent session]
```

---

## ═══════════════════════════════════════════
## APPENDIX: ANTI-PATTERNS TO ELIMINATE
## ═══════════════════════════════════════════

These patterns were found or are common in AI-assisted codebases.
**Every instance must be hunted and eliminated.**

### AI Slop Patterns (Code)
```typescript
// ❌ NEVER: Vague catch-all
catch (error) {
  console.log('Error:', error)
  return null
}

// ✅ CORRECT: Typed, specific, actionable
catch (error) {
  if (error instanceof TRPCError) throw error
  logger.error('Trip creation failed', { error, userId: ctx.user.id })
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Trip could not be created' })
}
```

```typescript
// ❌ NEVER: Inline hardcoded data
const TRIPS = [
  { id: '1', from: 'Warsaw', to: 'London', fee: 10 },
  { id: '2', from: 'Bucharest', to: 'Paris', fee: 15 },
]

// ✅ CORRECT: Always from DB/API
const trips = await db.select().from(tripOffers).where(eq(tripOffers.status, 'OPEN'))
```

```typescript
// ❌ NEVER: any type to silence errors
const user: any = await getUser()

// ✅ CORRECT: Proper type narrowing
const user = await getUser()
if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' })
// user is now narrowed to non-null User type
```

### AI Slop Patterns (UI)
```tsx
// ❌ NEVER: Generic empty state
<EmptyState message="No data found" />

// ✅ CORRECT: Contextual, actionable empty state
<EmptyState
  title="No trips on this corridor yet"
  description="You could be the first bringer on the Warsaw–London route."
  action={{ label: "Post a trip", href: "/trips/new" }}
/>
```

```tsx
// ❌ NEVER: Hardcoded metric
<MetricCard title="Total Users" value="1,247" />

// ✅ CORRECT: Live from API
const { data: metrics } = useMetrics()
<MetricCard title="Total Users" value={metrics?.totalUsers ?? '—'} />
```

### Documentation Anti-Patterns
```markdown
<!-- ❌ NEVER: Vague placeholder -->
## Contributing
We welcome contributions! Please read our contributing guide.

<!-- ✅ CORRECT: Specific, actionable -->
## Contributing
1. Create a claim file in `claims/` (see claims/README.md for format)
2. Run `pnpm claims:check` to validate
3. Make your changes in the scoped files only
4. Run `pnpm verify` — must pass fully
5. Submit PR with claim ID in title: "feat(B-014): rate limit auth endpoints"
```

---

*End of EUSHOP Cursor Agent Master Plan — v1.0 — May 2026*
*Total estimated agent hours: 25–45 depending on current codebase state*
*This document should be updated after each major phase completes.*
