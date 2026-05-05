# Incident Drill Report

## Drill objectives

- Validate first-response coordination and escalation chain.
- Validate rollback and containment paths for high-impact failures.
- Capture measurable response timings and decision quality.

## Drill scenarios

1. Authentication outage (`BETTER_AUTH_SECRET`/callback mismatch).
2. Stripe/connect payment flow degradation.
3. Media pipeline failure (remote fetch or rehost instability).
4. Data correctness anomaly (reservation state mismatch).

## Scenario log template

| Scenario | Start time | Detection time | Time to contain | Time to recover | Status |
| --- | --- | --- | --- | --- | --- |
| Auth outage | 2026-05-30 10:00 UTC | 5 min | <= 30 min target | <= 90 min target | ready |
| Payment/connect issue | 2026-05-30 11:00 UTC | 10 min | <= 45 min target | <= 120 min target | ready |
| Media degradation | 2026-05-30 12:00 UTC | 10 min | <= 45 min target | <= 120 min target | ready |
| Data correctness anomaly | 2026-05-30 13:00 UTC | 15 min | <= 60 min target | <= 180 min target | ready |

## Team performance scoring

| Dimension | Score (1-5) | Notes |
| --- | --- | --- |
| Detection speed | in_progress | Score after drill execution |
| Triage quality | in_progress | Score after drill execution |
| Communication clarity | in_progress | Score after drill execution |
| Technical containment | in_progress | Score after drill execution |
| Recovery verification | in_progress | Score after drill execution |

## Findings and follow-ups

| Finding | Severity | Owner | Due date | Tracking link |
| --- | --- | --- | --- | --- |
| Finalize incident commander backup rotation | P1 | QA/SRE lead | 2026-05-27 | docs/readiness/owner-matrix.md |
| Add rollback rehearsal note links in deploy runbook | P1 | Ops lead | 2026-05-28 | docs/ops/deploy-runbook.md |

## Readiness decision impact

- Block go/no-go if any scenario cannot reach containment under target SLA.
- Append accepted residual risks to `docs/readiness/go-no-go-decision.md`.
