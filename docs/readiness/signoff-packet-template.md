# Readiness Sign-Off Packet Template

Use this packet before the final go/no-go meeting.

## Release candidate context

- Environment:
- RC version:
- Build date:
- Change summary:

## Required evidence checklist

- [ ] `pnpm readiness:verify` output attached (preferred single-command evidence).
- [ ] `pnpm claims:check` output attached (RC branch).
- [ ] `pnpm i18n:check` output attached (RC branch).
- [ ] `pnpm verify` output attached (RC branch).
- [ ] Rehearsal report done.
- [ ] Incident drill report done.
- [ ] Security/privacy checklist signed.
- [ ] KPI scorecard week snapshot attached.
- [ ] Risk register updated within 24h of sign-off.

## Risk acceptance section

| Risk ID | Severity | Why accepted | Mitigation owner | Expiry |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Owner signatures

- Product:
- Engineering:
- QA/SRE:
- Security:
- Ops:
- Data/GTM:

## Final recommendation

- Recommendation: `GO` / `HOLD`
- Conditions (if any):
- Follow-up review date:

If verification fails:

1. Run `pnpm readiness:status:check` and fix vocabulary violations.
2. Run `pnpm claims:check` and resolve claim overlap/hotspot conflicts.
3. Run `pnpm verify`, then update this packet and `go-no-go-decision.md` with outcomes.
