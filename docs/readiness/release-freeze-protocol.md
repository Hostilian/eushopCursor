# Release Freeze Protocol

Use this protocol to control changes near major readiness gates and go/no-go.

## Freeze levels

| Level | Trigger | Allowed changes |
| --- | --- | --- |
| F1 Soft freeze | 7 days before go/no-go | Critical fixes + approved low-risk changes |
| F2 Hard freeze | 72 hours before go/no-go | Critical blockers only |
| F3 Emergency-only | 24 hours before go/no-go | P0/P1 containment and hotfixes only |

## Entry criteria

- Freeze level announced in weekly review.
- Ownership and approver chain confirmed.
- Exception handling path confirmed.

## Exception process

1. Submit exception with impact summary and rollback plan.
2. Obtain engineering lead + ops lead approval.
3. Record decision in `go-no-go-decision.md`.
4. Add evidence to `evidence-log.md`.

## Exit criteria

- Gate decision complete.
- Required freeze-period evidence captured.
- Remaining exceptions either closed or carried with expiry.
