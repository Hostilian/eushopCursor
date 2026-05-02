# Security policy

## Supported versions

Security fixes are applied to the default branch that ships production (`main`). Release tags may follow tagged deploys; use the latest tag for production audits.

## Reporting a vulnerability

Please email **security@eushop.eu** (or your operational security alias once published) with:

- A short description of the issue and affected surface (web, API, mobile, admin).
- Steps to reproduce or proof-of-concept, if safe to share.
- Whether the issue is already exploited or publicly known.

We aim to acknowledge receipt within a few business days and coordinate disclosure and fix timelines with you. Please do not open public issues for undisclosed vulnerabilities.

## Scope (high level)

- **In scope:** This repository’s web app, API server, admin app, mobile client, and documented infrastructure (auth, uploads, payments webhooks, realtime) as deployed per `docs/ops/`.
- **Out of scope:** Third-party services (Stripe, Resend, Cloudflare, etc.) — report those via their respective programs; social engineering against staff; denial-of-service without prior agreement.

## Hardening references

- Environment and secrets: [`docs/ops/environment.md`](docs/ops/environment.md)
- Stripe webhooks and idempotency: [`docs/ops/stripe-connect.md`](docs/ops/stripe-connect.md)
- Deploy and rollback: [`docs/ops/deploy-runbook.md`](docs/ops/deploy-runbook.md)
