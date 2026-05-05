# Readiness Failure Modes And Anti-Patterns

Use this guide to prevent predictable late-stage readiness failures.

## Common anti-patterns

1. **Status without evidence**
   - Symptom: “green” reported but no linked proof.
   - Impact: false confidence, late surprises.
   - Prevention: require evidence links in every weekly review.

2. **Gate scope drift**
   - Symptom: checks differ week to week without decision log.
   - Impact: inconsistent release quality bar.
   - Prevention: lock gate checklist; log every exception.

3. **Owner ambiguity**
   - Symptom: role named but no person assigned.
   - Impact: slow response and unresolved blockers.
   - Prevention: keep `role-directory.md` current and referenced.

4. **Last-minute command reruns only**
   - Symptom: core checks run only at release edge.
   - Impact: compressed fix window.
   - Prevention: weekly command evidence with trend tracking.

5. **Unbounded risk acceptance**
   - Symptom: exceptions without expiry date.
   - Impact: temporary risks become permanent.
   - Prevention: enforce owner + expiry + mitigation for all exceptions.

6. **Incident drills treated as optional**
   - Symptom: drill skipped due to time pressure.
   - Impact: weak containment during real incident.
   - Prevention: treat drill completion as gate requirement.

## Failure modes by gate

| Gate | Failure mode | Early warning | Preventive control |
| --- | --- | --- | --- |
| Code gate | Hidden quality regressions | Increased flaky checks, ad-hoc skips | Standard command runbook and weekly trend review |
| Operational gate | Rollback path unverified | Runbook exists but no recovery smoke evidence | Require rollback smoke evidence before RC promotion |
| Security gate | Late compliance blocker | Missing consent proof or unresolved critical control | Weekly security evidence collection and sign-off rehearsal |
| Readiness gate | Decision paralysis | Conflicting statuses across docs | Single source updates via cockpit + weekly review record |

## Prevention checklist

- [ ] Every status update includes linked evidence.
- [ ] Every active blocker has owner and due date.
- [ ] Every exception has expiry and mitigation.
- [ ] Weekly review artifacts are done within 24h.
- [ ] RC runbook commands are executed on RC branch.
- [ ] Drill evidence is done before go/no-go meeting.
