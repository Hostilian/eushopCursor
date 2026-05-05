# SLO, Incident Taxonomy, And Test Backfill Policy

This policy links service-level objectives, incident severity, and mandatory quality backfill after failures.

## SLO policy

## Critical journey SLOs

| Journey | SLI | SLO target | Measurement window | Owner |
| --- | --- | --- | --- | --- |
| Discovery to engagement | Successful listing/trip detail open rate | >= 99.5% | 7-day rolling | Lane A lead |
| Reservation lifecycle | Successful reservation state transition rate | >= 99.0% | 7-day rolling | Lane B lead |
| Chat continuity | Message send+receive success without duplicate loss | >= 99.0% | 7-day rolling | Lane B lead |
| Product picker attachment | Selections ending with image URL payload | >= 99.0% | 7-day rolling | Lane A lead |
| Auth/session | Successful login/session refresh | >= 99.8% | 7-day rolling | Security + Lane B |

## Error budget rules

- Burn > 25% in 24h: trigger incident review and freeze non-critical deploys for affected surface.
- Burn > 50% in 72h: enforce targeted stabilization sprint until SLO trend recovers.
- Chronic burn (4 weeks): mandatory architecture risk review.

## Incident taxonomy

| Class | Severity | Definition | Example |
| --- | --- | --- | --- |
| Availability | P0 | Core journey unavailable for most users | login down, API outage |
| Integrity | P0/P1 | Incorrect state/data causing unsafe outcomes | reservation state corruption |
| Security/Privacy | P0/P1 | Potential unauthorized access or sensitive leak | mis-scoped admin access |
| Degradation | P1 | Major slowdown or partial failure with workaround | search timeout by corridor |
| Quality | P2 | Non-blocking functional or UX defects | visual drift, copy defect |

## Incident response milestones

- `T_detect`: issue detected and acknowledged.
- `T_triage`: severity assigned and owner assigned.
- `T_contain`: user harm contained or workaround active.
- `T_recover`: service recovered and validated.
- `T_learn`: post-incident review and actions assigned.

## Test strategy baseline

| Layer | Coverage goal | Trigger |
| --- | --- | --- |
| Unit | Business logic and state transitions | Every feature/fix |
| Integration | API contracts and data flow | Router/schema/service changes |
| Contract | Event/schema compatibility | Shared package and event changes |
| Smoke e2e | Core journey availability | PRs touching critical paths |
| Manual scripted QA | Web+mobile parity for critical journeys | T2/T3 changes and release candidates |

## Mandatory post-incident test backfill

For every closed P0/P1 incident:

1. Add at least one automated test that would have caught the issue.
2. Add or update a manual checklist step if automation is insufficient.
3. Link the new test in the incident follow-up record.
4. Tag ownership in lane backlog for ongoing regression tracking.

## Backfill SLA

- P0 incidents: backfill test merged within 48 hours after containment.
- P1 incidents: backfill test merged within 5 business days.
- No incident marked fully closed without backfill evidence (or approved exception).

## Required evidence

- Incident record with timeline and severity rationale.
- Pull request proving backfill tests/checklist updates.
- Updated references in `docs/readiness/test-matrix.md` or journey docs when needed.
