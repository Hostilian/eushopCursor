# Tiered Gate Matrix (CI, Release, Security)

This matrix defines mandatory checks by risk tier and maps hotspot-sensitive work to stricter controls.

## Risk tiers

| Tier | Change profile | Examples |
| --- | --- | --- |
| T0 Low | Documentation or non-runtime refactors | Docs updates, comment cleanup, non-executed config notes |
| T1 Standard | Typical feature/fix in a single lane, no hotspot files | UI fixes, API handler changes outside hotspots |
| T2 High | Changes touching hotspot files, auth/payments/media, or multi-lane runtime contracts | `H1`-`H6`, auth/session logic, webhook/payment flow |
| T3 Critical | Production release candidate or security-sensitive changes with user-impact blast radius | Release trains, secret/auth model changes, schema migrations on critical paths |

## Mandatory checks by tier

| Check | T0 | T1 | T2 | T3 |
| --- | --- | --- | --- | --- |
| `pnpm claims:check` | required | required | required | required |
| `pnpm i18n:check` | optional | required (if i18n touched) | required | required |
| Typecheck + lint | optional | required | required | required |
| Unit tests | optional | required | required | required |
| `pnpm pictures:check` | if picture paths touched | if picture paths touched | required when picture-related | required when picture-related |
| `pnpm verify` | optional | recommended before merge | required before merge | required before merge and before release |
| Manual critical journey QA | no | selective | required for touched journeys | required full set |
| Security evidence checklist | no | conditional | required for auth/payment/media/admin | required |
| Rollback plan attached | no | recommended | required | required and validated by owner |
| Go/no-go sign-off | no | no | conditional | required |

## Hotspot mapping

| Hotspot | Risk tier floor | Additional control |
| --- | --- | --- |
| H1-router | T2 | Append-only registration; one concern per PR |
| H2-context | T2 | Single structural change; explicit contract check |
| H3-schema | T3 | Migration plan + rollback or forward-fix note |
| H4-i18n | T2 | Namespace isolation + parity check |
| H5-shell | T2 | UI shell smoke checks for loading/error behavior |
| H6-deps | T3 | Lane O only, serialized lockfile/dependency updates |

## Release gates

1. **Code gate (pre-merge):** checks pass for applicable tier.
2. **Operational gate (pre-release):** rollback owner, runbook link, and monitoring checks confirmed.
3. **Security gate (pre-release):** no active unaccepted critical controls on touched surfaces.
4. **Readiness gate (weekly/RC):** scorecard reviewed and incident risk accepted or mitigated.

## Gate ownership

| Gate | Owner | Backup |
| --- | --- | --- |
| Code gate | Engineering lead | Lane owner |
| Operational gate | Ops lead | QA/SRE lead |
| Security gate | Security lead | Engineering lead |
| Readiness gate | Program manager | Product lead |

## Failure handling

- Tier requirement failures block merge/release by default.
- Any exception requires written risk acceptance with owner, expiry date, and mitigation.
- Exceptions are logged in `docs/readiness/go-no-go-decision.md`.
