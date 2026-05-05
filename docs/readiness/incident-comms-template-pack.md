# Incident Communications Template Pack

Use these templates for fast, consistent communication during readiness incidents.

## 1) Internal alert (engineering + ops)

```md
INCIDENT ALERT

Severity: P0|P1|P2
Start time (UTC):
Affected surfaces:
Current impact:
Incident commander:
Technical owner:
Immediate containment action:
Next update ETA:
```

## 2) Leadership update

```md
Leadership Incident Update

- Severity:
- User impact:
- Scope:
- Current status: Investigating | Contained | Recovering | Resolved
- Risks to release readiness:
- Mitigation owner:
- Next decision checkpoint:
```

## 3) Customer-facing status note

```md
We are currently investigating an issue affecting [surface/feature].
Some users may experience [impact].
Our team is actively working on mitigation.
Next update by [time + timezone].
```

## 4) Resolution summary

```md
Incident Resolved

- Severity:
- Root cause summary:
- Time to detect:
- Time to contain:
- Time to recover:
- Follow-up actions:
- Owner(s):
- Follow-up due date:
```

## Usage rules

- Keep timestamps in UTC.
- Do not include secrets or sensitive user data.
- Every major update must have the next update ETA.
