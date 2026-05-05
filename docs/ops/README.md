# Operations (`docs/ops/`)

Single index for production and staging runbooks. **Canonical env matrix:** [environment.md](environment.md). **SaaS / self-host posture:** [zero-cost-stack.md](zero-cost-stack.md).

| Doc | Purpose |
|-----|---------|
| [environment.md](environment.md) | Full variable matrix from `.env.example` |
| [zero-cost-stack.md](zero-cost-stack.md) | Optional vs vendor integrations; honest limits |
| [oss-self-hosted-deploy.md](oss-self-hosted-deploy.md) | Coolify-first real stack |
| [free-preview-deploy.md](free-preview-deploy.md) | Short redirect to OSS deploy |
| [hosting-alternatives.md](hosting-alternatives.md) | Coolify vs “no VPS” managed options |
| [local-demo-custom-domain.md](local-demo-custom-domain.md) | Named Cloudflare Tunnel + your domain for short demo URLs |
| [third-party-notices-audit.md](third-party-notices-audit.md) | License/notices shipping trigger audit |
| `scripts/demo-up.ps1` + `demo-status.ps1` + `demo-down.ps1` | Quick tunnel lifecycle for local public demos |
| [deploy-runbook.md](deploy-runbook.md) | Migrate, search index, smoke checks |
| [hosting-contract.md](hosting-contract.md) | Build/start contract for any host |
| [build-runtime.md](build-runtime.md) | Meili/Redis and `pnpm build` |
| [stripe-connect.md](stripe-connect.md) | Connect, webhooks |
| [stripe-e2e-matrix.md](stripe-e2e-matrix.md) | E2E / reconciliation matrix |
| [stripe-reconciliation-repair.md](stripe-reconciliation-repair.md) | Reconciliation repair |
| [trip-reservations-index-review.md](trip-reservations-index-review.md) | `trip_reservations` hot-path index assessment + migration guidance |
| [mobile-payments-parity.md](mobile-payments-parity.md) | Mobile payments |
| [mobile-store-release.md](mobile-store-release.md) | Store release |
| [terms-privacy-payments-review.md](terms-privacy-payments-review.md) | Legal copy review |
| [legal-launch-checklist.md](legal-launch-checklist.md) | Imprint, Terms, KYC |
| [investor-access.md](investor-access.md) | `INVESTOR_ACCESS_TOKENS` |
| [verified-bringer-kyc.md](verified-bringer-kyc.md) | KYC / badge |
| [observability.md](observability.md) | Sentry, PostHog |
| [corridor-playbooks.md](corridor-playbooks.md) | GTM stub |

**Trust / abuse:** Reports via `trust.report`; moderation queue + audit log in admin apps. See [observability.md](observability.md) § Abuse reports.

Operational QA playbook for merge safety and picture-flow readiness: [../human-alignment-checklist.md](../human-alignment-checklist.md) (see sections **10+** for product pictures assurance).

Quick command for picture-flow smoke checks: `pnpm pictures:check`.
