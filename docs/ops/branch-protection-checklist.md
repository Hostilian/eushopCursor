# Branch protection checklist (GitHub)

Use this checklist before opening production-facing repos to multi-agent merge traffic.

## Required baseline rules

- Protect `main` and any long-lived release branch.
- Require a pull request before merge.
- Require at least 1 approving review.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution before merge.
- Block force pushes and branch deletion.

## CI and status checks

- Require status checks to pass before merge.
- Mark these checks as required when present:
  - `verify` (or the workflow job that runs `pnpm verify`)
  - `claims-check` (if separate from `verify`)
- Require branches to be up to date before merging when queue pressure is high.

## Merge strategy guardrails

- Disable direct pushes to protected branches for everyone except designated emergency maintainers.
- Prefer squash merge for routine feature PRs to keep history compact.
- Keep merge commits enabled only if your release process needs them.

## Admin and bypass policy

- Apply restrictions to admins unless there is a documented emergency workflow.
- Minimize bypass lists and audit them monthly.
- Keep an explicit owner list for branch-protection changes.

## Suggested monthly audit

1. Confirm required checks still match current workflow names.
2. Review bypass users/teams and remove stale entries.
3. Verify rules still protect the default branch after any branch rename.
4. Spot-check last 10 merged PRs for accidental bypasses.

