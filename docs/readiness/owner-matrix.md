# Readiness Owner Matrix

## Role map

| Area | Primary owner | Secondary owner | Responsibilities | KPI owned |
| --- | --- | --- | --- | --- |
| Product readiness | Product lead | Program manager | Priority freeze, acceptance criteria, scope guardrails | Scope completion rate |
| Engineering readiness | Engineering lead | Staff engineer | Architecture health, defect burn-down, code quality | CI pass rate, defect MTTR |
| Security/privacy readiness | Security lead | Engineering lead | Secret hygiene, privacy controls, compliance checks | Critical security gaps open |
| QA/reliability readiness | QA/SRE lead | Engineering lead | Test coverage, incident severity policy, rehearsal execution | Critical path pass rate |
| Data/analytics readiness | Data lead | Product analyst | KPI definitions, taxonomy integrity, consent evidence | KPI coverage, consent-safe telemetry |
| GTM/CS readiness | GTM lead | CS lead | Messaging consistency, launch collateral, support readiness | SLA adherence |
| Ops/legal/finance readiness | Operations lead | Legal/finance partner | Deploy/rollback, legal text completeness, escalation process | Drill pass score |

## Away-window named assignment map

Use these named role aliases while the core team is away so every scheduled action still has an accountable owner.

| Role alias | Covers | Escalates to |
| --- | --- | --- |
| `pm-duty` | Program manager decisions and evidence consolidation | `eng-duty` |
| `eng-duty` | Engineering gate ownership and technical approvals | `ops-duty` |
| `sec-duty` | Security/privacy checklist and exception control | `eng-duty` |
| `qa-duty` | Journey validation, rehearsal, and drill scoring | `eng-duty` |
| `data-duty` | KPI/event evidence and consent verification | `pm-duty` |
| `gtm-duty` | Messaging truth checks and support SLA alignment | `pm-duty` |
| `ops-duty` | Rollback ownership and runbook execution authority | `eng-duty` |

### Current assignment start date

- Effective from: `2026-05-05`
- Coverage mode: `away-window`
- Rule: no `ready` task may remain ownerless; if alias owner is unavailable, fallback is the `Escalates to` owner.

## Decision rights

- Product scope changes: Product lead (consult Eng, QA, GTM).
- Release gate outcomes: Engineering lead + QA/SRE lead + Ops lead.
- Privacy/security exceptions: Security lead veto.
- External messaging claims: GTM lead + Product lead joint approval.

## RACI by weekly gates

| Gate | R | A | C | I |
| --- | --- | --- | --- | --- |
| Week 1 baseline | Program manager | Product lead | Eng, Ops | All leads |
| Week 2 hardening | Eng lead, QA/SRE lead | Engineering lead | Security, Product | All leads |
| Week 3 readiness scale | Data lead, GTM lead, Ops lead | Program manager | Product, Security | All leads |
| Week 4 go/no-go | QA/SRE lead, Ops lead | Engineering lead | Product, Security, GTM | All stakeholders |

## Meeting rhythm

- Daily blocker sync: all primary owners.
- Risk review (Tue/Fri): program manager + all primary owners.
- Weekly gate review: primary and secondary owners, with signed outcomes.
