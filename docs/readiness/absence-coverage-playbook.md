# Absence Coverage Playbook

Use this playbook for planned leave or unplanned absence of readiness-critical owners.

## Trigger conditions

- Owner unavailable for > 1 business day during active readiness cycle.
- Critical gate owner unavailable during scheduled checkpoint.

## Coverage steps

1. Assign backup owner from `role-directory.md`.
2. Complete `handover-continuity-template.md`.
3. Update `owner-action-register.md` ownership fields.
4. Log change in `30-day-master.md` decision log.
5. Notify affected teams in standard comms channel.

## Escalation policy

- If no backup is available within 4 hours for critical ownership:
  - escalate to program manager and engineering lead.
- If gap affects security or incident command responsibilities:
  - escalate immediately to security/ops leads.

## Return-to-owner checklist

- [ ] Review work completed during absence.
- [ ] Confirm open commitments and due dates.
- [ ] Reassign ownership if needed.
- [ ] Log handback decision and timestamp.
