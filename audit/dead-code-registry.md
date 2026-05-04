# Dead code & redundancy (Part 1.3)

## ts-prune

`npx ts-prune` was attempted from repo root; it **failed** because there is no root `tsconfig.json` (monorepo uses per-package TypeScript projects). **Recommendation:** run per package, e.g. `pnpm --filter @eushop/api-router exec ts-prune`, or add a root solution tsconfig for tooling only.

## Short / stub files

No automated `<10 lines` sweep in this audit pass. Prefer follow-up with package-scoped `wc` or knip after root tooling decision.

## Duplicate types

No `audit/all-types.txt` export in this pass (same reason — multi-project). **Next step:** optional CI job aggregating `export type` lines per package.

## Observations

- Fee logic centralized in `@eushop/validators` (`calculatePlatformFeeCents`) — avoid duplicating in UI except for display of API-returned strings.
