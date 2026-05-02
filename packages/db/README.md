# @eushop/db

Drizzle schema, SQL migrations, and seed data for Eushop.

## From the monorepo root

1. **Start Postgres** (and optional Meilisearch/Redis/Mailhog): `pnpm db:up`
2. **Generate SQL** from schema changes: `pnpm db:generate`
3. **Apply migrations** to your local database: `pnpm db:migrate`
4. **Seed catalog + demo rows**: `pnpm db:seed`

Ensure `DATABASE_URL` in the root `.env` matches Docker Compose (see root `.env.example`).

## Clean database

To verify migrations on an empty database, drop and recreate the DB (or use a fresh Docker volume), then run `pnpm db:migrate` and `pnpm db:seed`.
