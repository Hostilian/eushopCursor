# Readiness Operator Cockpit (One Page)

Use this as the daily control panel for readiness execution.

## Today at a glance

- Date: `2026-05-05` (baseline snapshot)
- Day in 30-day window: `D1`
- Current phase: `Week 1`
- Next hard checkpoint: `2026-05-12` (Gate 1 review)
- Overall state: `yellow` (execution-ready, final runtime evidence in_progress)

## Gate status

| Gate | Status | Last evidence update | Owner | Next action |
| --- | --- | --- | --- | --- |
| Code gate | in_progress | 2026-05-05 | `eng-duty` | RC branch rerun |
| Operational gate | in_progress | 2026-05-05 | `ops-duty` | Recovery smoke evidence |
| Security gate | in_progress | 2026-05-05 | `sec-duty` | Final sign-off prep |
| Readiness gate | in_progress | 2026-05-05 | `pm-duty` | Week KPI refresh |

## Must-do checklist (daily)

- [ ] Blocker sync done.
- [ ] Owner action register updated.
- [ ] Evidence log updated.
- [ ] Risk register reviewed for new/changed risk.
- [ ] Decision log updated if any control changed.

## Top blockers

| Blocker | Severity | Owner | ETA | Status |
| --- | --- | --- | --- | --- |
| Manual journey evidence in_progress | P1 | `qa-duty` | 2026-05-08 | in_progress |
| Drill score evidence in_progress | P1 | `qa-duty` + `ops-duty` | 2026-05-10 | in_progress |
| RC branch command rerun evidence in_progress | P1 | `eng-duty` | 2026-05-29 | in_progress |

## Command quick-run

From repo root:

1. `pnpm readiness:verify`
2. RC alias: `pnpm readiness:rc`
3. Snapshot: `pnpm readiness:doctor`
4. (Optional debug) `pnpm claims:check`
5. (Optional debug) `pnpm i18n:check`
6. (Optional debug) `pnpm verify`
7. (Optional debug) `pnpm readiness:index:check`

## If verification fails

1. Run `pnpm readiness:triage` (preferred repair sequence).
2. If needed, run `pnpm readiness:status:check`, then `pnpm claims:check`, then `pnpm verify` for isolation.
3. Record pass/fail evidence in `docs/readiness/evidence-log.md`.

## Links (single-click)

- `docs/readiness/30-day-master.md`
- `docs/readiness/evidence-log.md`
- `docs/readiness/owner-action-register.md`
- `docs/readiness/risk-register.md`
- `docs/readiness/go-no-go-decision.md`
- `docs/readiness/role-directory.md`
- `docs/readiness/raci-quick-reference.md`
