# Readiness FAQ And Troubleshooting

## FAQ

### 1) Where do I start each day?

Start with:

- `operator-cockpit.md`
- `owner-action-register.md`
- `risk-register.md`

### 2) Where do I record evidence?

Add dated entries to `evidence-log.md` and link them from weekly review docs.

### 3) Where are decisions logged?

Program-level decisions go in `30-day-master.md`; final release decisions go in `go-no-go-decision.md`.

### 4) What blocks a `GO` decision?

- Open unresolved P0
- Unsiged critical security controls
- Missing required gate evidence

See `go-no-go-decision-tree.md` and `minimum-viable-go-packet.md`.

### 5) How do I handle exceptions?

Every exception must include owner, expiry, mitigation, and approver. Track in `go-conditions-liability-register.md`.

## Troubleshooting common blockers

### A) `claims:check` fails

1. Check overlapping `touches` in active claim files.
2. Adjust scope or sequence work.
3. Re-run `pnpm claims:check`.

### B) KPI status is unclear

1. Open `kpi-data-collection-playbook.md`.
2. Verify source and measurement window.
3. Update `readiness-scorecard.md` and `evidence-log.md`.

### C) Weekly review has missing inputs

1. Run `weekly-evidence-checklist.md`.
2. Assign missing evidence owners in `owner-action-register.md`.
3. Set due dates before ending meeting.

### D) Go/no-go meeting is stuck

1. Use `go-no-go-meeting-script.md`.
2. Score packet using `go-packet-completeness-score.md`.
3. If below threshold, set explicit HOLD actions and checkpoint date.

### E) Incident response confusion

1. Classify using `post-launch-incident-matrix.md`.
2. Follow `oncall-run-card.md`.
3. Use templates in `incident-comms-template-pack.md`.
