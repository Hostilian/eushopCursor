# Agent lanes (Eushop)

Run **two** background agents max for this repo unless scopes are disjoint.

| Lane | Edit | Read-only |
| --- | --- | --- |
| **A — Web + UI** | `apps/web`, `packages/ui-web`, `packages/i18n`, `packages/design-tokens`, `packages/catalog-data` | Everything else |
| **B — API + data** | `apps/api`, `apps/party`, `packages/api-router`, `packages/db`, `packages/auth`, `packages/validators`, `packages/geo` | Everything else |

**Orchestrator (human):** root configs, CI, `.env.example`, `README.md`, lockfile.

After 2–3 tasks per lane, run `pnpm verify` once, then resume agents.
