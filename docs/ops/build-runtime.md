# Build vs runtime (Meilisearch, Redis, Postgres)

## Expectation

- **`pnpm build`** for `apps/web`, `apps/admin`, and `apps/api` **must not** open network connections to Meilisearch, Redis, or Postgres unless your CI explicitly provides them.
- **Search indexing** runs only via `pnpm search:index` ([`apps/api/src/jobs/reindex.ts`](../../apps/api/src/jobs/reindex.ts)) or CI jobs — not during `next build`.

## Meilisearch tuning (B-009)

- Ranking/synonym experiments live in `apps/api/src/jobs/reindex.ts` `index.updateSettings(...)`.
- Current policy: keep ranking conservative (`words/typo/proximity/attribute/sort/exactness`) and only add low-risk food-name synonyms that improve corridor search recall.
- After changing settings, run:
  - `pnpm search:index`
  - a quick picker smoke test in web/mobile (`catalog.searchWithSuggestions`) for top corridor terms.

## Regression guard

If a future change imports a Meili or Redis client at **module scope** in a package that `next build` pulls in, local builds will fail when services are down. Fix by moving the client behind `lazy()` / dynamic `import()` inside server handlers or by isolating the dependency in the API worker only.
