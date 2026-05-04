# Dead code & redundancy (Part 1.3)

## ts-prune

`npx ts-prune` from the repo root **fails** because there is no root `tsconfig.json` (this monorepo uses per-package projects). Use package-scoped runs instead, for example:

```bash
pnpm --filter @eushop/api-router exec ts-prune
pnpm --filter @eushop/web exec ts-prune
```

If `ts-prune` is not installed in that package, use `pnpm --filter @eushop/web dlx ts-prune` (or `pnpm dlx ts-prune` from `cd apps/web` where a `tsconfig.json` exists). A root “solution” `tsconfig.json` is optional tooling only; do not add one unless `pnpm verify` stays green.

## Short / stub files

No automated `<10 lines` sweep in this audit pass. Prefer follow-up with package-scoped `wc` or knip after root tooling decision.

## Duplicate types

No `docs/audit/all-types.txt` export in this pass (same reason — multi-project). **Next step:** optional CI job aggregating `export type` lines per package.

## Observations

- Fee logic centralized in `@eushop/validators` (`calculatePlatformFeeCents`) — avoid duplicating in UI except for display of API-returned strings.
