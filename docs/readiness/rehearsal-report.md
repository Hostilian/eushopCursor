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
| 2026-05-05 | local/repo gate baseline | pre-rc | Engineering lead | partial pass (automation baseline complete) |
| 2026-05-29 | staging | v0.1.0-rc1 | QA/SRE lead | ready |
| 2026-06-02 | staging | v0.1.0-rc2 | Engineering lead | ready |

## Automated check evidence

| Check | Status | Evidence link | Notes |
| --- | --- | --- | --- |
| `pnpm claims:check` | passed (2026-05-05) | Local execution in this readiness session | Must re-run on RC branch before promotion |
| `pnpm i18n:check` | passed (2026-05-05) | Local execution in this readiness session | Re-run on RC branch before promotion |
| `pnpm verify` | passed (2026-05-05) | Local execution in this readiness session | Re-run on RC branch before promotion |

## Manual journey evidence

| Journey | Web | Mobile | Status | Notes |
| --- | --- | --- | --- | --- |
| Discovery to engagement | ready | ready | ready | Validate search, open detail, CTA path |
| Trip reservation lifecycle | ready | ready | ready | Validate reserve and status transitions |
| Chat/trust interaction | ready | ready | ready | Validate send/receive and reconnect |
| Product picker picture attachment | ready | ready | ready | Validate real-image and fallback attachment |

## Defect summary

| ID | Severity | Area | Owner | ETA | Status |
| --- | --- | --- | --- | --- | --- |
| RR-001 | P1 | Reservation confirmation UX | Lane A owner | 2026-05-31 | in_progress |
| RR-002 | P1 | Search empty-state copy consistency | Lane A owner | 2026-05-30 | in_progress |

## Exit recommendation

- Recommend **pass** when no active P0 and all P1 have accepted mitigation and dated owner.
- Recommend **hold** when any critical-path journey fails without containment.
