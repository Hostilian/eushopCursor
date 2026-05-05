# Security Baseline, Secret Governance, And Data Observability Framework

This framework defines minimum controls, ownership, and enforcement cadence for secure operations and trustworthy decision data.

## 1) Security baseline controls

| Control area | Baseline requirement | Owner | Verification cadence |
| --- | --- | --- | --- |
| Auth/session | Environment-correct auth URLs and secrets; session invalidation works | Security lead | Weekly + release candidate |
| Authorization | Admin/moderation actions have role checks and audit trace | Lane B lead | Weekly |
| Webhooks | Signature validation required for external webhooks | Lane B lead | Every webhook change |
| Data protection | Sensitive values are excluded/redacted from logs | Engineering lead | Per release |
| Media ingestion | Remote assets validated and re-hosted server-side | Lane B lead | Weekly |
| Dependency security | Critical/high dependency findings triaged by SLA | Security lead | Daily scan review |

## 2) Secret governance policy

## Secret classes

| Class | Examples | Rotation SLA | Storage requirement |
| --- | --- | --- | --- |
| Tier 1 critical | Auth secret, DB credentials, signing keys | 90 days or incident-driven | Secret manager only |
| Tier 2 important | API service tokens, analytics keys | 180 days | Secret manager only |
| Tier 3 non-sensitive config | Public site URLs, non-secret flags | As needed | Version-controlled config |

## Mandatory rules

- No secrets in git-tracked files, docs, screenshots, or logs.
- Every Tier 1/Tier 2 secret has owner, backup owner, and last-rotated date.
- Secret changes require rollback-aware deployment notes.
- Suspected leakage triggers immediate rotation and incident logging.

## Leak response SLA

- Acknowledge within 15 minutes.
- Revoke/rotate exposed secret within 60 minutes for Tier 1.
- Complete impact assessment within 24 hours.

## 3) Dependency vulnerability policy

| Severity | Initial response | Fix SLA | Escalation |
| --- | --- | --- | --- |
| Critical | Same day | 72 hours | Blocks release unless accepted risk |
| High | 1 business day | 7 days | Escalate to weekly readiness review |
| Medium | 3 business days | 30 days | Tracked in monthly debt |
| Low | Next planned cycle | 90 days | Backlog item |

Exceptions require written risk acceptance with expiry date and compensating controls.

## 4) Data quality and observability framework

## Data quality SLIs

| SLI | Definition | Target | Owner |
| --- | --- | --- | --- |
| Event completeness | Required funnel events emitted for valid sessions | >= 98% | Data lead |
| Event validity | Events pass schema/contract validation | >= 99.5% | Data lead |
| Pipeline freshness | Lag from event ingestion to reporting | <= 30 min p95 | Data lead |
| Consent compliance | Product analytics events emitted only after consent | 100% | Data + Security |

## Observability signal set

- Golden signals: latency, traffic, errors, saturation for web/api/chat critical paths.
- Incident signals: authentication failures, webhook validation failures, media fetch failure spikes.
- Business health signals: activation funnel, reservation completion, picker image attach success.

## Alert policy

| Alert class | Trigger | Routing |
| --- | --- | --- |
| Immediate page | Security leak, P0 availability drop, data integrity issue | On-call + security lead |
| High-priority ticket | SLO warning, P1 degradation, event validity drop | Responsible lane lead |
| Weekly review item | Repeated yellow trend without outage | Readiness review owners |

## 5) Audit evidence pack (per release candidate)

- Secret inventory delta and rotation log.
- Vulnerability report with active exceptions.
- Consent and analytics evidence.
- Data quality snapshot (completeness, validity, freshness).
- Security reviewer sign-off.

## 6) Ownership and review cadence

- Weekly: control checks and SLI review.
- Monthly: security and data posture trend review.
- Quarterly: baseline control refresh and policy updates.
