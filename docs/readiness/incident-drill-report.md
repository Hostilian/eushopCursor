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
| Auth outage |  |  |  |  | pending |
| Payment/connect issue |  |  |  |  | pending |
| Media degradation |  |  |  |  | pending |
| Data correctness anomaly |  |  |  |  | pending |

## Team performance scoring

| Dimension | Score (1-5) | Notes |
| --- | --- | --- |
| Detection speed |  |  |
| Triage quality |  |  |
| Communication clarity |  |  |
| Technical containment |  |  |
| Recovery verification |  |  |

## Findings and follow-ups

| Finding | Severity | Owner | Due date | Tracking link |
| --- | --- | --- | --- | --- |
| _Fill in_ |  |  |  |  |

## Readiness decision impact

- Block go/no-go if any scenario cannot reach containment under target SLA.
- Append accepted residual risks to `docs/readiness/go-no-go-decision.md`.
