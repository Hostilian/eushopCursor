# Repository package inventory (Part 1.1)

Generated: 2026-05-04. Source: `README.md`, `package.json` workspaces, spot checks.

| package / app | purpose | status | has_mock_data | hardcoded_strings | tests | notes |
|---------------|---------|--------|-----------------|---------------------|-------|-------|
| apps/web | Next.js 15 product + marketing | shipped | partial (demo showcase) | i18n-backed; some EN-only per docs | e2e + unit partial | `/traction` uses live DB counts |
| apps/mobile | Expo client | partial vs web | partial (placeholders in forms) | mixed | limited | Parity gaps tracked in plan |
| apps/api | Hono + tRPC + Inngest | shipped | tests only | env-driven | stripe-webhook tests | `/health` + deep probe |
| apps/admin | Moderation cockpit | shipped | unlikely | i18n | partial | Catalog UGC flows |
| apps/party | PartyKit realtime | shipped | n/a | n/a | manual | Chat DOs |
| packages/api-router | Domain tRPC routers | shipped | test files | validators | many router tests | Modular monolith |
| packages/db | Drizzle schema + migrate + seed | shipped | seed = synthetic but realistic policy | n/a | migration scripts | PostGIS |
| packages/auth | Better Auth | shipped | test doubles | n/a | unit tests | |
| packages/validators | Zod + fee math | shipped | no | fee constants documented | platform-fee tests | Single source fee cents |
| packages/i18n | Messages + locale list | shipped | no | JSON copy | none | EN/DE/FR/ES/IT/PL; RO added in unified plan |
| packages/ui | Shared primitives | shipped | Storybook? | components | partial | |
| packages/tokens | palette, type | shipped | no | tokens | none | |
| packages/geo | geohash privacy | shipped | no | n/a | check geo pkg | |
| packages/catalog | EU food seed + OFF | shipped | curated seed | static catalog | partial | |
| packages/config | eslint/tsconfig | shipped | n/a | n/a | n/a | shared config |

**Status legend:** shipped = production path exists; partial = roadmap items or uneven coverage.
