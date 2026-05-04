# Agent lanes (Eushop)

Run **up to 10** background Cursor agents in parallel **only** when `pnpm claims:check` passes: no overlapping `touches` between active claims and **at most one active claim per hotspot sub-lane** (see below).

## Top lanes (who may edit what)

| Lane | Edit | Read-only |
| --- | --- | --- |
| **A — Web + UI** | `apps/web`, `packages/ui-web`, `packages/i18n`, `packages/design-tokens`, `packages/catalog-data` | Everything else |
| **B — API + data** | `apps/api`, `apps/party`, `packages/api-router`, `packages/db`, `packages/auth`, `packages/validators`, `packages/geo` | Everything else |
| **O — Orchestrator (human)** | Root configs, CI, `.env.example`, `README.md`, lockfile | N/A for agent-owned lanes |

## Hotspot sub-lanes (globally serial — one active claim each)

Even across lanes **A** and **B**, two agents must not have open claims that both touch the same hotspot. Prefer **append-only** changes where noted.

| ID | Paths / scope | Merge strategy |
| --- | --- | --- |
| **H1-router** | `packages/api-router/src/router.ts` | Append router import + registration in **one** PR; no drive-by refactors. |
| **H2-context** | `packages/api-router/src/context.ts` | One structural change at a time. |
| **H3-schema** | `packages/db/src/schema/**` | One migration / feature slice; coordinate order. |
| **H4-i18n** | `packages/i18n/src/messages/**` | One **namespace** per PR (e.g. `trips.*` only). |
| **H5-shell** | `apps/web/src/app/layout.tsx`, route `error.tsx` / `loading.tsx` under `apps/web/src/app/**` | One concern per PR. |
| **H6-deps** | Repo-root `package.json`, `pnpm-lock.yaml`, `turbo.json` | **Lane O only**; never parallel lockfile PRs. |

## Mandatory claim files

1. **Before** substantive edits, add `claims/EUSHOP-<lane>-<nnn>.yaml` (see [`claims/_template.yaml`](claims/_template.yaml) and [`claims/README.md`](claims/README.md)). Filename must match `id`.
2. Run **`pnpm claims:check`** locally; fix overlaps or wait for the conflicting claim to merge.
3. Open PR → set claim `status: in_review`.
4. After merge → **delete** the claim file in that PR (done = file removed from `main`).

## Verify cadence

After **2–3** tasks per lane, run **`pnpm verify`** once (format, typecheck, lint, unit tests, **claims:check**, build — matches CI), then resume agents.

**Merge-safe parallel backlog:** [docs/cursor-parallel-backlog.md](docs/cursor-parallel-backlog.md) (task IDs, hotspots, backlog checkboxes).

## Agent handoff template (`AI_MANIFESTO.txt` §9)

After a substantive session, append or open `handoffs/YYYY-MM-DD.md` with:

```yaml
HANDOFF_OBJECTIVE: ''
HANDOFF_STATUS:
  completed: []
  in_progress: []
  not_started: []
HANDOFF_TOUCHED_PATHS: []
HANDOFF_CHECKS_RUN: []
HANDOFF_BLOCKERS: []
HANDOFF_ASSUMPTIONS: []
HANDOFF_RISK_LEDGER: []
HANDOFF_NEXT_STEP: ''
```

Separate **facts** from **assumptions**; label anything unverified.
