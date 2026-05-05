# Drill Scenario Library

Use this library to run structured reliability and readiness tabletop drills.

## Scenario catalog

| ID | Scenario | Severity target | Primary owner | Success criteria |
| --- | --- | --- | --- | --- |
| DSL-001 | Auth callback mismatch after deploy | P0 | Security + Engineering | Containment <= 30 min, recovery <= 90 min |
| DSL-002 | Reservation state inconsistency | P0 | Engineering + QA/SRE | Safe-state containment <= 45 min |
| DSL-003 | Stripe webhook signature failures | P1 | Engineering + Ops | Root cause identified <= 60 min |
| DSL-004 | Search latency spike by corridor | P1 | Engineering | User-facing degradation reduced <= 90 min |
| DSL-005 | Media re-host pipeline degradation | P1 | Engineering + Ops | Fallback path enabled <= 45 min |
| DSL-006 | Analytics consent regression | P1 | Data + Security | Non-compliant events stopped <= 30 min |

## Scenario run template

| Field | Value |
| --- | --- |
| Scenario ID |  |
| Start time (UTC) |  |
| Detection time |  |
| Containment time |  |
| Recovery time |  |
| Incident commander |  |
| Technical owner |  |
| Outcome | pass/fail |
| Follow-up actions |  |

## Rotation guidance

- Run at least 2 scenarios per week during readiness month.
- Ensure at least one scenario from security, data, and operations categories each cycle.
