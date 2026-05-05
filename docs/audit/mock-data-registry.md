# Mock / slop registry (Part 1.2)

Scan date: 2026-05-05 (ripgrep `mock|placeholder` in `*.ts,*.tsx`; TODO/FIXME sample refreshed).

## REMOVE / review (legitimate test doubles)

| area | files | category |
|------|-------|----------|
| Unit tests | `packages/api-router/src/routers/trips-confirm-reservation.test.ts`, `apps/api/src/routes/stripe-webhook.test.ts`, `packages/auth/src/send-magic-link-email.test.ts` | REPLACE-WITH-REAL — keep as tests; not production slop |

## REPLACE-WITH-REAL / UI copy audit

| pattern | example files | action |
|---------|---------------|--------|
| `placeholder` in forms | `trip-offer-form.tsx`, `listing-form.tsx`, `request-form.tsx`, `product-picker.tsx`, mobile `*/new.tsx`, `sign-in.tsx`, `chat/[id].tsx` | VERIFY: HTML placeholders are UX-only, not fake data rows |
| `mock` in mobile i18n | `apps/mobile/src/lib/i18n.ts` | VERIFY: dev-only or remove if obsolete |
| Chat / profile | `chat-view.tsx`, `profile-panel.tsx`, `search-client.tsx`, `sign-in-form.tsx` | spot-check for hardcoded demo users |

## Console / debug

- `console.log` in `*.ts,*.tsx` (excluding node_modules): **none** at scan time — good.

## TODO / FIXME (non-doc)

Refresh status (2026-05-05):

- No active `TODO`/`FIXME` hits in `packages/tokens/src/index.ts`.
- No active `TODO`/`FIXME` hits in `apps/web/src/app/**`.
- Remaining TODO-style text is in documentation/planning only (expected).

## Investor metrics (`REPLACE-WITH-REAL` gate)

- `/traction`: `traction.liveCounts` + `weeklyGrowth` from API — **REAL** (see `apps/web/src/app/(marketing)/traction/page.tsx`).
- Home KPI strip: catalog stats + optional demo tiles when `ENABLE_DEMO_MODE` — **labelled demo**; live metrics remain on `/traction` per `kpi-strip.tsx` comments.
