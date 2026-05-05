# KPI Source Of Truth Register

Authoritative source map for readiness KPIs.

| KPI | Primary source | Backup source | Owner | Refresh cadence | Validation rule |
| --- | --- | --- | --- | --- | --- |
| CI success rate | CI workflow history | Build logs export | Engineering lead | Weekly | Match run counts across both sources |
| Blocking defect MTTR | Incident tracker | Ops incident notes | QA/SRE lead | Weekly | Sample 3 incidents manually |
| Critical path pass rate | Rehearsal/test reports | QA checklist logs | QA/SRE lead | Weekly | Web+mobile evidence required |
| Drill pass score | Drill report | Incident review notes | QA/SRE lead | Weekly during drills | Rubric completeness check |
| Consent-safe analytics coverage | Analytics platform | Consent audit snapshots | Data + Security leads | Weekly | No pre-consent emissions allowed |
| Support first response SLA | Support platform | CS manual export | CS lead | Weekly | Timezone normalization check |

## Register rules

- Primary source must be available before weekly review.
- Backup source must be maintained for auditability.
- Any source change requires update to this register and KPI playbook.
