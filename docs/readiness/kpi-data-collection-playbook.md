# KPI Data Collection Playbook

This playbook defines how each readiness KPI is collected, validated, and reported weekly.

## Operating rules

- Every KPI update must include:
  - measurement window,
  - data source,
  - extraction timestamp,
  - owner sign-off.
- If source data is unavailable, mark KPI as `data_missing` and create an action in `owner-action-register.md`.

## KPI collection map

| KPI | Source | Collection method | Cadence | Owner | QA check |
| --- | --- | --- | --- | --- | --- |
| CI success rate (7d) | CI workflow history | Count successful/total runs over rolling 7 days | Weekly | Engineering lead | Verify denominator includes all required workflows |
| Blocking defect MTTR | Incident tracker | Average `(resolved_at - detected_at)` for P0/P1 in window | Weekly | QA/SRE lead | Exclude unresolved incidents from average and list separately |
| Critical path pass rate | Rehearsal + test logs | Passed critical steps / total steps | Weekly | QA/SRE lead | Cross-check web/mobile coverage completeness |
| Incident drill pass score | Drill report | Achieved points / total points | Weekly during drills | QA/SRE lead | Validate score rubric consistency |
| Consent-safe analytics coverage | Analytics logs + consent evidence | Compliant events / key events | Weekly | Data lead + Security lead | Confirm no pre-consent product analytics events |
| Support first response SLA | Support platform | On-time first responses / total tickets | Weekly | CS lead | Verify SLA window and timezone normalization |

## Weekly workflow

1. Owners extract KPI inputs by end of day Tuesday.
2. QA pass on metric integrity by Wednesday.
3. Publish to `readiness-scorecard.md` before weekly readiness review.
4. Add summary + links in `evidence-log.md`.

## Exception handling

- Missing or inconsistent data must be escalated in weekly review.
- Repeat data quality issues for two weeks escalate to `risk-register.md` as P1.
