# Security, Secrets, And Privacy Readiness Checklist

## Objective

Provide a repeatable pass/fail checklist for launch-critical security and privacy controls.

## A. Secrets and environment hygiene

- [ ] No secrets committed in git-tracked files.
- [ ] Deploy environments set all required variables from `.env.example`.
- [ ] `BETTER_AUTH_SECRET` and other auth keys are unique per environment.
- [ ] Rotation owner exists for each critical secret.
- [ ] Incident contacts for secret leakage are documented.

## B. Authentication and authorization

- [ ] Sign-in and callback URLs match target environment.
- [ ] Protected routes return consistent unauthorized behavior.
- [ ] Role/permission checks enforced on admin and moderation actions.
- [ ] Session invalidation works after logout and account deletion.

## C. Privacy and GDPR-critical controls

- [ ] Consent default for analytics is off unless explicitly accepted.
- [ ] Reject-all path is present where required.
- [ ] Data export flow is accessible and operational.
- [ ] Account deletion flow removes user-scoped data as documented.
- [ ] Location privacy constraints (coarse cell + jitter) remain active.

## D. Data protection controls

- [ ] PII and sensitive operational logs are minimized.
- [ ] Third-party endpoints are limited to approved providers.
- [ ] Remote media ingestion is server-side validated/re-hosted when required.
- [ ] DB backups and restore path are documented and tested.

## E. Verification evidence required

- [ ] `pnpm claims:check` output attached for release PR.
- [ ] `pnpm verify` output attached for release candidate.
- [ ] Consent before/after evidence captured for analytics bootstrap.
- [ ] Security/privacy reviewer sign-off recorded in go/no-go decision.

## F. Launch blockers

Any unchecked item in sections A-C is a blocker for go/no-go unless waived by security lead with dated risk acceptance.
