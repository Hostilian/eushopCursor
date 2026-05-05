# Readiness Status Vocabulary

Use these status values consistently across all readiness artifacts.

## Canonical values

- `done`: completed with evidence linked.
- `in_progress`: actively being worked with owner assigned.
- `ready`: execution packet finalized and pre-assigned, awaiting scheduled run.
- `blocked`: cannot continue until blocker is resolved.

## Mapping from legacy wording

| Legacy term | Use instead |
| --- | --- |
| `complete` / `completed` | `done` |
| `open` / `pending` / `scheduled` | `in_progress` or `ready` depending on execution state |
| `integrated` | `done` (if evidence linked) or `in_progress` (if still evolving) |

## Rule of use

- Pick one status per row/item from the canonical set.
- If status is `blocked`, include blocker and due date.
- If status is `ready`, include planned execution date.
