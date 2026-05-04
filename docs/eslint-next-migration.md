# ESLint: migrating off `next lint`

Next.js 16 will remove `next lint`. **`apps/web`** and **`apps/admin`** now use **`eslint.config.mjs`** with shared [`packages/config/eslint.config.js`](../packages/config/eslint.config.js) plus `next/core-web-vitals` via `FlatCompat`.

## Target state

- `eslint` drives Next app lint; CI continues to run `pnpm lint` (Turbo).

## Follow-ups

- Tighten to `--max-warnings=0` per package once baseline is clean.

## Typecheck vs Vitest

Packages `auth`, `geo`, `api-router` exclude `*.test.ts` from default `tsc` so CI typecheck does not require `vitest` types. Unit tests still run via `pnpm test:unit`. The repo also has [`.config/tsconfig.tests.json`](../.config/tsconfig.tests.json); run **`pnpm typecheck:tests`** when you want `tsc` over `*.test.ts` without pulling Vitest into each package’s main `tsconfig`.

## `declaration: false`

`@eushop/auth` and `@eushop/api-router` disable `.d.ts` emit to avoid TS2742 with nested `better-auth` / `zod` paths. If you publish these packages, re-enable declarations and add explicit return types on exported symbols.
