# Cursor parallel backlog (merge-safe playbook)

This document is the **operating queue** for humans and Cursor agents. It does **not** replace product specs: see [editorial.md](editorial.md), [ops/environment.md](ops/environment.md), and [docs/agents.md](agents.md).

---

## How to use this file in Cursor

1. **Read [docs/agents.md](agents.md)** before claiming work: lanes **A** (web/UI), **B** (API/data), **Orchestrator** (root/CI/lockfile), plus hotspot sub-lanes **H1–H6**.
2. **Pick a task** below (or add one with a new `EUSHOP-*` id). Add `docs/claims/EUSHOP-<lane>-<nnn>.yaml` (copy from [`claims/_template.yaml`](claims/_template.yaml); filename must match `id`) before substantive edits—**no overlapping `touches`** with another active claim, and **one active claim per hotspot** (enforced by `pnpm claims:check` in CI).
3. **Run `pnpm verify`** after every 2–3 completed tasks per lane (same cadence as docs/agents.md).
4. **One PR per branch**; rebase or merge `main` before final verify. Prefer **small PRs** so many agents can land serially without pain.

---

## Merge contract (non-negotiable)

| Rule | Detail |
|------|--------|
| Branching | One feature branch per task or tight batch; avoid long-lived shared branches. |
| PR size | Prefer one logical change set; typical **1–3** focused edits per PR per lane. |
| Single writer | **No two agents** edit the same file at the same time. If two tasks need the same file, **split** the task or **sequence** merges. |
| Hotspots | For **H1–H6** in [Conflict heatmap](#conflict-heatmap), **one active claim at a time** per hotspot unless the task is explicitly **append-only** (e.g. new router line + new file). |
| Orchestrator-only paths | Human (or a single designated infra pass) owns: root `package.json`, `pnpm-lock.yaml`, `turbo.json`, `.github/workflows/*`, `.env.example`, `README.md`. Agents **propose** diffs; avoid parallel lockfile PRs. |
| Verification | `pnpm verify` on the integration branch before merge when touching code (format, typecheck, lint, unit tests, **claims:check**, build). |

**“Infinite” parallelism** here means **unbounded tasks over time** and **many non-overlapping PRs**. It does **not** mean unlimited concurrent writers on the same paths—that always conflicts.

---

## Lane ownership (from docs/agents.md + PR guidance)

| Lane | Edit (single source of truth) | Read-only elsewhere | Typical PR size |
|------|------------------------------|---------------------|-----------------|
| **A — Web + UI** | `apps/web`, `packages/ui`, `packages/i18n`, `packages/tokens`, `packages/catalog` | All other paths | 1–2 screens/components or one locale batch |
| **B — API + data** | `apps/api`, `apps/party`, `packages/api-router`, `packages/db`, `packages/auth`, `packages/validators`, `packages/geo` | All other paths | One router feature + tests, or one migration slice |
| **O — Orchestrator** | Root configs, CI, `.env.example`, `README.md`, lockfile | N/A | One infra concern per PR |

**Background agents:** run **up to 10** in parallel when **`pnpm claims:check`** passes (no overlapping `touches`, one active claim per **H1–H6** hotspot). See [docs/agents.md](agents.md).

---

## Conflict heatmap (high contention)

Treat these as **serial** or **append-only** unless you own the whole change:

| ID | Path / area | Why | Merge strategy |
|----|-------------|-----|----------------|
| **H1-router** | [packages/api-router/src/router.ts](../packages/api-router/src/router.ts) | Central `appRouter` composition | Append new router import + registration in **one** PR; avoid drive-by refactors. |
| **H2-context** | [packages/api-router/src/context.ts](../packages/api-router/src/context.ts) | Shared tRPC context | One PR at a time for structural changes. |
| **H3-schema** | [packages/db/src/schema/*.ts](../packages/db/src/schema/) | Migrations affect everyone | One migration / feature; coordinate `migrate` order. |
| **H5-shell** | `apps/web/src/app/layout.tsx`, route `error.tsx` / `loading.tsx` under `apps/web/src/app/**` | Global shell | Small diffs; one agent per concern. |
| **H4-i18n** | `packages/i18n/src/messages/*.json` (all locales) | Many keys touched | Batch **one namespace** per PR (e.g. `trips.*` only) to reduce JSON conflicts. |
| **H6-deps** | Root `package.json` / `pnpm-lock.yaml` / `turbo.json` | Lockfile conflicts | Orchestrator-only or single “deps” PR. |

---

## Task ID scheme

Format: **`EUSHOP-<lane>-<nnn>`**

- **Lane:** `A` | `B` | `O`
- **nnn:** three digits (001, 002, …), unique within lane
- Example: `EUSHOP-B-042` — API lane task 42.

Grep-friendly: `EUSHOP-A-`, `EUSHOP-B-`, `EUSHOP-O-`.

---

## Parallelism rules (quick)

| Situation | Safe? |
|-----------|--------|
| Lane A: `apps/web` page + Lane B: `packages/api-router` router file, **no shared imports** in same commit touching both | **Yes** (two agents) |
| Both agents edit [trips router](../packages/api-router/src/routers/trips.ts) | **No** — sequence |
| Lane A: all six `messages/*.json` keys for `nav.*` in one PR | **Yes** — one writer |
| Two PRs both add deps in root `package.json` | **No** — orchestrator merges one deps PR |

**Scale-out:** N developers × M tasks = many branches; merge throughput is limited by **review** and **hotspot** contention, not by this doc.

---

## Claim file (required)

Copy [`docs/claims/_template.yaml`](claims/_template.yaml) to `docs/claims/EUSHOP-<lane>-<nnn>.yaml` (filename = `id`). Lifecycle and hotspot rules: [`docs/claims/README.md`](claims/README.md).

Minimal example:

```yaml
id: EUSHOP-A-001
lane: A
branch: agent/a-001-discover-copy
owner: <cursor-session-or-github-handle>
status: claimed
touches:
  - apps/web/src/app/(product)/discover/page.tsx
```

---

## Repo truth links (do not duplicate specs here)

- [docs/agents.md](agents.md) — lanes, hotspots H1–H6, verify cadence, claim files
- [docs/claims/README.md](claims/README.md) — claim file lifecycle
- [editorial.md](editorial.md) — copy inventory, voice, EN-only policy
- [ops/environment.md](ops/environment.md) — env matrix
- [eslint-next-migration.md](eslint-next-migration.md) — lint migration

---

## Backlog (checkboxes)

**Legend:** `[A]` Web/UI · `[B]` API/data · `[O]` Orchestrator

Add a **claim YAML** in `claims/` when starting work (see above). IDs are suggestions—renumber if you add tasks in between.

### Priority 0 — Sell-ready closure

- [ ] `[O]` **EUSHOP-O-001** Run documented Stripe staging E2E once; fix gaps in ops docs only if needed. _(human / staging)_
- [ ] `[B]` **EUSHOP-B-001** Webhook replay idempotency spot-check (logs + DB) after deploy. _(human / staging)_
- [ ] `[A]` **EUSHOP-A-001** Fee disclosure copy pass on web reservation + mobile trip screen ([editorial.md](editorial.md) section 2). _(partial: mobile `tripDetailMobile.*`, web reservations notice — audit remains)_
- [x] `[B]` **EUSHOP-B-002** Confirm `removed` listings never appear in public `listings.*` queries; add regression test if missing.

### Phase 1 — Monetization (Stripe)

- [ ] `[A]` **EUSHOP-A-002** Connect / payout CTA on any remaining seller-only surfaces (besides profile + new trip/listing).
- [x] `[B]` **EUSHOP-B-003** Stripe webhook: extend event coverage for disputed / refund branches; structured logs. _(structured JSON log line per event + ops doc; branch handlers were already present)_
- [ ] `[B]` **EUSHOP-B-004** Reservation payment row updates: align `reservation_payments.status` with PI lifecycle docs.
- [x] `[A]` **EUSHOP-A-003** Admin payments table: filters (status, date) without new API if possible; else small `payments` procedure.
- [ ] `[O]` **EUSHOP-O-002** `.env.example` / [environment.md](ops/environment.md) drift check after Stripe changes.

### Phase 2 — Trust and safety

- [ ] `[B]` **EUSHOP-B-005** KYC: align `trust` router with [verified-bringer-kyc.md](ops/verified-bringer-kyc.md); webhook or polling if specified.
- [ ] `[A]` **EUSHOP-A-004** Verified bringer badge on any remaining public profile / card surfaces.
- [ ] `[A]` **EUSHOP-A-005** Admin audit: highlight `remove_listing` / KYC actions (UX only, same API).
- [ ] `[B]` **EUSHOP-B-006** Rate limits: review `media`, `catalog`, `messaging` limits vs prod traffic assumptions.
- [ ] `[B]` **EUSHOP-B-007** Abuse: report triage procedure in `trust` (if product asks)—keep migrations small.

### Phase 3 — Growth and discovery

- [x] `[B]` **EUSHOP-B-008** Inngest: trip ↔ request notification fan-out (one workflow at a time). _(see `matchRequestToTrip`, `matchTripsForOpenRequest`, `notifyReservationCreated`, etc. in `apps/api/src/inngest/` — extend if product needs new triggers)_
- [ ] `[B]` **EUSHOP-B-009** Meilisearch: ranking / synonyms experiment (config only + docs).
- [ ] `[A]` **EUSHOP-A-006** Roadmap / marketing copy for “restock alerts” when backend exists (no false promises).
- [ ] `[A]` **EUSHOP-A-007** Mobile: parity pass vs web for trip post + reservation labels.
- [ ] `[B]` **EUSHOP-B-010** Traction: optional new honest metric tile (API + web) — no inflated numbers.

### Phase 4 — i18n and marketing

- [x] `[A]` **EUSHOP-A-008** Migrate one marketing page at a time to `next-intl` (namespace per page). _(changelog done; continue manifesto, roadmap, … per page)_
- [ ] `[A]` **EUSHOP-A-009** `manifesto` / `pitch` strings: inventory vs [editorial.md](editorial.md) section 3.
- [ ] `[A]` **EUSHOP-A-010** Plural / ICU review for `trips.*` and `reservationForm.*` in all locales.
- [ ] `[O]` **EUSHOP-O-003** Voice glossary cross-check after each marketing migration PR.

### Phase 5 — Reliability and ops

- [x] `[A]` **EUSHOP-A-011** Sentry: wire `captureException` in [error boundary](../apps/web/src/app/error.tsx) when SDK present. _(via `captureClientException` in `error.tsx`)_
- [x] `[O]` **EUSHOP-O-004** Deploy runbook: add service-specific rollback notes if missing.
- [ ] `[O]` **EUSHOP-O-005** ESLint: one app migrated per [eslint-next-migration.md](eslint-next-migration.md) step (no big bang).

### Phase 6 — Tech debt

- [ ] `[B]` **EUSHOP-B-011** Vitest: webhook branch tests (pure helpers only).
- [ ] `[B]` **EUSHOP-B-012** Vitest: reservation state guard / fee edge cases.
- [ ] `[O]` **EUSHOP-O-006** Dependabot: tune groups / ignore major bumps policy (doc only or config).
- [ ] `[A]` **EUSHOP-A-012** Storybook or visual regression — only if repo already has pattern (avoid scope creep).

### Lane A — Web quick wins (unscheduled)

- [ ] `[A]` **EUSHOP-A-013** Accessibility pass: one flow (trips list or discover).
- [x] `[A]` **EUSHOP-A-014** SEO: metadata for one dynamic route pattern. _(trip detail `twitter` card; listings OG/Twitter earlier)_
- [ ] `[A]` **EUSHOP-A-015** Remove dead components (grep + delete) — one directory.
- [ ] `[A]` **EUSHOP-A-016** Consistent `loading.tsx` / `error.tsx` under `(product)` where missing.
- [ ] `[A]` **EUSHOP-A-017** Image `next/image` remotePatterns audit vs `R2_PUBLIC_URL`.
- [ ] `[A]` **EUSHOP-A-018** Cookie consent + PostHog: verify no load before consent.
- [ ] `[A]` **EUSHOP-A-019** Profile: payouts card copy alignment with [stripe-connect.md](ops/stripe-connect.md).
- [ ] `[A]` **EUSHOP-A-020** Trip detail: i18n for remaining hardcoded strings (aside “Reserve” block).
- [x] `[A]` **EUSHOP-A-021** Listings detail: share / OG preview sanity.
- [x] `[A]` **EUSHOP-A-022** Requests flow: empty states and errors (one page).
- [ ] `[A]` **EUSHOP-A-023** Messages UI: mobile width / thread scroll bugfix (if reported).
- [ ] `[A]` **EUSHOP-A-024** Admin: read-only polish (spacing, table headers only).

### Lane B — API quick wins (unscheduled)

- [ ] `[B]` **EUSHOP-B-013** `trips` router: extract fee/capture helpers for readability (no behaviour change).
- [ ] `[B]` **EUSHOP-B-014** `listings` router: pagination cursor consistency.
- [ ] `[B]` **EUSHOP-B-015** `requests` router: validate input edge cases.
- [ ] `[B]` **EUSHOP-B-016** `notifications` router: batch size limits.
- [ ] `[B]` **EUSHOP-B-017** PartyKit: document message shape versioning in README.
- [ ] `[B]` **EUSHOP-B-018** Auth: session expiry messaging for mobile clients.
- [ ] `[B]` **EUSHOP-B-019** Geo: cell precision tests (unit).
- [ ] `[B]` **EUSHOP-B-020** Validators: shared zod for repeated UUID params.
- [ ] `[B]` **EUSHOP-B-021** DB index review on `trip_reservations` hot paths (explain only + follow-up migration).
- [x] `[B]` **EUSHOP-B-022** API `/health`: optional dependency checks flag (off by default).

### Lane O — Orchestrator (unscheduled)

- [ ] `[O]` **EUSHOP-O-007** CI: cache keys review (turbo, pnpm).
- [x] `[O]` **EUSHOP-O-008** README: “parallel agents” pointer to **this file**.
- [x] `[O]` **EUSHOP-O-009** SECURITY.md contact / policy stub if required.
- [ ] `[O]` **EUSHOP-O-010** License / third-party notices audit (if shipping binaries).
- [ ] `[O]` **EUSHOP-O-011** Branch protection rules doc (GitHub settings checklist).

### Stretch — only if lanes idle

- [ ] `[B]` **EUSHOP-B-023** GraphQL or public REST **not** started here — requires ADR; use **O** lane first.
- [ ] `[A]` **EUSHOP-A-025** Design system tokens: dark mode experiment (flagged).
- [ ] `[A]` **EUSHOP-A-026** PWA manifest review (`apps/web`).

---

## Mega roadmap — goals (keep the thread)

Use this as the **north star** when the checkbox list feels fragmented. It does not replace counsel, staging proof, or GTM work.

1. **Sell-ready** — Stripe staging E2E (O-001), webhook replay check (B-001), Terms/Privacy/imprint (human), fee copy aligned with [`calculatePlatformFeeCents`](../packages/validators/src/index.ts).
2. **Trust** — KYC badge truthfulness, moderation SLAs, rate limits vs traffic (B-006), abuse triage if product ships reports (B-007).
3. **Density** — Inngest matching workflows tuned; Meilisearch ranking; honest traction metrics (B-010); corridor playbooks in [ops/corridor-playbooks.md](ops/corridor-playbooks.md).
4. **i18n** — Marketing pages → `next-intl` one by one; ICU/plurals for `trips.*` / `reservationForm.*`; translate mobile trip strings beyond EN placeholders in non-EN JSON.
5. **Quality** — a11y per core flow (A-013), `loading`/`error` shells where missing (A-016), Vitest gaps (B-011, B-012), Playwright growth on staging.
6. **Platform** — ESLint migration steps (O-005), dependabot policy refinement (O-006), optional PWA/dark mode stretch (A-026, A-025).
7. **Long arc** — Listing checkout / auctions where legal; mobile pay parity; public API only after ADR (B-023). See [roadmap-epics.md](roadmap-epics.md).

---

## Maintenance

- **Human orchestrator** periodically moves `done` tasks out or marks them in git history via merged PRs.
- Prefer **deleting completed fluff** over keeping hundreds of checked boxes; Git history is the archive.
- When adding tasks, assign the next free `EUSHOP-<lane>-<nnn>` to avoid duplicate IDs.

---

_Last updated: playbook generated for Cursor parallel workflows. Align with [docs/agents.md](agents.md) always._
