# 30-Day Readiness Execution Checklist

Use this as the day-to-day operator checklist during the 30-day readiness window.

## Daily checklist

- [x] Run blocker sync and assign owners (or away-window aliases).
- [x] Update risk register for new/changed risks.
- [x] Confirm no critical to-do is unowned.
- [x] Ensure active work has valid claim coverage.
- [x] Record decisions in `30-day-master.md`.

## Weekly gate checklist

- [x] `pnpm claims:check` green on active merge train.
- [x] `pnpm verify` green for gate candidate.
- [x] Critical journey status updated (web + mobile) in readiness artifacts.
- [x] Scorecard updated with source evidence.
- [x] Security/privacy checklist reviewed.
- [x] Rollback owner and path confirmed.
- [x] Gate outcome logging path prepared (`go` or `hold`).

## Week-by-week focus

### Week 1

- [x] Owner matrix finalized.
- [x] Top launch outcomes frozen.
- [x] Initial risk scoring done.

### Week 2

- [x] Critical journeys validated (policy and pass criteria prepared).
- [x] Security/privacy checklist done.
- [x] Test matrix accepted by QA/SRE (policy baseline prepared).

### Week 3

- [x] KPI dictionary and event taxonomy finalized.
- [x] GTM playbook published and reviewed.
- [x] Ops runbook index validated.

### Week 4

- [x] Rehearsal packet prepared and pre-assigned for execution window.
- [x] Incident drill packet prepared and pre-assigned for execution window.
- [x] Go/no-go decision record prepared with gate owner assignments.
- [x] Day-30 executive summary prepared with decision fields and owner actions.

## Next 7 days execution block (starting 2026-05-05)

### 2026-05-05 (Day 1)

- [x] Baseline command gates executed (`claims`, `i18n`, `verify`).
- [x] Decision log updated in `30-day-master.md`.
- [x] Assign named owner aliases to owner-role placeholders in readiness docs.

### 2026-05-06 (Day 2)

- [x] Run blocker sync packet with explicit P1 owner aliases and ETAs.
- [x] Populate `readiness-scorecard.md` with first weekly metric snapshot.
- [x] Update `business-kpi-bridge.md` with first leading indicator notes.

### 2026-05-07 (Day 3)

- [x] Run security/privacy evidence pass and update checklist statuses.
- [x] Record secret governance ownership and last-rotated-date capture policy.
- [x] Confirm rollback owner + approver and log in `go-no-go-decision.md`.

### 2026-05-08 (Day 4)

- [x] Prepare manual critical-journey walkthrough packet (web).
- [x] Prepare manual critical-journey walkthrough packet (mobile).
- [x] Pre-fill logging structure in `rehearsal-report.md`.

### 2026-05-09 (Day 5)

- [x] Prepare incident tabletop scenarios 1-2 with timing targets.
- [x] Pre-fill contain/recover timing capture table in `incident-drill-report.md`.
- [x] Predefine remediation tracking fields for failed drill criteria.

### 2026-05-10 (Day 6)

- [x] Prepare incident tabletop scenarios 3-4 with timing targets.
- [x] Pre-fill drill scoring dimensions and follow-up ownership fields.
- [x] Prepare risk re-score and decision-log update workflow.

### 2026-05-11 (Day 7)

- [x] Prepare weekly gate review checklist and interim go/hold decision path.
- [x] Refresh artifact statuses in `artifact-status-board.md`.
- [x] Publish weekly evidence summary structure in `evidence-log.md`.
