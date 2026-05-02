# Corridor playbooks (stub)

Operational and community playbooks for **dense EU diaspora corridors** (seed → trust density → repeat handoffs). Align product work with [roadmap epics](../roadmap-epics.md) and the marketing roadmap route group under `apps/web/src/app/(marketing)/roadmap/page.tsx`.

## Corridor selection

- Prefer **bidirectional flow** (A↔B) with visible chat volume and repeat handoffs in a pilot window.
- Score corridors by: diaspora size (public stats only), language overlap, existing community admins you can name, and **legal clarity** for peer handoffs in both jurisdictions.
- Avoid corridors where in-app payments are ambiguous until counsel signs off; run **off-platform settlement** playbooks first.

## Ambassador norms

- Ambassadors **do not** handle money or goods; they model the handoff protocol and escalate to moderation (see Terms and `/safety`).
- Publish a short “what we do / don’t do” snippet aligned with [legal-launch-checklist.md](./legal-launch-checklist.md).
- Single escalation path: in-app report → admin **Audit** / listings queue.

## Seeding

- **Trips:** seed real routes with accurate departure windows; never synthetic “ghost” capacity on production hosts used for `/traction`.
- **Listings:** neighbour-sized portions; photos either user-owned or attributed (e.g. Open Food Facts).
- **Catalog:** ensure country and category coverage matches the corridor’s ask patterns before opening `/discover` PR.

## Trust density

- Roll out **verified bringer** only with KYC vendor live and Privacy updated ([verified-bringer-kyc.md](./verified-bringer-kyc.md)).
- Handoff prompts: web [`handoff-protocol`](../../apps/web/src/app/(marketing)/safety/handoff-protocol/page.tsx) + trip detail copy; mobile `safety/handoff-protocol`.
- Repeat prompts on second+ handoff between the same pair when product ships that nudge.

## Metrics and honesty

- **Public:** `/traction` uses database counts only; never blend `ENABLE_DEMO_MODE` showcase numbers into KPI strips.
- **Internal:** track time-to-first-handoff, repeat rate, and Stripe reconciliation lag (`/payments` admin, [stripe-reconciliation-repair.md](./stripe-reconciliation-repair.md)).

## Launch week checklist (per corridor)

1. Imprint and Terms reviewed for target countries.
2. Moderation staffing and SLA written down (even if “best effort”).
3. Status page or operator chat for outages ([observability.md](./observability.md)).
4. Post-deploy smoke from [deploy-runbook.md](./deploy-runbook.md) on staging, then prod.

Add runbooks here as you run real corridors; keep PII out of this repo.
