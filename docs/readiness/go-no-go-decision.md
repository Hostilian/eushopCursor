# Go/No-Go Decision Record

## Decision meeting

| Date | Release candidate | Chair | Participants | Outcome |
| --- | --- | --- | --- | --- |
| YYYY-MM-DD | vX.Y.Z-rcN | Engineering lead | Product, QA/SRE, Security, Ops, GTM | go/no-go |

## Mandatory gate checks

- [ ] No open P0 defects.
- [ ] All P1 defects have owner, ETA, and mitigation.
- [ ] `pnpm claims:check` passed on release branch.
- [ ] `pnpm verify` passed on release candidate.
- [ ] Critical journey matrix passes on web and mobile.
- [ ] Security/privacy checklist signed by reviewer.
- [ ] Rehearsal and incident drill reports reviewed.
- [ ] Rollback owner and command path confirmed.

## KPI gate snapshot

| KPI | Current value | Target | Status |
| --- | --- | --- | --- |
| CI success rate (7d) |  | >= 95% | pending |
| Blocking defect MTTR |  | <= targets | pending |
| Critical path pass rate |  | >= 98% | pending |
| Incident drill pass score |  | >= 85% | pending |
| Consent-safe analytics coverage |  | 100% | pending |
| Support first response SLA |  | >= 95% | pending |

## Residual risks accepted

| Risk ID | Description | Owner | Expiry | Mitigation |
| --- | --- | --- | --- | --- |
| _Fill in_ |  |  |  |  |

## Rollback criteria

Trigger rollback if any of the following occur within launch window:

- Critical journey outage for >30 minutes with no safe workaround.
- Data-integrity risk in reservation or payment lifecycle.
- Security/privacy incident requiring containment beyond hotfix scope.

## Rollback plan

- Web/admin: redeploy previous known-good artifact.
- API: roll back service version only with DB compatibility verified.
- DB: forward-fix preferred; restore only through approved snapshot procedure.
- Search/media/jobs/chat: follow linked ops runbooks in `ops-runbook-index.md`.

## Final decision statement

`GO` or `NO-GO`:

Reasoning:
