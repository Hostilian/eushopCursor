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

## Cursor Cloud specific instructions

### System requirements

- **Node.js 22+** is required (vitest 3.x + vite 7 need ESM-native Node). The `engines` field says `>=20.11` but tests won't run below Node 22.
- **pnpm 9.12.0** via corepack (`corepack enable && corepack prepare pnpm@9.12.0 --activate`).
- **Docker** is required for Postgres, Meilisearch, Redis, and MailHog.

### Starting infrastructure services

```bash
pnpm db:up                    # Postgres (:5432), Meilisearch (:7700), Redis (:6379), MailHog (:8025)
```

### Database migration gotcha (PostGIS + Drizzle)

The `pgvector/pgvector:pg17` Docker image does **not** ship PostGIS. After `pnpm db:up`, you must install PostGIS inside the container and create a domain alias before running migrations:

```bash
docker exec eushop-postgres-1 bash -c "apt-get update -qq && apt-get install -y --no-install-recommends postgresql-17-postgis-3 postgresql-17-postgis-3-scripts" >/dev/null 2>&1
docker exec eushop-postgres-1 psql -U eushop -c "
  CREATE EXTENSION IF NOT EXISTS \"postgis\";
  CREATE EXTENSION IF NOT EXISTS \"vector\";
  CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";
  CREATE EXTENSION IF NOT EXISTS \"unaccent\";
  DO \$\$ BEGIN EXECUTE 'CREATE DOMAIN \"geography(Point, 4326)\" AS geography(Point, 4326)'; EXCEPTION WHEN duplicate_object THEN NULL; END; \$\$;
"
```

The domain alias is necessary because Drizzle generates migration SQL with `"geography(Point, 4326)"` in double quotes, which PostgreSQL cannot resolve as a type modifier without the domain.

Migration 0005 (`0005_trip_invariants.sql`) uses `ADD CONSTRAINT IF NOT EXISTS` syntax which is **not supported in PG 17**. If starting from a fresh DB, apply migrations 0000–0004 and 0006–0008 via psql, then apply 0005 with `IF NOT EXISTS` removed from each `ADD CONSTRAINT`, and finally insert Drizzle tracking records manually (see the node script pattern: compute SHA-256 hashes of each migration file and insert into `drizzle.__drizzle_migrations`).

After migrations succeed: `pnpm db:seed` then `pnpm search:index`.

### Running dev servers

```bash
pnpm dev:web-api   # Web (:3000) + API (:3001)
pnpm dev:stack     # Same but also starts Docker services first
pnpm dev           # All services including admin (:3002) and party (:1999)
```

### Key commands (see `README.md` and root `package.json`)

| Task | Command |
|------|---------|
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Unit tests | `pnpm test:unit` |
| Format check | `pnpm format:check` |
| Full CI check | `pnpm verify` |
| Build | `pnpm build` |

### Auth in dev

Magic-link emails are logged to the API console (or MailHog at `:8025` when Docker services are up). No real email provider is needed.
