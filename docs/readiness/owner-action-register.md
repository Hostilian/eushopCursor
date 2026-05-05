# Owner Action Register

This register tracks concrete owner actions needed to move readiness artifacts from `in_progress` to `done`.

| Action ID | Workstream | Action | Owner role | Due date | Status | Blockers |
| --- | --- | --- | --- | --- | --- | --- |
| OAR-001 | Product | Replace role placeholders with named owners across readiness docs | `pm-duty` | 2026-05-06 | done | None |
| OAR-002 | Engineering | Re-run gate commands on RC branch and attach outputs | `eng-duty` | 2026-05-29 | in_progress | RC branch freeze timing |
| OAR-003 | QA/SRE | Execute critical journey walkthroughs and attach outcomes | `qa-duty` | 2026-05-08 | in_progress | Device/test account availability |
| OAR-004 | QA/SRE + Ops | Complete four drill scenarios and score dimensions | `qa-duty` + `ops-duty` | 2026-05-10 | in_progress | Incident room schedule |
| OAR-005 | Security | Finalize security/privacy sign-off with evidence pack | `sec-duty` | 2026-05-30 | in_progress | Consent evidence attachment |
| OAR-006 | Data | Publish week-4 KPI snapshot and event quality summary | `data-duty` | 2026-05-31 | in_progress | Analytics extraction |
| OAR-007 | GTM/CS | Confirm launch narrative caveats and support SLA readiness | `gtm-duty` | 2026-05-31 | in_progress | Final legal copy confirmation |
| OAR-008 | Ops | Validate rollback command path and recovery smoke results | `ops-duty` | 2026-06-01 | in_progress | Staging release window |

## Status definitions

- `in_progress`: started with active owner work.
- `blocked`: cannot proceed until blocker is resolved.
- `done`: completed with evidence linked.
