# Hosting contract (production)

This repo supports **Coolify/buildpack-style** deploys (build and start commands on the host) and **Docker** images defined under [`deploy/`](../../deploy/). Pick one stack per environment; the commands below are the source of truth.

## Default assumption

- **Primary:** Coolify (or similar) on your own VPS, per [deploy-runbook.md](./deploy-runbook.md).
- **Alternative:** OCI images built from `deploy/*.Dockerfile` and run with your orchestrator (Coolify Docker Compose, Kubernetes, etc.).

## Build and start commands

| App | Package | Production build | Production start | Default port |
|-----|---------|------------------|------------------|--------------|
| API | `@eushop/api-server` | `pnpm --filter @eushop/api-server build` | `pnpm --filter @eushop/api-server start` | `3001` (`PORT`) |
| Web | `@eushop/web` | `pnpm --filter @eushop/web build` | `pnpm --filter @eushop/web start` | `3000` |
| Admin | `@eushop/admin` | `pnpm --filter @eushop/admin build` | `pnpm --filter @eushop/admin start` | `3002` |

Run builds from the **repository root** after `pnpm install --frozen-lockfile` so workspace packages resolve. Set env vars per [environment.md](./environment.md) before build for Next.js apps (especially `BETTER_AUTH_SECRET` on web/admin).

## Docker

See **[deploy/README.md](../../deploy/README.md)** for full `docker build` examples (including `NEXT_PUBLIC_*` and admin `BETTER_AUTH_SECRET` build-args).

- **API:** `docker build -f deploy/api.Dockerfile -t eushop-api .` then run with `PORT` and the full API env matrix.
- **Web:** `docker build -f deploy/web.Dockerfile -t eushop-web .` — serves Next standalone on port 3000.
- **Admin:** `docker build -f deploy/admin.Dockerfile -t eushop-admin .` — port 3002.

Health checks: API `GET /health` (optional deep check: `GET /health?deep=1` with `HEALTHCHECK_DEEP=1`). Web/admin: `GET /` returning 200.

## CI lockfile

CI uses `pnpm install --frozen-lockfile`. If the lockfile is outdated locally, run `pnpm install` at the repo root and commit `pnpm-lock.yaml` before merging.
