# 30-Day Readiness Command Center

This command center is the single working source for day-to-day readiness execution.

## Mission

- Deliver production readiness across product, engineering, security, reliability, data, GTM, and operations in 30 days.
- Keep decision-making evidence-based and owner-driven.
- Protect merge safety by following claims and hotspot rules.

## Scope

- In scope: release readiness, operational readiness, launch messaging readiness.
- Out of scope: net-new multi-quarter feature programs not required for launch confidence.

## Operating Cadence

- Daily: 15-minute blocker sync.
- Tuesday/Friday: risk re-score review.
- Weekly: release readiness gate with go/hold decisions.

## Timeline (2026-05-05 to 2026-06-03)

- Day 1: 2026-05-05
- Day 30: 2026-06-03
- Gate 1 review: 2026-05-12
- Gate 2 review: 2026-05-19
- Gate 3 review: 2026-05-26
- Go/no-go meeting: 2026-06-03

## Owner Map

| Workstream | Accountable owner | Backup owner | Lane |
| --- | --- | --- | --- |
| Product and roadmap | Product lead | Program manager | A |
| Engineering delivery | Engineering lead | Staff engineer | A/B |
| Security and privacy | Security lead | Engineering lead | O |
| QA and reliability | QA/SRE lead | Engineering lead | O |
| Data and analytics | Data lead | Product analytics | O |
| GTM and customer success | GTM lead | CS lead | O |
| Operations/legal/finance | Operations lead | Legal/finance partner | O |

## Week-By-Week Calendar

### Week 1 (Days 1-7)

- Stand up governance docs and owner map.
- Freeze top 10 launch outcomes with acceptance criteria.
- Start risk register and assign mitigation owners.
- Planned execution window: 2026-05-05 to 2026-05-11.

### Week 2 (Days 8-14)

- Lock critical user journeys and quality bars.
- Complete environment, secret, and privacy checklist.
- Publish test matrix and incident severity policy.
- Planned execution window: 2026-05-12 to 2026-05-18.

### Week 3 (Days 15-21)

- Finalize KPI dictionary and event taxonomy.
- Publish GTM playbook and customer response SLA.
- Confirm deploy/rollback runbook index is complete.
- Planned execution window: 2026-05-19 to 2026-05-25.

### Week 4 (Days 22-30)

- Execute release dress rehearsal and tabletop drills.
- Run final readiness scoring and go/no-go.
- Publish executive summary and next-30-day plan.
- Planned execution window: 2026-05-26 to 2026-06-03.

## Decision Log

| Date | Decision | Owner | Rationale | Impact |
| --- | --- | --- | --- | --- |
| 2026-05-05 | 30-day readiness program initiated | Program manager | Align all functions on a single launch-quality operating model | Establishes weekly gates, ownership, and evidence requirements |

## Evidence Links

- Risk register: `docs/readiness/risk-register.md`
- Owner matrix: `docs/readiness/owner-matrix.md`
- Critical journeys: `docs/readiness/critical-journeys.md`
- Security/privacy checklist: `docs/readiness/security-privacy-checklist.md`
- Test matrix: `docs/readiness/test-matrix.md`
- KPI dictionary: `docs/readiness/kpi-dictionary.md`
- Event taxonomy: `docs/readiness/event-taxonomy.md`
- GTM playbook: `docs/readiness/gtm-playbook.md`
- Runbook index: `docs/readiness/ops-runbook-index.md`
- Rehearsal report: `docs/readiness/rehearsal-report.md`
- Incident drill report: `docs/readiness/incident-drill-report.md`
- Go/no-go: `docs/readiness/go-no-go-decision.md`
- Day-30 summary: `docs/readiness/day30-exec-summary.md`

## Gate Checklist

- `pnpm claims:check` passes before substantial merges.
- `pnpm verify` passes for weekly gate and release candidate.
- No open P0 defects.
- Every open P1 has owner and dated ETA.
- Rollback owner and path confirmed for release candidate.
