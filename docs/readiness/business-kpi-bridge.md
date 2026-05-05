# Engineering To Business KPI Bridge

This bridge ensures each engineering initiative is linked to measurable business outcomes with quarterly targets.

## North-star and supporting KPI stack

| Level | KPI | Why it matters | Owner |
| --- | --- | --- | --- |
| North-star | Successful cross-border exchanges per active corridor | Measures core marketplace value creation | Product lead |
| Supporting | Activation rate (new users completing first meaningful action) | Indicates onboarding and early value | Growth lead |
| Supporting | Reservation completion rate | Measures trust and transaction quality | Engineering + Product |
| Supporting | 30-day repeat usage | Indicates retention and habitual use | Product analytics |
| Supporting | Support burden per 100 active users | Captures quality and usability friction | CS lead |

## Initiative traceability model

| Initiative ID | Initiative | Engineering output | Expected KPI impact | Lag window | Owner |
| --- | --- | --- | --- | --- | --- |
| INIT-A1 | Picker/media reliability hardening | Fallback parity and media failure reduction | +reservation completion, -support burden | 2-4 weeks | Lane A lead |
| INIT-B1 | Reservation lifecycle correctness | State transition and contract validation | +completion rate, +repeat usage | 2-6 weeks | Lane B lead |
| INIT-O1 | Tiered release gate rollout | Fewer bad deploys and faster containment | -support burden, +activation confidence | 1-3 weeks | Ops + Eng |
| INIT-D1 | Event quality controls | Better experiment and KPI confidence | +decision velocity, +activation optimization | 1-2 weeks | Data lead |

## Quarterly target tracker

| Quarter | North-star target | Activation target | Completion target | Repeat usage target | Support burden target |
| --- | --- | --- | --- | --- | --- |
| Q1 | baseline + 10% | >= 35% | >= 92% | >= 25% | <= 8 / 100 users |
| Q2 | baseline + 20% | >= 40% | >= 94% | >= 28% | <= 7 / 100 users |
| Q3 | baseline + 30% | >= 45% | >= 95% | >= 30% | <= 6 / 100 users |
| Q4 | baseline + 40% | >= 50% | >= 96% | >= 33% | <= 5 / 100 users |

## Weekly operating view

| Week | Initiative | Leading indicators | KPI movement observed | Decision |
| --- | --- | --- | --- | --- |
| 2026-W19 | INIT-O1 (tiered release gate rollout) | Claims/verify pass trend, reduced late-stage defects | Baseline week, no trend yet | continue |
| 2026-W19 | INIT-D1 (event quality controls) | Scorecard operational, taxonomy finalized, evidence-log cadence active | Early instrumentation governance improvement expected | continue |

## Decision rules

- Continue: initiative leading indicators and KPI movement are both positive.
- Adjust: delivery output is healthy but KPI impact is flat after expected lag window.
- Stop/replace: initiative misses output milestones and KPI impact remains negative.

## Evidence expectations

- Each major PR includes expected KPI impact in its description.
- Monthly readiness review includes initiative-to-KPI attribution update.
- Quarterly re-planning retires initiatives with no measurable impact.
