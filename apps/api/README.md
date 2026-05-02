# @eushop/api-server

Hono server: Better Auth (`/api/auth/*`), tRPC (`/trpc`), Inngest (`/api/inngest`), health (`/health`), Stripe webhook stub (`/webhooks/stripe`).

## Run

From repo root with `.env` configured:

```bash
pnpm --filter @eushop/api-server dev
```

Default port **3001** (`PORT` overrides).

## Search reindex

```bash
pnpm search:index
```

Requires `DATABASE_URL`, Meilisearch env, and a seeded catalog — see root [README.md](../../README.md) and [docs/ops/deploy-runbook.md](../../docs/ops/deploy-runbook.md).

## Build / prod

```bash
pnpm --filter @eushop/api-server build
pnpm --filter @eushop/api-server start
```

Output in `apps/api/dist/`.
