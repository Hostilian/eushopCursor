# Daily Readiness Status Log Template

Use one entry per day to keep operational history lightweight and auditable.

## Entry

- Date: `YYYY-MM-DD`
- Day in plan: `D__`
- Coordinator: `pm-duty`
- Overall status: `green | yellow | red`

### 1) Completed today

- Example: Baseline gate commands run and evidence attached.

### 2) In-progress at end of day

- Example: RC-week evidence attachment tasks.

### 3) Blockers and risks

| Item | Severity | Owner | Mitigation | Due |
| --- | --- | --- | --- | --- |
| Example risk/blocker | P1 | `eng-duty` | Add mitigation action in owner-action-register | YYYY-MM-DD |

### 4) Evidence added

| Artifact | What was added | Link |
| --- | --- | --- |
| evidence-log | Added daily command result row | `docs/readiness/evidence-log.md` |

### 5) Decisions taken

| Decision | Owner | Expiry/review | Reason |
| --- | --- | --- | --- |
| Keep gate in `in_progress` until evidence closes | `pm-duty` | YYYY-MM-DD | Evidence-first policy |

### 6) Next-day priorities

1. 
2. 
3. 

## Filled example (2026-05-05)

- Date: `2026-05-05`
- Day in plan: `D1`
- Coordinator: `pm-duty`
- Overall status: `yellow`

### 1) Completed today

- Baseline command gates executed and logged.
- Owner alias coverage established for away window.

### 2) In-progress at end of day

- RC-week manual journey and drill evidence collection.
- KPI extraction for Gate 1 review.

### 3) Blockers and risks

| Item | Severity | Owner | Mitigation | Due |
| --- | --- | --- | --- | --- |
| Manual journey evidence not yet attached | P1 | `qa-duty` | Run scripted walkthrough and attach matrix | 2026-05-08 |

### 4) Evidence added

| Artifact | What was added | Link |
| --- | --- | --- |
| evidence-log | Baseline gate evidence rows | `docs/readiness/evidence-log.md` |
| execution-checklist | Day-by-day schedule updates | `docs/readiness/execution-checklist.md` |

### 5) Decisions taken

| Decision | Owner | Expiry/review | Reason |
| --- | --- | --- | --- |
| Keep GO recommendation on hold until RC evidence closes | `pm-duty` | 2026-06-03 | Avoid assumption-based release decision |

### 6) Next-day priorities

1. Update readiness scorecard with weekly KPI extraction status.
2. Confirm owner-action register due dates and alias assignments.
3. Advance rehearsal and drill evidence packets.
