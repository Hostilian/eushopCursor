## Summary

- What changed:
- Why this change:

## Readiness gates

- Risk tier: `T0` | `T1` | `T2` | `T3`
- Lane: `A` | `B` | `O`
- Hotspot touched: `none` | `H1` | `H2` | `H3` | `H4` | `H5` | `H6`

- [ ] Claim file present and `pnpm claims:check` passed
- [ ] Required CI checks pass for selected tier
- [ ] `pnpm verify` attached for T2/T3 or hotspot changes
- [ ] Security/privacy evidence included when sensitive paths touched
- [ ] Rollback owner/path included for T2/T3

For full gate checklist and evidence format, use:
`/.github/PULL_REQUEST_TEMPLATE/readiness-gate.md`

## Test plan

- Automated:
- Manual:

## Risks / rollback

- Risks:
- Rollback plan:
