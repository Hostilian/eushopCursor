# Agent claims (merge-safe parallelism)

Each **active** task has **one YAML file** in this directory so `pnpm claims:check` can fail CI when two agents claim overlapping paths or the same **hotspot sub-lane**.

## Lifecycle

1. **Before editing** non-trivial code, add `docs/claims/EUSHOP-<lane>-<nnn>.yaml` (copy from [`_template.yaml`](./_template.yaml)). The **`id` must match the filename** (e.g. `EUSHOP-B-042` → `EUSHOP-B-042.yaml`).
2. Set `status: claimed` (or `queued` if waiting on deps). List every path you expect to touch under `touches` (files or repo-root globs). Run `pnpm claims:check` locally; fix overlaps before pushing.
3. When you open a PR, set `status: in_review`.
4. When the PR merges, **delete the claim file** in that PR (or immediately after). **Merged + file removed = done.** Do not leave `status: done` files around long term—remove the file so `main` stays clean.

## Hotspot sub-lanes (one open claim globally)

| ID          | Scope                                                                 |
| ----------- | --------------------------------------------------------------------- |
| **H1-router** | `packages/api-router/src/router.ts`                                 |
| **H2-context** | `packages/api-router/src/context.ts`                               |
| **H3-schema** | `packages/db/src/schema/**`                                         |
| **H4-i18n** | `packages/i18n/src/messages/**` (prefer one JSON namespace per PR)    |
| **H5-shell** | `apps/web/src/app/layout.tsx` and route-level `error.tsx` / `loading.tsx` under `apps/web/src/app/**` |
| **H6-deps** | Repo-root `package.json`, `pnpm-lock.yaml`, `turbo.json` (lane **O** only) |

If your `touches` intersect any hotspot path, **no other non-done claim** may touch that hotspot. Set `hotspot_sub_lane` to the hotspot id when applicable (must be consistent with `touches`).

## Top lanes (ownership)

- **A** — `apps/web`, `packages/ui`, `packages/i18n`, `packages/tokens`, `packages/catalog`
- **B** — `apps/api`, `apps/party`, `packages/api-router`, `packages/db`, `packages/auth`, `packages/validators`, `packages/geo`
- **O** — root configs, CI, `.env.example`, `README.md`, lockfile

`lane` in the YAML must match the task id (`EUSHOP-A-*` → `lane: A`, etc.).

## Rules of thumb

- Prefer **literal paths** in `touches`. Use globs only when necessary; avoid two different globs that could match the same file across two claims.
- **Never** overlap `touches` with another claim that is not `done`.
- After **2–3** tasks in a lane, run **`pnpm verify`** (includes `claims:check`).

See [docs/agents.md](../agents.md) and [docs/cursor-parallel-backlog.md](../cursor-parallel-backlog.md).
