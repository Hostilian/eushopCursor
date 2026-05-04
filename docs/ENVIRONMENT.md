# Environment variables (quick reference)

The **canonical variable matrix** (production, optional flags, CI notes) lives in **[docs/ops/environment.md](ops/environment.md)**. Read that file before changing `.env.example` or deploy templates.

## AI / agent checklist (from `AI_MANIFESTO.txt` §7)

| Variable | Required for |
|----------|----------------|
| `DATABASE_URL` | API, migrations, Drizzle |
| `REDIS_URL` | API rate limits / session-related features |
| `BETTER_AUTH_SECRET` | All runtimes importing `@eushop/auth` |
| `BETTER_AUTH_URL` | Auth callbacks |
| `NEXT_PUBLIC_SITE_URL` | Web canonical URL, OG, sitemap |
| `NEXT_PUBLIC_API_URL` | Browser tRPC base |
| `MEILI_HOST` / `MEILI_MASTER_KEY` | Search indexing & queries |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | Background jobs |

## Local development

1. Copy [`.env.example`](../.env.example) to `.env` at the repo root.
2. Start dependencies: `pnpm db:up` (Postgres, Meilisearch, Redis, Mailhog).
3. Run migrations: `pnpm db:migrate`.
4. Optional seed: `pnpm db:seed` and `pnpm search:index`.

## Secrets

- Never commit `.env` or real keys.
- Rotate any key that was ever pasted into chat or CI logs by mistake.

## Health probes

- Shallow: `GET /health` on the API.
- Deep (optional): `GET /health?deep=1` with `HEALTHCHECK_DEEP=1` — see ops doc.
