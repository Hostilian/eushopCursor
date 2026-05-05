# Hotfix Protocol

Use this protocol for urgent fixes during freeze windows or post-launch incidents.

## Hotfix eligibility

- P0 incidents
- P1 incidents with immediate broad user impact
- Security/privacy defects requiring urgent mitigation

## Hotfix flow

1. Open incident and assign incident commander.
2. Confirm severity and user impact.
3. Prepare minimal safe patch with rollback path.
4. Run required verification:
   - `pnpm claims:check`
   - targeted smoke checks
5. Deploy with heightened monitoring window.
6. Record outcome and follow-up actions.

## Required records

- Incident log entry
- Evidence log update
- Decision update in go/no-go or post-launch artifact
- Follow-up action in lessons/action tracker
