# Readiness Archive And Retention Policy

This policy defines what to keep active, what to archive, and when to rotate readiness artifacts.

## Retention tiers

| Tier | Artifact type | Active window | Archive window | Owner |
| --- | --- | --- | --- | --- |
| Tier A | Decision and compliance artifacts | Entire release cycle | 12 months minimum | Program manager |
| Tier B | Weekly operational artifacts | Current + previous 4 weeks | 6 months | Program manager |
| Tier C | Templates and playbooks | Always active | N/A | Domain owners |

## Archive rules

- Keep only current and recent weekly files in active references.
- Move older weekly snapshots to an archive folder after 4 active weeks.
- Never archive away required compliance evidence from the last release.
- Keep a single “latest” pointer in active docs for fast navigation.

## Required preservation set

- `go-no-go-decision.md`
- `minimum-viable-go-packet.md`
- `go-decision-minutes-template.md` (done copy)
- `go-conditions-liability-register.md`
- `day30-exec-summary.md`
- `evidence-log.md`

## Rotation cadence

- Weekly: archive stale weekly review instances beyond 4-week active window.
- Monthly: review and trim duplicated status docs.
- Quarterly: refresh templates and retire unused artifacts.
