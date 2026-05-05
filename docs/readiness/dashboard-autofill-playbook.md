# Dashboard Auto-Fill Playbook

Use this playbook to update `command-center-dashboard.md` in under 10 minutes.

## Inputs and source mapping

| Dashboard section | Source artifact | Field mapping |
| --- | --- | --- |
| Snapshot header | `30-day-master.md`, `meeting-calendar-2026-05.md` | cycle day, phase, next gate date |
| Gate health | `go-no-go-decision.md` | gate status, owner, evidence update date |
| KPI health | `readiness-scorecard.md`, `kpi-dictionary.md` | current, target, trend, status |
| Top risks | `risk-register.md` | risk, severity, owner, due date |
| Critical blockers | `owner-action-register.md`, weekly review files | top unresolved blockers |

## Update sequence (recommended)

1. Pull latest gate statuses from `go-no-go-decision.md`.
2. Pull KPI rows from `readiness-scorecard.md`.
3. Pull top 5 active risks from `risk-register.md`.
4. Pull top blockers from `owner-action-register.md`.
5. Update dashboard date and cycle day.

## Consistency checks

- Every `in_progress` status should have at least one owner action.
- Any red/yellow KPI should have an owner action and due date.
- Risk severities should match latest register values.

## Publish step

- Save dashboard update.
- Add short note in `evidence-log.md` referencing dashboard refresh.
- If status changed materially, log decision in `30-day-master.md`.
