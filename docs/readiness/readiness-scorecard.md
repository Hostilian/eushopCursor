# Readiness Scorecard

This scorecard is the operating source of truth for launch and scale readiness across product, engineering, security, data, and business outcomes.

## Review cadence

- Weekly: readiness operating review (owners update current week values and actions).
- Monthly: leadership readiness review (trend and risk decisions).
- Quarterly: target reset and KPI retirement/addition decisions.

## Scorecard metrics

| Domain | Metric | Definition | Formula | Data source | Accountable owner | Weekly target | Alert threshold |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Delivery | PR cycle time p50 | Median open-to-merge time for PRs | p50(merged_at - opened_at) | GitHub PR API | Engineering lead | <= 48h | > 72h for 2 weeks |
| Delivery | Deployment frequency | Number of production deploys per week | count(prod deploys) | Deploy logs | Ops lead | >= 3 | < 1 |
| Quality | Change failure rate | Share of deploys needing rollback/hotfix | failed_deploys / total_deploys | Incident + deploy logs | QA/SRE lead | <= 10% | > 20% |
| Reliability | Core SLO attainment | Uptime success for critical journeys | successful_slo_windows / total_windows | SLO dashboards | QA/SRE lead | >= 99.5% | < 99.0% |
| Reliability | MTTR (P0/P1) | Mean incident recovery time | avg(resolved_at - detected_at) | Incident tracker | QA/SRE lead | <= 120m | > 240m |
| Security | Critical vuln age | Oldest unresolved critical vulnerability | max(now - opened_at) | Dependabot + security tracker | Security lead | <= 7 days | > 14 days |
| Security | Secrets compliance | Services passing required secret checks | compliant_services / total_services | Env audit checklist | Security lead | 100% | < 100% |
| Data | Event completeness | Presence of required funnel events | complete_sessions / total_sessions | Analytics warehouse | Data lead | >= 98% | < 95% |
| Data | Contract break rate | Breaking data/event schema changes | breaking_changes / week | CI contract checks | Data lead | 0 | >= 1 |
| Product | Critical journey pass rate | Manual+automated success across key flows | passed_steps / total_steps | QA reports | Product + QA leads | >= 98% | < 95% |
| Business | Activation rate | New users completing core activation | activated_users / new_users | Product analytics | Product lead | >= 35% | < 25% |
| Business | Repeat usage (30d) | Users returning in 30 days | returning_30d / activated_users | Product analytics | Growth lead | >= 25% | < 15% |

## Weekly scorecard template

| Week | Metric | Current | Target | Status | Owner action | Due date |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-W19 | Gate command baseline (`claims`, `i18n`, `verify`) | pass (2026-05-05) | pass | green | Maintain pass through RC branch re-run | 2026-05-29 |
| 2026-W19 | PR cycle time p50 | collection in progress | <= 48h | yellow | Engineering lead to publish snapshot | 2026-05-12 |
| 2026-W19 | Ownership coverage completeness | 100% role alias coverage (`away-window`) | 100% | green | Program manager to keep alias map current | 2026-05-12 |

## Status rules

- `green`: meets or exceeds target.
- `yellow`: misses target but above alert threshold.
- `red`: crosses alert threshold or worsens two weeks consecutively.

## Escalation rules

- Any `red` in Reliability or Security blocks unrestricted releases until an owner-approved mitigation is active.
- Two or more `red` metrics in one week trigger a cross-lane corrective action review in the weekly readiness meeting.
- A metric that is `yellow` for 3 consecutive weeks requires an explicit improvement plan in the decision log.

## Evidence requirements

- Source links for each weekly metric update.
- Owner-signed actions for all `yellow` and `red` metrics.
- Change note in `docs/readiness/governance-cadence.md` decision log if targets are modified.
