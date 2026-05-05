# 30-Day Readiness Risk Register

## Scoring model

- Likelihood: 1 (low) to 5 (high)
- Impact: 1 (low) to 5 (high)
- Score: likelihood x impact
- Priority: P0 (>=20), P1 (12-19), P2 (<12)

## Active risks

| ID | Risk | Likelihood | Impact | Score | Priority | Owner | Mitigation | Trigger |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Cross-lane hotspot collisions delay merges | 4 | 4 | 16 | P1 | Eng lead | Enforce claims and hotspot serialization | `claims:check` overlap failures |
| R2 | Environment drift between local/staging/prod | 4 | 5 | 20 | P0 | Ops lead | Weekly env parity review against `.env.example` and deploy vars | Missing runtime variables in smoke checks |
| R3 | Critical path gaps under realistic data | 3 | 5 | 15 | P1 | QA lead | Run scripted regression set plus manual journey QA | RC defects in trip/listing/chat |
| R4 | Rollback procedure unclear during incident | 3 | 5 | 15 | P1 | Ops lead | Link rollback path per service in runbook index | On-call escalation without rollback owner |
| R5 | Consent evidence incomplete for analytics | 3 | 4 | 12 | P1 | Data lead | Attach before/after evidence in release PRs | Privacy review fails release gate |
| R6 | Search/chat/media performance regressions | 3 | 4 | 12 | P1 | Eng lead | Add rehearsal load checks and alert thresholds | Elevated latency/error during drill |
| R7 | Launch narrative diverges from product state | 2 | 4 | 8 | P2 | GTM lead | Weekly truth alignment with product/ops | Sales or support confusion on scope |
| R8 | Post-launch support ownership unclear | 3 | 4 | 12 | P1 | CS lead | Publish SLA and escalation chain | Tickets unresolved beyond SLA |

## Weekly review template

| Week | New risks | Closed risks | Re-scored | Notes |
| --- | --- | --- | --- | --- |
| Week 1 | 0 | 0 | R2 reviewed (still P0), R5 reviewed (still P1) | Baseline risk review completed with owners and mitigations confirmed |
| Week 2 |  |  |  |  |
| Week 3 |  |  |  |  |
| Week 4 |  |  |  |  |

## Escalation rules

- Escalate to release gate immediately when any P0 risk has no mitigation owner.
- Do not proceed with go/no-go if any P0 remains active.
- Record all risk score changes in `docs/readiness/30-day-master.md` decision log.
