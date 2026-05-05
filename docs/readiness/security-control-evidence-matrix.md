# Security Control Evidence Matrix

Map security controls to required evidence and owners.

| Control area | Required evidence | Owner | Evidence cadence |
| --- | --- | --- | --- |
| Authentication integrity | Auth config review + login/session smoke evidence | Security lead | Weekly |
| Authorization enforcement | Admin/moderation access checks + audit trace sample | Engineering + Security | Weekly |
| Secret hygiene | Rotation status, owner mapping, leak checks | Security lead | Weekly |
| Webhook integrity | Signature validation evidence and failure logs review | Engineering lead | Weekly |
| Consent compliance | Before/after consent proof, no pre-consent analytics | Data + Security | Weekly |
| Vulnerability management | Open critical/high report with SLA status | Security lead | Weekly |

## Matrix usage

- Update this matrix during weekly security gate checks.
- Link evidence locations in `evidence-log.md`.
