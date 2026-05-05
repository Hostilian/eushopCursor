# Weekly Readiness Review Template

## Meeting metadata

- Week: `2026-W__`
- Date:
- Chair:
- Attendees:

## 1) Gate summary

| Gate | Status | Evidence | Owner | Notes |
| --- | --- | --- | --- | --- |
| Code gate |  |  |  |  |
| Operational gate |  |  |  |  |
| Security gate |  |  |  |  |
| Readiness gate |  |  |  |  |

## 2) KPI snapshot

| KPI | Current | Target | Trend | Status | Owner action |
| --- | --- | --- | --- | --- | --- |
| CI success rate |  | >= 95% |  |  |  |
| Blocking defect MTTR |  | <= target |  |  |  |
| Critical path pass rate |  | >= 98% |  |  |  |
| Drill pass score |  | >= 85% |  |  |  |
| Consent-safe analytics coverage |  | 100% |  |  |  |
| Support first response SLA |  | >= 95% |  |  |  |

## 3) Risk and blockers

| Risk ID | Severity | Change since last week | Owner | Mitigation due |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## 4) Decision log entries

| Decision | Type | Owner | Expiry | Rationale |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## 5) Action list

| Action | Owner | Due date | Status |
| --- | --- | --- | --- |
|  |  |  |  |

## Verification block (recommended)

- Optional preflight snapshot: `pnpm readiness:doctor`
- Optional persistent snapshot: `pnpm readiness:doctor:write`
- Optional freshness guard: `pnpm readiness:doctor:fresh`
- Preferred one-command run: `pnpm readiness:verify`
- Attach output links in `evidence-log.md` and this weekly record.

If verification fails:

1. Run `pnpm readiness:status:check` and fix vocabulary violations.
2. Run `pnpm claims:check` and resolve claim overlap/hotspot conflicts.
3. Run `pnpm verify` and capture pass/fail evidence with owner action follow-ups.
