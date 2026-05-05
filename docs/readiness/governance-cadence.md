# Readiness Governance Cadence

This document operationalizes daily, weekly, monthly, and quarterly readiness reviews with clear artifacts and decision logging.

## Cadence map

| Cadence | Meeting | Primary objective | Required attendees | Output artifact |
| --- | --- | --- | --- | --- |
| Daily | Blocker triage (15 min) | Unblock delivery and incident work | Lane leads, PM, QA/SRE | Updated blocker board |
| Weekly | Readiness review (60 min) | Scorecard updates, gate status, risk decisions | Product, Eng, Security, QA/SRE, Ops, Data, GTM | Weekly readiness log |
| Biweekly | Capacity and roadmap rebalance | Re-prioritize by risk and impact | Product, Eng, PM | Decision entries + backlog updates |
| Monthly | Architecture + security review | Track reliability/security debt and trend | Eng, Security, QA/SRE, Ops | Monthly posture memo |
| Quarterly | Readiness re-baseline | Reset targets and operating controls | Leadership + domain owners | Quarterly readiness report |

## Required artifacts

- Scorecard updates: `docs/readiness/readiness-scorecard.md`
- Risk updates: `docs/readiness/risk-register.md`
- Gate decisions and waivers: `docs/readiness/go-no-go-decision.md`
- Security/data control updates: `docs/readiness/security-data-framework.md`
- Incident learning and test backfill status: `docs/readiness/incident-drill-report.md`
- KPI to business linkage updates: `docs/readiness/business-kpi-bridge.md`

## Decision log template

Use this template in weekly and higher-order reviews.

| Date | Decision | Type (risk/priority/control/exception) | Owner | Expiry/review date | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-05-05 | Readiness governance cadence adopted | control | Program manager | 2026-06-03 | Baseline cadence active for 30-day window |

## Governance rules

- No unresolved P0 with missing owner at weekly review close.
- Any control exception must include an expiry date and mitigation owner.
- Repeated yellow/red scorecard metrics require named action plan before next review.
- Quarterly target changes must include baseline data and rationale.

## Escalation protocol

1. Identify cross-lane blocker or policy breach.
2. Assign temporary incident/program owner immediately.
3. Set containment action and deadline.
4. Record decision and follow-up artifact.
5. Verify closure in next weekly review.
