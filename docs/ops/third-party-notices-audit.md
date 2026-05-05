# Third-party notices audit

Date: 2026-05-05
Owner: EUSHOP-O-010

## Scope

- Packaging and distribution posture for `apps/web`, `apps/mobile`, and backend services.
- Current repository artifacts and documented release paths.

## Current assessment

- No repository-owned binary distribution pipeline is documented for customer-delivered binaries.
- Main ship mode is service deployment (web/API/worker) plus app-store delivery for mobile.
- Existing package licenses are managed through upstream package metadata and lockfile records.

## Outcome

- A dedicated third-party notices bundle is **not currently required** for this repository state.
- Trigger conditions for a follow-up legal pass:
  - shipping a downloadable desktop/client binary from this repo,
  - bundling offline redistributable assets with third-party license obligations,
  - introducing vendor SDK terms that require end-user notice text.

## Next action when trigger occurs

1. Generate dependency license inventory per shipped artifact.
2. Add a user-facing notices document in the delivery artifact.
3. Link the notices path from legal/release checklists.
