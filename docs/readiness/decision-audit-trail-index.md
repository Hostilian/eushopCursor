# Decision Audit Trail Index

Single reference map for all readiness decisions and their primary records.

## Core decision records

| Decision type | Primary artifact | Secondary evidence |
| --- | --- | --- |
| Program scope and cadence | `30-day-master.md` | `weekly-review-*`, `evidence-log.md` |
| Weekly gate outcomes | `weekly-review-*.md` | `command-center-dashboard.md` |
| Final go/no-go | `go-no-go-decision.md` | `go-decision-minutes-template.md`, `minimum-viable-go-packet.md` |
| Exception and liability acceptance | `go-conditions-liability-register.md` | `risk-register.md` |
| Security/privacy sign-off | `security-privacy-checklist.md` | `go-no-go-decision.md` |
| Post-launch transition decisions | `post-launch-transition-template.md` | `day30-closeout-checklist.md` |

## Audit workflow

1. Record decision in primary artifact.
2. Link evidence in `evidence-log.md`.
3. Update dependent dashboards/snapshots.
4. If decision changes scope/risk, update `risk-register.md`.

## Integrity checks

- Every critical decision has:
  - owner,
  - timestamp,
  - rationale,
  - evidence reference.
