# Readiness Role Directory

Use this file as the single source of truth for role-to-person mapping.

## Core ownership map

| Role key | Role label | Primary owner | Backup owner | Contact channel |
| --- | --- | --- | --- | --- |
| program_manager | Program manager | `pm-duty` | `eng-duty` | readiness-channel |
| product_lead | Product lead | `pm-duty` | `gtm-duty` | readiness-channel |
| engineering_lead | Engineering lead | `eng-duty` | `ops-duty` | readiness-channel |
| qa_sre_lead | QA/SRE lead | `qa-duty` | `eng-duty` | readiness-channel |
| security_lead | Security lead | `sec-duty` | `eng-duty` | readiness-channel |
| ops_lead | Operations lead | `ops-duty` | `eng-duty` | readiness-channel |
| data_lead | Data lead | `data-duty` | `pm-duty` | readiness-channel |
| gtm_lead | GTM lead | `gtm-duty` | `pm-duty` | readiness-channel |
| cs_lead | Customer success lead | `gtm-duty` | `pm-duty` | readiness-channel |

## Update rules

- Update this file first when ownership changes.
- Reference role keys in meeting notes and action logs when possible.
- Keep backups populated for all critical roles.
- Replace alias owners with named people when team returns from away window.
