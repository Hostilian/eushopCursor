# Readiness KPI Dictionary

## KPI principles

- Every KPI has one owner and one source of truth.
- Report weekly during readiness and at go/no-go.
- No KPI is accepted without an explicit calculation rule.

## KPIs

| KPI | Definition | Formula | Source | Owner | Target by Day 30 |
| --- | --- | --- | --- | --- | --- |
| CI success rate (7d) | Share of successful CI runs in trailing 7 days | successful_runs / total_runs | CI provider + workflow history | Engineering lead | >= 95% |
| Blocking defect MTTR | Mean time to resolve P0/P1 blockers | avg(close_time - open_time) | Issue tracker | QA/SRE lead | <= 24h for P0, <= 3d for P1 |
| Critical path pass rate | Share of scripted journey steps passing | passed_steps / total_steps | Test matrix reports | QA/SRE lead | >= 98% |
| Incident drill pass score | Weighted drill completion score | achieved_points / total_points | Drill report | Ops lead | >= 85% |
| Consent-safe analytics coverage | % key funnels tracked only after consent | compliant_events / total_key_events | Analytics + consent checks | Data lead | 100% |
| Support first response SLA | % support requests answered within SLA | on_time_first_response / total_requests | Support system | CS lead | >= 95% |
| Scope stability index | % weekly commitments delivered unchanged | delivered_without_churn / committed_scope | Readiness tracker | Product lead | >= 80% |

## Reporting format

| Week | KPI | Value | Target | Status (green/yellow/red) | Action owner |
| --- | --- | --- | --- | --- | --- |
| Week 1 |  |  |  |  |  |
| Week 2 |  |  |  |  |  |
| Week 3 |  |  |  |  |  |
| Week 4 |  |  |  |  |  |

## Guardrails

- If two or more core KPIs are red at gate review, go/no-go defaults to hold.
- Exceptions require written risk acceptance in `go-no-go-decision.md`.
