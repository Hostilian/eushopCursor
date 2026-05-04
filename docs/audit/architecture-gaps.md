# Architecture gaps (Part 1.4)

Checklist against masterplan §1.4 (domain routers under `packages/api-router/src`).

| criterion | status | notes |
|-----------|--------|-------|
| Input validation via `packages/validators` | mostly met | spot remaining inline Zod in routers during Part 3 |
| Auth via `packages/auth` / context | met | `context.ts` threads session |
| DB via `packages/db` | met | Drizzle schemas |
| Typed errors vs raw throws | partial | prefer `TRPCError`; some `throw new Error` in `catalog.ts` (grep count) — backlog |
| No stray `fetch` for internal API | verify per router | web uses tRPC |

## N+1 / list endpoints

Explicit audit deferred to Part 3.3 — use relation `with()` or joins for hot list procedures.

## Direct `fetch` to API

Search in follow-up: `grep fetch\\(.*api` in `apps/web` — server components should use `api()` helper pattern already used on traction page.
