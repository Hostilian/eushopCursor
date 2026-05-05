# Readiness Test Matrix And Incident Severity Guide

## Test layers

| Layer | Frequency | Scope | Exit criteria |
| --- | --- | --- | --- |
| Smoke | On each meaningful PR | Build, auth, key route load, API health | All smoke checks pass |
| Critical path regression | Weekly | Discovery, reservation lifecycle, chat, media/picker | No unresolved P0/P1 blockers |
| Release candidate | Week 4 and before go/no-go | Full verify + manual web/mobile walkthrough | Full pass or approved mitigation |

## Minimum command set

- `pnpm claims:check`
- `pnpm i18n:check`
- `pnpm verify`

## Manual critical-path script

1. Web: discovery -> open detail -> initiate contact.
2. Web: trip offer -> reserve -> confirm/complete/cancel path checks.
3. Mobile: repeat discovery and reservation critical path.
4. Web/mobile: product picker attaches picture URL (real or fallback).
5. Chat: send/receive between two users, reconnect, verify continuity.

## Incident severity policy

| Severity | Definition | Examples | SLA target |
| --- | --- | --- | --- |
| P0 | Core user flow unavailable or unsafe | Login outage, data-loss risk, reservation impossible | Engage immediately, contain within 1 hour |
| P1 | Major degradation with workaround | Search failing for subset, chat delayed | Triage same day, fix within next working day |
| P2 | Non-blocking defect or quality issue | Minor visual drift, non-critical copy issue | Batch into planned sprint |

## Response ownership

- Incident commander: QA/SRE lead.
- Technical owner: Engineering lead or delegated lane owner.
- Communications owner: Operations or GTM lead for external updates.

## Rehearsal protocol (Week 4)

- Dry run release candidate from clean branch state.
- Execute automated checks and manual script.
- Time-box incident drill simulations:
  - auth outage,
  - payment/connect issue,
  - media degradation,
  - data correctness anomaly.
- Record outcomes in `docs/readiness/rehearsal-report.md` and `docs/readiness/incident-drill-report.md`.
