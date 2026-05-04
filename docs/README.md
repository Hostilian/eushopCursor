# Documentation

| Path | What it is |
|------|------------|
| **[ENVIRONMENT.md](ENVIRONMENT.md)** | Short pointer to the full env matrix (`docs/ops/environment.md`) |
| **[cursor-parallel-backlog.md](cursor-parallel-backlog.md)** | Merge-safe task queue for Cursor agents (lanes, hotspots, claim template) |
| **[ops/](ops/)** | Production: env matrix, deploy runbook, Stripe Connect, KYC badge, observability |
| [pre-2008-sources.md](pre-2008-sources.md) | Historic EU mobility citations (editorial / deck bibliography) |
| [copy-inventory.md](copy-inventory.md) | Copy source map (marketing vs product strings) |
| [voice-glossary.md](voice-glossary.md) | Tone and terminology |
| [i18n-english-surfaces.md](i18n-english-surfaces.md) | Deliberately English-only UI surfaces |
| [eslint-next-migration.md](eslint-next-migration.md) | Plan to move off `next lint` |

### Apps (short pointers)

| App | README |
|-----|--------|
| Web | [apps/web/README.md](../apps/web/README.md) |
| API | [apps/api/README.md](../apps/api/README.md) |
| Admin | [apps/admin/README.md](../apps/admin/README.md) |
| Mobile | [apps/mobile/README.md](../apps/mobile/README.md) |
| PartyKit | [apps/party/README.md](../apps/party/README.md) |

Dependency updates: [`.github/dependabot.yml`](../.github/dependabot.yml) (weekly npm/pnpm, grouped PRs).

Branch protection (GitHub settings): [github-branch-protection.md](github-branch-protection.md).

### Operations quick links

- [Zero-cost / SaaS inventory](ops/zero-cost-stack.md) — optional vs vendor integrations; honest limits
- [Environment variables](ops/environment.md) — full matrix from `.env.example`
- [Deploy runbook](ops/deploy-runbook.md) — migrate, search index, smoke checks
- **Payments**: [Stripe Connect](ops/stripe-connect.md) (API + webhooks), [E2E / reconciliation matrix](ops/stripe-e2e-matrix.md), [reconciliation repair](ops/stripe-reconciliation-repair.md), [mobile parity](ops/mobile-payments-parity.md)
- [Legal launch checklist](ops/legal-launch-checklist.md) — imprint, Terms/Privacy for payments + KYC
- [Investor access tokens](ops/investor-access.md) — `INVESTOR_ACCESS_TOKENS` rotation
- [Verified bringer / KYC](ops/verified-bringer-kyc.md)
- [Observability](ops/observability.md) — Sentry, PostHog, runbooks
- [Roadmap epics](roadmap-epics.md) — Q1–Q4 planning buckets
- [Corridor playbooks](ops/corridor-playbooks.md) — ops stub for GTM
- [Build vs runtime](ops/build-runtime.md) — Meili/Redis and `pnpm build`
