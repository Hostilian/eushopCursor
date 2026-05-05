# Readiness Command Matrix

Use this matrix to choose the right command for each readiness context.

| Command | Primary use | Typical timing | Includes |
| --- | --- | --- | --- |
| `pnpm readiness:doctor` | Quick readiness diagnostics snapshot | Daily kickoff and handoffs | Status counts + top in_progress/blocked actions |
| `pnpm readiness:doctor:write` | Persist diagnostics snapshot to file | Before weekly review and handoff updates | Doctor output + writes `doctor-latest.md` |
| `pnpm readiness:doctor:fresh` | Enforce snapshot freshness | Before weekly review and go/no-go prep | Fails if `doctor-latest.md` is stale |
| `pnpm readiness:index:check` | Validate readiness index references | Before doc-heavy merges | Index integrity only |
| `pnpm readiness:status:check` | Enforce status vocabulary | Before/after readiness doc edits | Vocabulary guardrail only |
| `pnpm readiness:triage` | Fast failure isolation and repair | When readiness checks fail | Status check + claims check + verify |
| `pnpm readiness:verify` | Full readiness validation | RC windows and weekly gates | Index check + status check + claims + i18n + pictures + verify |
| `pnpm readiness:rc` | Alias for RC execution | RC rehearsal and go/no-go prep | Same as `readiness:verify` |
| `pnpm claims:check` | Claim overlap/hotspot validation | Any non-trivial edit | Claims rules only |
| `pnpm verify` | Full engineering quality bar | Weekly gate and pre-merge | Format/type/lint/tests/claims/build |

## Recommended run order

1. Normal path: `pnpm readiness:verify`
0. Optional preflight: `pnpm readiness:doctor`
2. If failing: `pnpm readiness:triage`
3. Document outcomes in `docs/readiness/evidence-log.md`
