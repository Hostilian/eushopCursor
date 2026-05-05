# Return Handoff One-Pager

## Current state

- Readiness framework is fully scaffolded and linked.
- Core gates are `in_progress` awaiting RC-week runtime evidence.
- Away-mode ownership aliases are active and mapped.

## What is already done

- Gate matrix, scorecard, SLO/incident policy, security/data framework, KPI bridge.
- Rehearsal, drill, go/no-go, and day-30 summary artifacts prepared.
- Weekly reviews (`W19`-`W22`) and sign-off packet prefilled.
- Operator cockpit, role directory, and RACI quick reference active.

## What remains for final close

1. RC command rerun evidence (`claims`, `i18n`, `verify`).
2. Final manual journey pass matrix attachment.
3. Final drill score + remediation status attachment.
4. Security/privacy final reviewer sign-off.
5. Go/no-go meeting final decision capture.

## Run order on return

Follow `docs/readiness/final-return-checklist.md` from step 1 through step 21.
Start with `pnpm readiness:doctor`, then `pnpm readiness:doctor:fresh`, then `pnpm readiness:rc`.

## High-risk failure points to watch

- Missing RC command evidence on release candidate branch.
- Unowned P0/P1 during final week.
- Security sign-off missing or undated exceptions.
- Rollback owner/path not validated before final recommendation.

## Default policy

- If any critical evidence is missing at decision time, default to `HOLD`.
