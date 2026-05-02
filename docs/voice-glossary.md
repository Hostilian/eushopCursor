# Voice glossary (Eushop)

## Canonical voice

- **Tagline:** _Get something from somewhere. Bring something for someone._
- **Triplet (eyebrow / OG / nav cluster):** _Trips. Locals. Asks._
- **Positioning (one sentence):** Eushop is the open peer layer for trips, locals, and open asks — launching in dense EU diaspora corridors, designed to travel anywhere people travel.

## Term table

| Term | Use when | Do not use for |
|------|-----------|----------------|
| **Trip offer** | A published route with dates and bag **slots** | A single local listing |
| **Slot / reservation** | Buyer locks capacity on a trip | Listing purchase |
| **Bag slot** | The unit of trip capacity in user-visible copy | "Suitcase slot" (legacy headline motif) |
| **Agreed fee / slot fee** | Money the buyer pays the traveller for a **trip** slot (UI copy) | Avoid "finder's fee" here (schema may still say `agreedFinderFee`) |
| **Finder's fee** | **Local listings** and **open asks** (neighbour-to-neighbour taste-of-home) | Trip slot pricing |
| **Platform fee** | Eushop's cut on a **confirmed** reservation (`min(€1.50, 12% × base)`) | The traveller's payout |
| **Local listing** (synonym: neighbourhood listing) | Surplus food posted near you with pickup | Trip · "Pantry listing" is retired in marketing copy (the catalog category "Pantry staples" stays as taxonomy) |
| **Open ask** | Buyer asks for an item; max finder fee optional | Trip announcement · "Open request" is the legacy form, still acceptable in product UI labels but prefer "open ask" in new prose |
| **Cell / 5 km** | **Privacy proof only** — safety, privacy, handoff-protocol, GDPR copy, location-permission rationale, README GDPR section | Headlines, hero, eyebrows, empty states, casual form copy. Use "near you" / "in your area" / "approximate area" instead. |
| **Corridor** | Route-first discovery between cities | Only "country filter" |
| **Diaspora** | Investor / historical pages only — README mobility section, `apps/web/content/pitch.md`, `(marketing)/about`, `(marketing)/manifesto`, `(marketing)/pitch`, `(marketing)/investors`, `(marketing)/sources` | Product UI, mobile tabs, empty states, hero, generic marketing — use "travellers", "people going your way", or no qualifier |

## Product order (README & pitch)

Trip offers → open asks → local listings (unless a page is listing-first by context).

## Banned / tighten

- **"EU-first"** in brand prose. Use it only as an *infrastructure* claim ("Hosted in the EU by default — Hetzner Falkenstein, Cloudflare EU"). Never as a positioning headline.
- **"Suitcase capacity is the new last-mile."** Retired hero motif. Replace with "The last-mile is already going somewhere." or route-first phrasing ("Trips already happening.", "Spare bag space, on routes already happening.").
- **"Diaspora"** outside the whitelist above.
- **"Pantry listings"** in marketing copy. Use "local listings" / "neighbourhood listings". The catalog category named **Pantry staples** in `packages/catalog-data` is a product taxonomy and stays as-is.
- **"5 km cell"** in headlines, hero, empty states, mobile tabs, casual form copy. Keep on safety/privacy/handoff-protocol/permission/GDPR surfaces only.
- Unsourced "two hundred million", "sixteen million" without definition; "Euromonitor 2024" in historical claims; duplicate opening stats across About vs Manifesto vs README.

## i18n

The public About page pulls from the `about` namespace in `packages/i18n/src/messages/*.json`. The hero pulls from `tagline` and `hero.*`; the trips index pulls from `trips.*`. When translating, keep trip vs listing vs platform-fee wording — and the canonical triplet — consistent with this table rather than literal English.
