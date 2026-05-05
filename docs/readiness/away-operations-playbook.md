# Away Operations Playbook

This playbook is the execution guide for periods when primary owners are unavailable. It converts the readiness schedule into deterministic run steps with fallback ownership.

## 1) Ownership model

- Primary aliases: `pm-duty`, `eng-duty`, `sec-duty`, `qa-duty`, `data-duty`, `gtm-duty`, `ops-duty`.
- If an alias owner is unavailable, escalate to the mapped fallback in `owner-matrix.md`.
- No task may stay unowned beyond one business day.

## 2) Daily run sequence (15-30 min)

1. Review `owner-action-register.md` for due/overdue actions.
2. Update `evidence-log.md` with any new command output or review result.
3. Re-score changed risks in `risk-register.md`.
4. Add significant decisions to `30-day-master.md`.
5. Confirm claim coverage before any new substantive edit.

## 3) Weekly run sequence (60 min)

1. Execute weekly review using `weekly-review-template.md`.
2. Update scorecard and KPI bridge rows for current week.
3. Confirm gate states in `go-no-go-decision.md`.
4. Refresh artifact state in `artifact-status-board.md`.
5. Publish action deltas in `owner-action-register.md`.

## 4) RC week hard sequence

Follow in order:

1. Run `rc-command-runbook.md` command sequence.
2. Update `rehearsal-report.md` and `incident-drill-report.md`.
3. Complete `signoff-packet-template.md`.
4. Update final sections in `go-no-go-decision.md`.
5. Publish `day30-exec-summary.md`.

## 5) Escalation triggers

- Any active P0 with no active mitigation owner.
- Two consecutive failed gate command runs.
- Missing security/privacy evidence inside RC window.
- Missing rollback owner/path in operational gate.

## 6) Emergency hold criteria

Set recommendation to `HOLD` immediately if:

- RC command runbook fails and no fix ETA exists.
- Critical journey pass rate cannot be evidenced on web/mobile.
- Security sign-off cannot be completed with dated mitigation.
- Data integrity risk appears in reservation/payment lifecycle.
