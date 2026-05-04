# OSS self-hosted deploy (Coolify-first)

**SaaS / cost posture:** see **[zero-cost-stack.md](./zero-cost-stack.md)** — which integrations are optional, self-hostable, or vendor-locked, and what stays off until you set keys.

**Public contact:** set `NEXT_PUBLIC_OPERATIONS_EMAIL` and optional `NEXT_PUBLIC_OPERATIONS_PHONE_E164` on the web service so `/contact`, `/help`, `/careers`, and `/imprint` can show an operations line (configure in your secret store — do not commit personal addresses to git).

Run the **real** stack — `@eushop/web` (Next.js 15) and `@eushop/api-server` (Hono + tRPC + Better Auth) — on **infrastructure you control**. This is the recommended path versus the optional [GitHub Pages static stub](../../infra/pages/) (marketing shell only, no tRPC/auth parity).

## Why Coolify (primary)

[**Coolify**](https://coolify.io/) is **MIT-licensed**, self-hosted PaaS: connect a Git repo, define **separate** services for API and web (and admin if you need it), set env vars, health checks, and zero proprietary runtime lock-in. You bring a **VPS** (e.g. Hetzner EU — aligns with README production posture). Software is FOSS; **hosting is not magically free at scale** — a small VPS is typically **low monthly cost** versus “free” SaaS tiers that spin down, cap CPU, or sit on someone else’s roadmap.

**Secondary footnote:** [CapRover](https://caprover.com/) is another open MIT-style PaaS-on-a-VPS option; the same build/start commands and Docker images apply — swap the control plane, keep the containers.

## Honest limits of “free”

- **True $0 forever** for a full **Next + Postgres + API + optional Meili/Redis** stack without *any* machine does **not** exist in a honest sense: something must run Postgres and your Node processes.
- **Self-host + FOSS** removes **vendor runtime lock-in** and avoids **serverless compromises** (cold starts, execution caps, porting a long-lived `@hono/node-server` app into `fetch` handlers). The API is a **normal Node HTTP server** — see [hosting-contract.md](./hosting-contract.md).

## Architecture on one Coolify instance (or cluster)

| Service | Package | Typical exposure |
|--------|---------|------------------|
| **API** | `@eushop/api-server` | `https://api.yourdomain` — `/trpc`, `/api/auth/*`, `/health` |
| **Web** | `@eushop/web` | `https://yourdomain` — Next standalone |
| **Admin** (optional) | `@eushop/admin` | internal hostname or separate subdomain |

Use **two (or three) Coolify applications** from the **same** Git repo, different **build** and **start** commands (or different Dockerfiles). Same pattern scales to multiple nodes if you add a load balancer later.

## Data services

**Postgres** — managed EU Postgres, or Postgres in Docker on the same host, or the repo’s [`infra/docker-compose.yml`](../../infra/docker-compose.yml) services as a **template** for Meili/Redis/Postgres sidecars (development defaults: `postgres`, `meilisearch`, `redis`; see compose file for ports and healthchecks).

**Meilisearch & Redis** — optional for a minimal UI demo; catalog search and some flows **degrade** without Meili (see `catalog.search` in `packages/api-router`). Redis: omit if you skip rate-limit / cache paths that require it; many features no-op when unset ([`.env.example`](../../.env.example)).

**Local parity:** `pnpm db:up` brings Postgres + Meili + Redis + Mailhog per compose — use that locally, then mirror the same topology in production Compose stacks or separate Coolify resources.

## Production containers (recommended on Coolify)

OCI images are defined under [`deploy/`](../../deploy/) — see **[deploy/README.md](../../deploy/README.md)** and [hosting-contract.md](./hosting-contract.md):

- API: `docker build -f deploy/api.Dockerfile -t eushop-api .`
- Web: `docker build -f deploy/web.Dockerfile -t eushop-web .` (pass `NEXT_PUBLIC_*` build-args)
- Admin: `docker build -f deploy/admin.Dockerfile -t eushop-admin .`

Coolify can build from Dockerfile or run **Nixpacks/buildpack**-style **pnpm** commands from repo root (same as hosting contract table).

## Build from Git (Nixpacks / buildpack-style)

From **repository root** after `pnpm install --frozen-lockfile`:

| App | Build | Start | Port |
|-----|-------|-------|------|
| API | `pnpm --filter @eushop/api-server build` | `pnpm --filter @eushop/api-server start` | `3001` (`PORT` from env) |
| Web | `pnpm --filter @eushop/web build` | `pnpm --filter @eushop/web start` | `3000` |

Set **all** env vars before **web** build — Next bakes `NEXT_PUBLIC_*` at build time ([environment.md](./environment.md)).

## Deploy order

1. **Postgres** — provision DB; set `DATABASE_URL` (SSL as required).
2. **API** — deploy first to get a stable public origin for `BETTER_AUTH_URL`.
3. **Migrations** — from CI, a Coolify one-off command, or your laptop:  
   `pnpm --filter @eushop/db migrate` with production `DATABASE_URL` (see [deploy-runbook.md](./deploy-runbook.md)).
4. **Optional search** — `pnpm search:index` with API env pointing at Postgres + Meili.
5. **Web** — deploy with `NEXT_PUBLIC_API_URL` pointing at the API’s public URL.
6. **Smoke** — `GET https://<api>/health` → JSON `ok`; open `https://<web>/`; align auth URLs ([environment.md](./environment.md)).

Full sequence (PartyKit, Inngest, Stripe, admin) remains in [deploy-runbook.md](./deploy-runbook.md).

## Health checks

- **API:** `GET /health` (cheap). Optional: `GET /health?deep=1` with `HEALTHCHECK_DEEP=1` for Postgres probe ([environment.md](./environment.md)).
- **Web:** `GET /` → 200.

## Environment variables (checklist)

Never commit secrets. Full matrix: **[environment.md](./environment.md)** and [`.env.example`](../../.env.example). Minimal cross-service alignment:

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Production Postgres |
| `BETTER_AUTH_SECRET` | Same strong secret on web and API where required |
| `BETTER_AUTH_URL` | **Public origin of the API** (Better Auth) |
| `NEXT_PUBLIC_SITE_URL` | Canonical browser URL of the web app |
| `NEXT_PUBLIC_API_URL` | **Public API URL** — browser tRPC target |
| `MEILI_HOST` / `MEILI_MASTER_KEY` | Optional; search degrades if omitted |
| `REDIS_URL` | Optional for some paths |
| `PORT` | Set by platform for API if not default `3001` |

OAuth / magic-link providers must allowlist the same public URLs.

## PR previews

Self-hosted previews usually mean **separate** Coolify preview apps or Docker Compose projects per branch. Unlike proprietary preview hosts, **each preview needs its own API origin** (or shared staging) so `BETTER_AUTH_URL` and cookies line up — plan one API + one web per preview environment.

## Appendix A — Redirect from older doc name

The file [free-preview-deploy.md](./free-preview-deploy.md) remains as a **short redirect** for old links.

## Appendix B — Legacy proprietary SaaS (unmaintained as primary path)

Some teams still deploy Next to proprietary edge hosts or APIs to proprietary PaaS; this repo **does not** ship first-class config for those paths. The former `render.yaml` and `apps/web/vercel.json` have been **removed** to avoid implying a supported vendor-specific default. If you must use them, derive build/start lines from [hosting-contract.md](./hosting-contract.md) yourself.
