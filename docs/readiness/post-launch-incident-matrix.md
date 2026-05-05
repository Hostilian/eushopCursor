# Post-Launch Incident Classification And Escalation Matrix

Use this matrix for incident severity assignment and escalation after launch.

## Severity matrix

| Severity | Definition | Typical examples | Initial response target | Escalation path |
| --- | --- | --- | --- | --- |
| P0 | Core flow unavailable, unsafe, or data-integrity threat | Login outage, reservation corruption, security exposure | <= 15 minutes | On-call engineer -> Incident commander -> Security/Ops/Product leads |
| P1 | Major degradation with limited workaround | Search failures by corridor, payment path instability | <= 60 minutes | On-call engineer -> Domain lead -> Ops/Product |
| P2 | Partial defect with low immediate user harm | Non-critical flow breakages, moderate UX regression | <= 4 hours | Domain owner -> Weekly incident review |
| P3 | Minor defect/copy/style issue | Cosmetic issue, low-impact messaging drift | <= 1 business day | Backlog triage |

## Escalation rules

- Any P0 automatically opens incident room and leadership update cadence.
- Two P1 incidents in same domain within 7 days escalate to risk register P1.
- Security-class incidents always page security lead regardless of severity.

## Communication cadence

| Severity | Internal update cadence | Leadership update cadence | External update cadence |
| --- | --- | --- | --- |
| P0 | every 15 min | every 30 min | every 60 min or as required |
| P1 | every 30 min | every 60 min | as needed |
| P2 | every 4 hours | daily summary | none unless user-facing impact is broad |
| P3 | daily | weekly summary | none |

## Closure criteria

- Root cause hypothesis recorded.
- Containment and recovery timestamps recorded.
- Follow-up owner and due date assigned.
- Backfill test requirement checked against `slo-and-incident-policy.md`.
