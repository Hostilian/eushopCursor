# Vocabulary Lock Report

Date: 2026-05-05
Scope: `docs/readiness`

## Objective

Confirm readiness docs use canonical status vocabulary from `status-vocabulary.md`: `done`, `in_progress`, `ready`, `blocked`.

## Sweep outcome

- Canonical status terms are now used across operational trackers and gate artifacts.
- Remaining matches for words like `open`, `complete`, or `scheduled` are either:
  - non-status domain language (for example, "open detail", "Open asks"), or
  - intentionally present in `status-vocabulary.md` mapping examples.

## Tracker files normalized

- `artifact-status-board.md`
- `owner-action-register.md`
- `go-no-go-decision.md`
- `weekly-review-2026-W19.md`
- `weekly-review-2026-W20.md`
- `weekly-review-2026-W21.md`
- `weekly-review-2026-W22.md`
- `minimum-viable-go-packet.md`
- `rehearsal-report.md`
- `incident-drill-report.md`
- `day30-exec-summary.md`
- `execution-checklist.md`

## Non-status exceptions retained

- Product/domain wording in journey docs (e.g., "open detail", "open asks").
- Mapping/reference language in `status-vocabulary.md`.

## Lock policy

- New readiness docs should use canonical statuses only.
- Any legacy status wording introduced in tracker tables should be corrected in the same change.
