# Readiness Automation Inventory

Track automations that influence readiness decisions or evidence.

| Automation | Purpose | Trigger | Owner | Failure impact | Monitoring source |
| --- | --- | --- | --- | --- | --- |
| `pnpm claims:check` | Claim overlap and hotspot validation | Manual/CI | Engineering lead | Merge safety regressions | CI logs |
| `pnpm i18n:check` | Locale key parity checks | Manual/CI | Engineering lead | User-facing localization regressions | CI logs |
| `pnpm verify` | Full quality gate | Manual/CI | Engineering lead | Release quality blind spots | CI logs |
| Dashboard update routine | Status roll-up refresh | Daily/weekly | Program manager | Stale leadership view | Evidence log |
| Weekly evidence checklist | Evidence completeness | Weekly | Program manager | Missing go/no-go evidence | Weekly review records |

## Maintenance

- Review inventory monthly.
- Add new automation entries before relying on them for gate decisions.
