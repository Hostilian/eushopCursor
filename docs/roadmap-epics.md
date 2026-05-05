# Roadmap epics (from marketing roadmap)

Source: [`apps/web/src/app/(marketing)/roadmap/page.tsx`](../../apps/web/src/app/(marketing)/roadmap/page.tsx). Use these as planning buckets; ship order may change.

## Q1 2026 — Trip and luggage capacity

- **Corridor tooling**: richer route/geo (autocomplete, legs), trip legs model, density in feed.
- **Trip UX**: publish flows, slot inventory, reservation polish.
- **Catalog match**: traveller ↔ item/request matching in corridor context.

## Q2 2026 — Trust and density

- **Moderation**: queue SLAs, bulk actions, safety workflows.
- **Handoff**: repeat prompts, corridor playbooks (product + [`docs/ops`](./ops/)).
- **Trust signals**: verified bringer scale-out, reputation precursors.

## Q3 2026 — Payments (where legal)

- **Listings**: optional in-app settlement for finder fees (trips may already be ahead — align messaging).
- **Pricing experiments**: auctions pilot where regulation allows.
- **Mobile**: Connect + pay parity ([mobile-payments-parity.md](./ops/mobile-payments-parity.md)).

## Q4 2026 — Profiles and native polish

- **Reputation**: photo-first profiles, exchange history, badges.
- **Offline / maps**: cell maps, richer item graph.
- **Retailer / exports**: opt-in where product fits.

---

Stretch engineering items (PWA, catalog metrics API, dependabot policy, public API ADR) stay in [cursor-parallel-backlog.md](cursor-parallel-backlog.md) **Stretch** until slotted.
