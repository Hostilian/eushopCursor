# @eushop/web

Next.js app: marketing, product (trips, listings, requests, chat), and investor surfaces.

## Run locally

From repo root (with API + env — see root [README.md](../../README.md)):

```bash
pnpm dev:web-api
```

Web only (no tRPC to local API):

```bash
pnpm dev:web
```

Port **3000** by default.

## Useful paths

| Path | Purpose |
|------|---------|
| `src/app/` | App Router pages (e.g. `(marketing)/` for editorial routes like `/changelog`) |
| `src/components/` | UI (layout, marketing, trips, listings, …) |
| `src/lib/trpc-server.ts` | Server-side tRPC caller |
| `src/i18n/request.ts` | next-intl locale loading |

Operations and env: [docs/README.md](../../docs/README.md).

## Deploy notes

This app targets **self-hosted** production (Coolify + `deploy/web.Dockerfile` or pnpm build from repo root — see [docs/ops/oss-self-hosted-deploy.md](../../docs/ops/oss-self-hosted-deploy.md)). A **Vercel**-style proprietary host is **not** a maintained first-class path for this monorepo (no `vercel.json`); if you wire one yourself, mirror build commands from [docs/ops/hosting-contract.md](../../docs/ops/hosting-contract.md).
