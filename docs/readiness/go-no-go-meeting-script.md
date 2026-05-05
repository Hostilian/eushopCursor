# Go/No-Go Meeting Script (30 Minutes)

## Purpose

Run a fast, evidence-based go/no-go decision meeting with clear ownership and outcomes.

## Participants

- Chair: Engineering lead
- Required: Product, QA/SRE, Security, Ops
- Optional: Data, GTM, CS

## Agenda (30 minutes)

1. **00:00-03:00** - Meeting framing and decision rule recap.
2. **03:00-10:00** - Gate evidence review (code, operational, security, readiness).
3. **10:00-16:00** - KPI snapshot and trend exceptions.
4. **16:00-22:00** - Open risks, accepted exceptions, and expiry checks.
5. **22:00-27:00** - Owner sign-offs and objections.
6. **27:00-30:00** - Final decision (`GO`/`HOLD`), conditions, and next checkpoint.

## Chair script

- "We decide based on evidence in `go-no-go-decision.md`, not assumptions."
- "Any unresolved P0 or unsigned critical security control defaults to HOLD."
- "All exceptions must have owner, expiry, and mitigation."
- "We end with a single decision statement and explicit follow-up actions."

## Required artifacts on screen

- `docs/readiness/go-no-go-decision.md`
- `docs/readiness/signoff-packet-template.md` (or done packet)
- `docs/readiness/rehearsal-report.md`
- `docs/readiness/incident-drill-report.md`
- `docs/readiness/readiness-scorecard.md`
- `docs/readiness/risk-register.md`

## Output checklist

- [ ] Decision captured (`GO` or `HOLD`).
- [ ] Conditions documented with due dates.
- [ ] Owner sign-offs recorded.
- [ ] Follow-up review date set.
