# ESLint: migrating off `next lint`

Next.js 16 will remove `next lint`. This repo still uses `next lint` in `apps/web` and `apps/admin` (see CI output).

## Target state

- Single **ESLint flat config** entry (already under [`packages/config/eslint.config.js`](../packages/config/eslint.config.js)) consumed by `eslint .` in each app.
- Remove `next lint` scripts; use `eslint` with `--max-warnings=0` in CI.

## Steps (when you schedule the migration)

1. Add `eslint.config.js` at `apps/web` and `apps/admin` that extends the shared config (or import the shared flat config).
2. Ensure `@next/eslint-plugin-next` is listed and `FlatCompat` used if needed for legacy plugins.
3. Replace `"lint": "next lint"` with `"lint": "node ../../node_modules/eslint/bin/eslint.js -c eslint.config.js ."` (or root eslint with `--filter` paths).
4. Fix any new violations; commit.

## Typecheck vs Vitest

Packages `auth`, `geo`, `api-router` exclude `*.test.ts` from default `tsc` so CI typecheck does not require `vitest` types. Unit tests still run via `pnpm test:unit`. The repo also has a root [`tsconfig.tests.json`](../tsconfig.tests.json); run **`pnpm typecheck:tests`** when you want `tsc` over `*.test.ts` without pulling Vitest into each package’s main `tsconfig`.

## `declaration: false`

`@eushop/auth` and `@eushop/api-router` disable `.d.ts` emit to avoid TS2742 with nested `better-auth` / `zod` paths. If you publish these packages, re-enable declarations and add explicit return types on exported symbols.
