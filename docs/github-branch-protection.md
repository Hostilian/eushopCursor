# GitHub branch protection (checklist)

Use on the repo that ships production (`main` or `release`). Adjust names to your org policy.

## Recommended for `main`

- Require a pull request before merging; minimum **1** approval for small teams, **2** for larger teams.
- Require status checks to pass before merging: the same jobs as root **`pnpm verify`** (format, typecheck, lint, unit tests, build) — match your [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) job names.
- Require branches to be up to date before merging (or require merge queue if you use it).
- Do not allow force pushes to `main`.
- Do not allow deletions of `main`.
- Optional: require signed commits for release managers.
- Optional: restrict who can dismiss reviews and who can push (admins only).

## Release hygiene

- Tag releases from green `main` after smoke checks ([deploy runbook](ops/deploy-runbook.md)).
- Document who rotates **`INVESTOR_ACCESS_TOKENS`**, **`STRIPE_WEBHOOK_SECRET`**, and DB credentials ([environment.md](ops/environment.md)).

## Related

- Merge-safe parallel work: [cursor-parallel-backlog.md](cursor-parallel-backlog.md)
- Agent lanes: [AGENTS.md](../AGENTS.md)
