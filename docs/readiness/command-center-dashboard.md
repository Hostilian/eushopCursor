# Readiness Command Center Dashboard

Single-pane status view for daily and weekly leadership syncs.

## Snapshot header

- Date (UTC): `YYYY-MM-DD`
- Cycle day: `D__ / 30`
- Current phase: `Week 1|2|3|4`
- Overall status: `green | yellow | red`
- Next gate date: `YYYY-MM-DD`

## Gate health

| Gate | Status | Owner | Last evidence update | Risk level |
| --- | --- | --- | --- | --- |
| Code | in_progress | Engineering lead | 2026-05-05 | medium |
| Operational | in_progress | Ops lead | 2026-05-05 | medium |
| Security | in_progress | Security lead | 2026-05-05 | medium |
| Readiness | in_progress | Program manager | 2026-05-05 | medium |

## KPI health

| KPI | Current | Target | Trend | Status |
| --- | --- | --- | --- | --- |
| CI success rate | baseline pass | >= 95% | flat | in_progress |
| Blocking defect MTTR | collecting | <= target | flat | in_progress |
| Critical path pass rate | pending manual evidence | >= 98% | flat | in_progress |
| Drill pass score | pending drill evidence | >= 85% | flat | in_progress |
| Consent-safe analytics coverage | collecting | 100% | flat | in_progress |
| Support first response SLA | collecting | >= 95% | flat | in_progress |

## Top 5 risks

| Risk | Severity | Owner | ETA | Status |
| --- | --- | --- | --- | --- |
| Env/config drift | P0 | Ops lead | 2026-05-12 | open |
| Consent evidence lag | P1 | Data lead | 2026-05-12 | open |
| Support readiness uncertainty | P1 | CS lead | 2026-05-12 | open |
| RC evidence completeness | P1 | Program manager | 2026-05-29 | open |
| Drill execution delay | P1 | QA/SRE lead | 2026-05-10 | open |

## Critical blockers

- Manual journey evidence not attached.
- Drill score evidence not attached.
- Role placeholders not fully replaced by named owners.

## Links

- `docs/readiness/operator-cockpit.md`
- `docs/readiness/go-no-go-decision.md`
- `docs/readiness/evidence-log.md`
- `docs/readiness/risk-register.md`
- `docs/readiness/readiness-scorecard.md`
