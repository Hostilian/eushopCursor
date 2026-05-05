# Documentation

One entry: **ops** ([ops/README.md](ops/README.md)), **agents** ([agents.md](agents.md), [claims/README.md](claims/README.md)), **audit** ([audit/](audit/)), **handoffs** ([handoffs/](handoffs/)), **editorial** ([editorial.md](editorial.md)), **planning** ([masterplan.md](masterplan.md)). **Open engineering tasks** use IDs in [cursor-parallel-backlog.md](cursor-parallel-backlog.md); **release-quality bar** is [masterplan.md](masterplan.md) Part 12 plus merge/cadence in [human-alignment-checklist.md](human-alignment-checklist.md).

## Environment (quick reference)

The **canonical variable matrix** is [ops/environment.md](ops/environment.md). Read it before changing `.env.example` or deploy templates.

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

**Local:** copy [`.env.example`](../.env.example) → `.env`, then `pnpm db:up`, `pnpm db:migrate`, optional `pnpm db:seed` and `pnpm search:index`. Never commit secrets; rotate leaked keys.

**Health:** `GET /health` on the API; optional `GET /health?deep=1` with `HEALTHCHECK_DEEP=1` — see [ops/environment.md](ops/environment.md).

## Other docs (flat)

| Path | What it is |
|------|------------|
| [i18n-locale-matrix.md](i18n-locale-matrix.md) | Locales, RTL, `pnpm i18n:*` |
| [cursor-parallel-backlog.md](cursor-parallel-backlog.md) | Merge-safe agent queue |
| [pre-2008-sources.md](pre-2008-sources.md) | Historic EU mobility citations |
| [editorial.md](editorial.md) | Copy inventory + voice glossary + EN-only i18n policy (single hub) |
| [eslint-next-migration.md](eslint-next-migration.md) | Move off `next lint` |
| [github-branch-protection.md](github-branch-protection.md) | GitHub settings |
| [roadmap-epics.md](roadmap-epics.md) | Planning buckets |
| [human-alignment-checklist.md](human-alignment-checklist.md) | Verify cadence, claims, product-pictures assurance |

### Apps

| App | README |
|-----|--------|
| Web | [apps/web/README.md](../apps/web/README.md) |
| API | [apps/api/README.md](../apps/api/README.md) |
| Admin | [apps/admin/README.md](../apps/admin/README.md) |
| Mobile | [apps/mobile/README.md](../apps/mobile/README.md) |
| PartyKit | [apps/party/README.md](../apps/party/README.md) |

Dependency updates: [`.github/dependabot.yml`](../.github/dependabot.yml).
