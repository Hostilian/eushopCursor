# Go/No-Go Decision Record

Use this record for release candidate and readiness milestone decisions.

## Decision meeting

| Date | Environment | Release candidate | Chair | Participants | Outcome |
| --- | --- | --- | --- | --- | --- |
| 2026-06-03 | staging | v0.1.0-rc2 | `eng-duty` | `pm-duty`, `qa-duty`, `sec-duty`, `ops-duty`, `gtm-duty` | ready |

## Gate results

| Gate | Status | Evidence | Owner |
| --- | --- | --- | --- |
| Code gate (tier checks) | in_progress | `pnpm claims:check`, `pnpm i18n:check`, `pnpm verify` passed on 2026-05-05 baseline run | Engineering lead |
| Operational gate | in_progress | Runbook index linked; rollback owner assigned | Ops lead |
| Security gate | in_progress | `security-privacy-checklist.md` ready; final sign-off in_progress for RC review | Security lead |
| Readiness gate | in_progress | Scorecard/risk framework ready; final week-4 values in_progress | Program manager |

## Mandatory gate checklist

- [ ] No active P0 defects.
- [ ] All P1 defects have owner, ETA, and mitigation.
- [x] `pnpm claims:check` baseline pass captured (2026-05-05); RC re-run in_progress.
- [x] `pnpm verify` baseline pass captured (2026-05-05); RC re-run in_progress.
- [ ] Critical journey matrix passes on web and mobile.
- [ ] Security/privacy checklist signed by reviewer.
- [ ] Rehearsal and incident drill reports reviewed.
- [ ] Rollback owner and command path confirmed.

## KPI gate snapshot

| KPI | Current value | Target | Status |
| --- | --- | --- | --- |
| CI success rate (7d) | collection in progress | >= 95% | in_progress |
| Blocking defect MTTR | collection in progress | <= 24h P0, <= 3d P1 | in_progress |
| Critical path pass rate | rehearsal in_progress | >= 98% | in_progress |
| Incident drill pass score | drill in_progress | >= 85% | in_progress |
| Consent-safe analytics coverage | evidence collection in_progress | 100% | in_progress |
| Support first response SLA | CS report in_progress | >= 95% | in_progress |

## Open risks and accepted exceptions

| Risk ID | Severity | Mitigation | Owner | Expiry | Acceptance approver |
| --- | --- | --- | --- | --- | --- |
| R7 | P2 | Keep mobile payment caveat explicit in launch messaging | GTM lead | 2026-06-17 | Product lead |

## Rollback readiness

- Rollback owner: Operations lead (technical approver: Engineering lead).
- Rollback trigger conditions:
  - Critical journey outage > 30 minutes with no safe workaround.
  - Data-integrity risk in reservation/payment lifecycle.
  - Security/privacy incident beyond hotfix scope.
- Rollback command/runbook: `docs/ops/deploy-runbook.md` + service-specific steps in `docs/readiness/ops-runbook-index.md`.
- Validation steps after rollback: re-run critical journey smoke checks and confirm incident metric recovery.

## Final sign-offs

- Product (`pm-duty`): in_progress
- Engineering (`eng-duty`): in_progress
- QA/SRE (`qa-duty`): in_progress
- Security (`sec-duty`): in_progress
- Ops (`ops-duty`): in_progress
- Data/GTM (`data-duty`/`gtm-duty` as needed): in_progress

## Final decision statement

- Decision: in_progress until Gate 4 meeting (2026-06-03)
- Reasoning: Awaiting final KPI snapshot, drill scores, and sign-off completion.
