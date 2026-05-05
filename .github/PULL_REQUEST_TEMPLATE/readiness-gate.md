## Change classification

- Risk tier: `T0` | `T1` | `T2` | `T3`
- Lane: `A` | `B` | `O`
- Hotspot touched: `none` | `H1` | `H2` | `H3` | `H4` | `H5` | `H6`

## Mandatory evidence

- [ ] Claim file present and valid (`pnpm claims:check`)
- [ ] CI checks pass for selected tier (see `docs/readiness/gate-matrix.md`)
- [ ] `pnpm i18n:check` included when i18n/user-facing copy touched
- [ ] `pnpm verify` included for T2/T3 or hotspot changes
- [ ] Manual journey QA evidence attached when required by tier

## Security and privacy evidence (required for auth/payment/media/admin sensitive paths)

- [ ] Consent behavior verified where analytics changes exist
- [ ] Secret/config changes listed and reviewed
- [ ] No sensitive data added to logs/events

## Release readiness (required for T2/T3)

- [ ] Rollback owner identified
- [ ] Rollback steps documented
- [ ] Monitoring/alert checks listed
- [ ] Residual risks documented with owner + expiry

## Linked runbooks and references

- Runbook(s):
- Incident or risk ticket(s):
- KPI impact expected:
