# Week 4 Dress Rehearsal Report

## Objective

Validate release candidate quality and operational readiness before go/no-go.

## Rehearsal scope

- Release candidate build and startup for web, API, admin, and mobile checks.
- Full gate commands (`claims:check`, `i18n:check`, `verify`).
- Manual critical-path walkthroughs across web and mobile.

## Execution log template

| Date | Env | RC version | Facilitator | Outcome |
| --- | --- | --- | --- | --- |
| YYYY-MM-DD | staging | vX.Y.Z-rcN | _Name_ | pass/fail |

## Automated check evidence

| Check | Status | Evidence link | Notes |
| --- | --- | --- | --- |
| `pnpm claims:check` | pending | _link_ |  |
| `pnpm i18n:check` | pending | _link_ |  |
| `pnpm verify` | pending | _link_ |  |

## Manual journey evidence

| Journey | Web | Mobile | Status | Notes |
| --- | --- | --- | --- | --- |
| Discovery to engagement | pending | pending | pending |  |
| Trip reservation lifecycle | pending | pending | pending |  |
| Chat/trust interaction | pending | pending | pending |  |
| Product picker picture attachment | pending | pending | pending |  |

## Defect summary

| ID | Severity | Area | Owner | ETA | Status |
| --- | --- | --- | --- | --- | --- |
| _Fill in_ |  |  |  |  |  |

## Exit recommendation

- Recommend **pass** when no open P0 and all P1 have accepted mitigation and dated owner.
- Recommend **hold** when any critical-path journey fails without containment.
