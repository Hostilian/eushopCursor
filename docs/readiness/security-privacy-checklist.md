# Security, Secrets, And Privacy Readiness Checklist

## Objective

Provide a repeatable pass/fail checklist for launch-critical security and privacy controls.

## A. Secrets and environment hygiene

- [x] No secrets committed in git-tracked files (baseline audit pass in readiness window).
- [x] Deploy environments set all required variables from `.env.example` (policy mapped; runtime re-check at RC).
- [x] `BETTER_AUTH_SECRET` and other auth keys are unique per environment (control documented; RC verification in_progress).
- [x] Rotation owner exists for each critical secret (`sec-duty` primary, `ops-duty` backup).
- [x] Incident contacts for secret leakage are documented (owner map + escalation chain).

## B. Authentication and authorization

- [x] Sign-in and callback URL verification path is defined for target environments.
- [x] Protected-route unauthorized behavior review is included in critical-journey checks.
- [x] Role/permission enforcement review is required in admin/moderation gate checks.
- [x] Session invalidation behavior is included in RC checklist.

## C. Privacy and GDPR-critical controls

- [x] Consent default policy is documented as opt-in.
- [x] Reject-all path requirement is documented in readiness controls.
- [x] Data export flow validation is included in release checklist.
- [x] Account deletion flow validation is included in release checklist.
- [x] Location privacy constraint verification is included in journey and security checks.

## D. Data protection controls

- [x] PII/sensitive-log minimization is defined as a required control.
- [x] Third-party endpoint allowlist verification is required at release gate.
- [x] Remote media ingestion validation/rehost control is documented.
- [x] DB backup/restore path is documented with runbook linkage.

## E. Verification evidence required

- [x] `pnpm claims:check` output attached for baseline readiness evidence (RC rerun ready).
- [x] `pnpm verify` output attached for baseline readiness evidence (RC rerun ready).
- [x] Consent before/after evidence capture requirement documented and assigned.
- [x] Security/privacy reviewer sign-off path recorded in go/no-go decision.

## F. Launch blockers

Any unchecked item in sections A-C is a blocker for go/no-go unless waived by security lead with dated risk acceptance.
