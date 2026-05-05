# Metric Anomaly Response Playbook

Use this playbook when KPI values move unexpectedly or become unreliable.

## Trigger criteria

- Sudden week-over-week deviation beyond expected threshold.
- Missing metric values for required reporting window.
- Conflicting values across sources.

## Response flow

1. Confirm anomaly is real (rule out reporting lag).
2. Classify impact:
   - reporting-only
   - decision-affecting
   - incident-indicating
3. Assign owner and incident severity if operationally relevant.
4. Contain (pause decision reliance if needed).
5. Fix root data issue and backfill.
6. Document in evidence and decision logs.

## Required updates

- `readiness-scorecard.md`
- `evidence-log.md`
- `owner-action-register.md`
- `risk-register.md` (if persistent or decision-critical)
