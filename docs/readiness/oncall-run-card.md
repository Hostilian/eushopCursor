# On-Call Run Card (Readiness To Post-Launch)

Quick action card for first responders.

## 1) First 15 minutes

1. Acknowledge incident and set provisional severity.
2. Identify affected surfaces and user impact.
3. Assign incident commander and technical owner.
4. Start internal comms using `incident-comms-template-pack.md`.

## 2) First 30 minutes

1. Run initial containment action.
2. Confirm rollback decision criteria.
3. Post first status update with next ETA.
4. Record incident timeline start in incident log.

## 3) First 60 minutes

1. Decide continue-mitigate vs rollback.
2. If rollback, execute runbook and validate smoke checks.
3. Re-score severity if impact changes.
4. Update leadership and owners.

## Command quick checks

- `pnpm readiness:verify` (preferred readiness-wide validation)
- `pnpm claims:check` (if active hotfix edits)
- Service-specific health checks from `ops-runbook-index.md`
- Critical-journey smoke checks from `test-matrix.md`

If verification fails:

1. Run `pnpm readiness:status:check` and resolve vocabulary drift.
2. Run `pnpm claims:check` and resolve claim conflicts before hotfix merge.
3. Run `pnpm verify` and log outcomes in `docs/readiness/evidence-log.md`.

## Must-record fields

- Detection time
- Containment time
- Recovery time
- Root cause hypothesis
- Owner and follow-up due date
