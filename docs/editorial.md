# Editorial hub (copy, voice, i18n policy)

Single place for **where copy lives**, **how we speak**, and **what stays English on purpose**.

---

## 1. Copy inventory (user-facing surfaces)

| Surface | Location | Claim type | Notes |
|--------|----------|--------------|-------|
| i18n | `packages/i18n/src/messages/*.json` | Product, CTA | Single source for nav, hero, home pillars, mobile onboarding |
| Web marketing | `apps/web/src/app/(marketing)/{manifesto,roadmap,...}/page.tsx` | Editorial, occasional stats | Mostly hardcoded EN; **`/about` uses `about.*` in** `packages/i18n/src/messages/*.json` |
| Web product | `apps/web/src/app/(product)/{discover,listings,trips,...}/**` | Product flows | Route group; URLs unchanged |
| Web content | `apps/web/content/pitch.md` | Investor, stats, projections | Gated deck; separate cited history vs forward-looking |
| Web trips UI | `apps/web/src/components/trips/*.tsx` | Product labels | Trip slot fees vs listing finder fee |
| Mobile | `apps/mobile/app/**/*.tsx` | Product | Trip detail labels |
| Admin | `apps/admin/src/app/**` | Cockpit | Moderation copy; **`/payments`** reservation ledger for Stripe reconciliation |
| Validators | `packages/validators/src/index.ts` | Chat template | User-visible string |
| Root | `README.md`, `package.json` | Product + stack | Opening paragraph; no uncited millions |
| Ops docs | `docs/README.md`, `docs/ops/*` | Runbooks, env, compliance prep | Index at `docs/README.md`; production matrix in `docs/ops/environment.md` |
| Citations | `apps/web/src/app/(marketing)/sources/page.tsx`, `docs/pre-2008-sources.md` | Bibliography | Pre-2008 official sources; Eurostat 2007 ref. via 2008 SiF where noted |
| Home KPI | `apps/web/src/components/marketing/kpi-strip.tsx` | Product counts | Footnote links `/traction` and `/sources` |

---

## 2. Voice glossary (Eushop)

### Canonical voice

- **Tagline:** _Get something from somewhere. Bring something for someone._
- **Triplet (eyebrow / OG / nav cluster):** _Trips. Locals. Asks._
- **Positioning (one sentence):** Eushop is the open peer layer for trips, locals, and open asks — launching in dense EU diaspora corridors, designed to travel anywhere people travel.

### Term table

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

### Product order (README & pitch)

Trip offers → open asks → local listings (unless a page is listing-first by context).

### Banned / tighten

- **"EU-first"** in brand prose. Use it only as an *infrastructure* claim ("Hosted in the EU by default — Hetzner Falkenstein, Cloudflare EU"). Never as a positioning headline.
- **"Suitcase capacity is the new last-mile."** Retired hero motif. Replace with "The last-mile is already going somewhere." or route-first phrasing ("Trips already happening.", "Spare bag space, on routes already happening.").
- **"Diaspora"** outside the whitelist above.
- **"Pantry listings"** in marketing copy. Use "local listings" / "neighbourhood listings". The catalog category named **Pantry staples** in `packages/catalog` is a product taxonomy and stays as-is.
- **"5 km cell"** in headlines, hero, empty states, mobile tabs, casual form copy. Keep on safety/privacy/handoff-protocol/permission/GDPR surfaces only.
- Unsourced "two hundred million", "sixteen million" without definition; "Euromonitor 2024" in historical claims; duplicate opening stats across About vs Manifesto vs README.

### i18n note

The public About page pulls from the `about` namespace in `packages/i18n/src/messages/*.json`. The hero pulls from `tagline` and `hero.*`; the trips index pulls from `trips.*`. When translating, keep trip vs listing vs platform-fee wording — and the canonical triplet — consistent with this table rather than literal English.

### Glossary maintenance (orchestrator)

After each marketing-page i18n migration or fee-model copy change, cross-check this term table against new strings (**EUSHOP-O-003**) and run `pnpm i18n:check`.

---

## 3. i18n: intentionally English-only surfaces

[`packages/i18n`](../packages/i18n/src/messages/) covers marketing shell, nav, KPI strip, mobile strings, and many CTAs.

### Still hardcoded in English (audit snapshot)

Product UX that often stays English until translated:

- ~~Chat input placeholder (`chat-view.tsx`)~~ — uses `chat.placeholder` / `chat.placeholderUnavailable`.
- ~~Mobile chat placeholders (`app/chat/[id].tsx`)~~ — reads `chat.*` from `@eushop/i18n` `en.json` (device locale wiring can map to `loadMessages` later).
- ~~Search bar placeholder (`search-client.tsx`)~~ — uses `search.placeholder` and `search.inputAriaLabel` from i18n.
- ~~`ProductPicker`: **search field** uses `productPicker.searchPlaceholder` (all six locales); other picker/modal strings still English — migrate incrementally.~~ — Web picker + propose modal strings live under `productPicker.*` across **all** locale JSONs synced from `en`. Mobile `ProductPicker` still uses **EN-only** placeholders for the trip flow until wired to `loadMessages` (see backlog **A-007**).
- Trip / listing / request form hints and placeholders (domain-specific examples).
- Admin app (operator console) — typically English-only.

### Policy

Either migrate strings to `packages/i18n` keys for all supported locales, or document in this hub that a surface is **EN-only by choice** to avoid duplicate translation work for internal tools.

### Admin app (`apps/admin`)

The operator console is **English-only by product choice**: moderation, payments reconciliation, and audit copy stay in `apps/admin` source until there is a concrete need for localized operator UIs. Do not block shipping translated consumer surfaces on admin translation.
