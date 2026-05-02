# Deploy runbook

High-level steps for shipping Eushop (Coolify, Docker, or similar). Adjust names to your infra.

## Pre-deploy

1. Confirm [environment.md](./environment.md) is satisfied for the target environment.
2. **Never** rely on the admin build script’s injected `BETTER_AUTH_SECRET` in production—set the real secret in the orchestrator (see admin README / environment matrix).
3. **Database backups**: confirm scheduled snapshots and a recent **restore drill** for production `DATABASE_URL`.
4. Run `pnpm verify` on a release branch (or rely on CI on `main`).

## Build and runtime commands

See **[hosting-contract.md](./hosting-contract.md)** for exact `pnpm --filter … build` / `start` commands, ports, and Docker image build lines. Optional deep health: `GET /health?deep=1` with `HEALTHCHECK_DEEP=1` on the API ([environment.md](./environment.md)).

## Deploy sequence

1. **Database**: Apply migrations:  
   `pnpm --filter @eushop/db migrate`  
   against production `DATABASE_URL`.
2. **Search**: Reindex if catalog or schema changed:  
   `pnpm search:index`  
   (requires API env pointing at prod Meilisearch + Postgres).
3. **API**: Deploy `apps/api` (Node/Bun), expose `/trpc`, `/api/auth/*`, `/api/inngest`, `/health`.
4. **Web**: Deploy `apps/web` (`next build` / `next start` or serverless equivalent); set all `NEXT_PUBLIC_*` vars.
5. **Admin**: Deploy `apps/admin` with production auth + API URLs. Operators use **Payments** (`/payments`) for `reservation_payments` reconciliation alongside Stripe.
6. **PartyKit**: Deploy `apps/party` per PartyKit docs; set `PARTYKIT_HOST` and public host vars.
7. **Inngest**: Register/sync functions; confirm signing key and production app URL.
8. **Mobile**: Build with EAS using production `EXPO_PUBLIC_*` (see `apps/mobile/eas.json`).

## Rollback (per service)

- **Web / admin (Next.js):** Redeploy the previous image or Git ref; no DB migration rollback required for app-only fixes. Clear CDN cache if you serve stale HTML.
- **API:** Roll back to the prior container/version. If a bad migration already ran, **do not** roll back the API without a DB plan—coordinate a forward migration or restore from backup.
- **Database:** Migrations are forward-only in normal operations. For a failed migration, restore from snapshot to a point before the migration, then re-apply a fixed migration on a branch—or add a corrective migration forward. Document the incident.
- **Meilisearch:** Reindex from Postgres after restoring DB or changing index settings (`pnpm search:index` with prod env).
- **PartyKit:** Roll back the worker version in the PartyKit dashboard; clients reconnect automatically.
- **Mobile:** Store releases cannot be “rolled back”; ship a corrective build and use phased rollout where the store allows.

Optional deep health check: set `HEALTHCHECK_DEEP=1` on the API and call `GET /health?deep=1` to ping Postgres (503 if the DB check fails). Default `/health` stays cheap for load balancers.

## Post-deploy smoke

- `GET {API}/health` → `ok`.
- `GET {WEB}/` and `/sources` render.
- Sign-in magic link (or OAuth) end-to-end in staging before promoting.
- **Stripe**: Dashboard → Webhooks → `POST {API}/webhooks/stripe` delivers test events; `STRIPE_WEBHOOK_SECRET` matches (see [stripe-connect.md](./stripe-connect.md) and [stripe-e2e-matrix.md](./stripe-e2e-matrix.md)).
- **Legal**: `/imprint` and `/press` show production `NEXT_PUBLIC_LEGAL_*` / press email ([legal-launch-checklist.md](./legal-launch-checklist.md)).

## GitHub Actions

- **CI** ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)): lint, typecheck, unit tests, build on PR/push.
- **Deploy** ([`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)): manual `workflow_dispatch` checklist job—extend with your Coolify webhook, SSH, or container registry push.
