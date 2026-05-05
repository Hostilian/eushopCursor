# Release Candidate Command Runbook

Use this runbook on RC branches before any go/no-go recommendation.

## Preconditions

- Branch is frozen for RC validation window.
- Claim coverage for any in_progress fix commits is valid.
- Required environment values are present for relevant checks.

## Required command sequence

Run from repo root in order:

1. `pnpm claims:check`
2. `pnpm i18n:check`
3. `pnpm verify`

One-command equivalent:

- `pnpm readiness:verify`
- RC alias: `pnpm readiness:rc`
- Includes `pnpm readiness:index:check` and `pnpm readiness:status:check` automatically.

## Evidence capture protocol

- Record date/time, branch name, and executor.
- Capture command status (`pass`/`fail`) and short output summary.
- Link evidence in:
  - `docs/readiness/evidence-log.md`
  - `docs/readiness/rehearsal-report.md`
  - `docs/readiness/go-no-go-decision.md`

## Failure handling

If any command fails:

1. Stop promotion flow.
2. Open remediation action in `owner-action-register.md`.
3. Re-run full command sequence after fix.
4. Update risk register if failure indicates systemic risk.

Fast triage fallback:

1. Run `pnpm readiness:triage` (preferred repair sequence).
2. If needed, run `pnpm readiness:status:check`, then `pnpm claims:check`, then `pnpm verify` for isolation.
3. Log outcomes in `docs/readiness/evidence-log.md`.

## Sign-off criteria

- All three commands pass on the RC branch.
- `pnpm readiness:verify` passes on the RC branch (preferred single-command proof).
- Relevant owners acknowledge evidence in the weekly review.
