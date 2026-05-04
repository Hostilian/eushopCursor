# Schema hardening queue (Part 3 follow-up)

Cross-reference with `EUSHOP_CURSOR_AGENT_MASTERPLAN.md` Part 3.1. **Do not execute as one mega-migration** — one H3-schema claim per slice.

- [ ] Naming audit: plural `snake_case` tables, consistent FK column names, `SCREAMING_SNAKE` enums.
- [ ] Index pass: FK columns, columns used in `packages/api-router` `.where()` clauses, PostGIS GIST, FTS GIN.
- [ ] Constraints: `NOT NULL`, money `CHECK (>= 0)`, platform fee rule in DB or single validator source (already cents logic in `@eushop/validators`).
- [ ] Money columns: `NUMERIC(10,2)` audit vs `real`/`float`.
- [ ] Soft delete: `deleted_at` on high-churn entities + list query filters.

Current Drizzle schema is production-backed; verify each item against live migrations before altering.
