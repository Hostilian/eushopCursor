# @eushop/admin

Next.js operator console: catalog UGC queue, moderation, trips feed, audit log.

## Run

```bash
pnpm --filter @eushop/admin dev
```

Port **3002**. Set the same auth and API env vars as in root `.env.example` — production builds **must** set a real `BETTER_AUTH_SECRET` (see [docs/ops/environment.md](../../docs/ops/environment.md)).

## Build

```bash
pnpm --filter @eushop/admin build
pnpm --filter @eushop/admin start
```
