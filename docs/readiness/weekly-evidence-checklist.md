# Weekly Evidence Checklist

Run this checklist before each weekly readiness review.

## Code and quality evidence

- [ ] `pnpm readiness:index:check` result recorded.
- [ ] `pnpm claims:check` result recorded.
- [ ] `pnpm i18n:check` result recorded (if required for week scope).
- [ ] `pnpm verify` result recorded.
- [ ] `pnpm readiness:verify` result recorded when running RC-level checks.
- [ ] Critical journey test status updated.

## Reliability and incident evidence

- [ ] Incident drill progress/status updated.
- [ ] Any active P0/P1 incident status and ETA updated.
- [ ] MTTR snapshot published.

## Security and privacy evidence

- [ ] Security checklist update recorded.
- [ ] Consent-safe analytics proof update recorded.
- [ ] Active security exceptions include owner + expiry.

## Product and business evidence

- [ ] KPI scorecard row updates done.
- [ ] Business KPI bridge weekly row updated.
- [ ] Support SLA baseline/trend updated.

## Operational readiness evidence

- [ ] Rollback owner and runbook link confirmed current.
- [ ] Risk register changes logged.
- [ ] Go/no-go decision doc status updated (if applicable).

## Publication step

- [ ] Add/refresh entries in `evidence-log.md`.
- [ ] Link evidence in current weekly review file.
- [ ] Confirm owner action register reflects new follow-ups.
