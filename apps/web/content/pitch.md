# Eushop — Investor pitch

> The last-mile is already going somewhere.

## 0. How to read this deck

- **Historic / cited claims** (e.g. official mobility context) stay tied to primary sources and the public **[/sources](/sources)** page — not mixed with revenue math.
- **Forward-looking or vendor TAM figures** belong in slides labelled *third-party estimate* with publisher and year; refresh team, ask, and projections with **counsel** before wide distribution.

## 1. Problem

Millions of people routinely live, study, or work away from the place they grew up. They want a jar of Krówki, a wheel of Manchego, the salty Sült their grandmother packs every visit — and right now their options are diaspora groups, messaging chains, and pure luck.

The cost is asymmetric: a Polish nurse in Munich pays €19 + shipping for a single tube of Wedel chocolate from a German importer. Her cousin flies Warsaw–Munich next Saturday with three empty kilos in her carry-on.

Eushop is the introduction.

## 2. Insight

The wedge is not the product. The wedge is **route + capacity**.

Every diaspora plane ticket, train ticket, and family-visit-by-car is already paid for. The marginal cost of grabbing a tin of Mieszanka on the way to the airport is zero. The marginal value to a buyer in the destination city is €5–€15.

That gap is our take rate.

## 3. Product

Three primitives, one network:

1. **Trip offers** — a verified diaspora user announces a trip from country A to country B with N spare bag slots. Buyers reserve slots at an **agreed fee per slot**; we collect a small platform fee on each confirmed reservation. *Reservations are the monetisable event.*
2. **Open asks** — a buyer posts what they want; matching trips and listings in the same corridor or radius light it up automatically.
3. **Local listings** — neighbourhood-scale posts with a **finder’s fee** (“half a tin of Krówki, €3, pickup at Goetheplatz”) with privacy-preserving geohash discovery.

Catalog is hybrid: curated taste-of-home foods + Open Food Facts (CC-BY-SA) + UGC proposals voted up by the community. Pickers show three image candidates per product so users see the box they actually have at home.

## 4. Market

- **Historic mobility context (cited, not a TAM):** Large-scale cross-border residence and migration in Europe has been measured for decades in official statistics (see **[/sources](/sources)** on the public site). We do **not** rest a revenue story on a single headline “diaspora millions” number without defining the cohort and matching the source.
- **Forward-looking TAM (illustrative):** Any packaged “ethnic grocery” market size you see in vendor reports is **not** copied here as fact. If we use a vendor figure in a live deck, it will be labelled **third-party estimate**, with title, publisher, and year — and kept separate from the pre-2008 bibliography.

## 5. Go to market

1. **Seed dense corridors first.** Three months per corridor. Local ambassadors. Community-led seeding. €0 paid acquisition in the first wedge.
2. **Verify trip-bringers** with a passport-country attestation badge (Veriff/Onfido) — drives the conversion premium our take rate depends on.
3. **Expand along rail and budget-airline hubs.** Each new corridor reuses the matching pipeline; marginal cost is moderation and trust tooling.
4. **Embedded weddings, communions, name-days** — community moments that surface a lift in trip postings on calendar matches.

## 6. Take rate & unit economics

We charge: `platformFee = min(€1.50, 12% × finderFee)`.

The Zod helper still names the input `finderFee` for historical reasons; in the product UI a **trip** line item is shown as an **agreed slot fee** to avoid conflating trips with listing finder fees.

Average reservation: €6 agreed slot fee → €0.72 platform fee → 12% effective (capped at €1.50 on larger fees).

**Illustrative corridor model (hypothesis, not validated revenue):**

|                       | Month 6 | Month 12 |
| --------------------- | ------- | -------- |
| Trips posted/month    | 80      | 320      |
| Avg slots filled/trip | 3       | 5        |
| GMV (agreed slot fees) | €1,440  | €9,600   |
| Platform take (~12%, €1.50 cap) | €173 | €1,152 |
| Net per corridor      | €230    | €1,800   |

40 corridors by end of year 2 → €864K/year platform revenue at illustrative unit-cost assumptions (settlement can stay in person until payment rails are live).

## 7. Moat

- **Trust graph** between diaspora communities is sticky — a verified badge from a Munich user transfers across categories.
- **Catalog UGC compounds.** Every approved product, every voted image, every confirmed handoff makes the next search better.
- **Geo + privacy primitives** (5 km privacy cell hashing, deterministic jitter) are non-trivial to copy correctly; doing it wrong burns the trust you need to charge.
- **Multi-modal: web + Expo + Hono + PartyKit + Inngest.** All under one pnpm workspace, all shipping in this repo.

## 8. Team

**Founding team (summary).** Operators with lived EU corridor experience (PL↔DE, Balkans↔Benelux)
and prior shipping history in marketplaces, trust/safety, and mobile consumer products. One founder
previously owned growth and community in a two-sided local network; another led platform
infrastructure (realtime, payments-adjacent systems) at scale. We are intentionally keeping
individual bios and employer names out of this repo copy—deck and data room carry full CVs,
references, and cap-table detail for diligence.

**Advisors (to formalise).** EU payments counsel, food-safety and peer-to-peer marketplace policy,
and a former trust-and-safety lead at a major classifieds platform—engaged or in discussion for
formal advisory agreements aligned with seed close.

## 9. Ask

€2.5M seed at €15M post.

Use of funds:

- 6 engineers (2 native, 2 web, 2 platform) — €1.4M
- 1 designer, 2 ops/community — €450K
- Trust & safety + KYC integration — €250K
- Verified-bringer onboarding (Veriff/Onfido) — €150K
- Insurance product spike (in-transit cargo) — €100K
- Runway buffer — €150K

Milestones for Series A:

- 40 active corridors
- 1,000 monthly active trips
- 80% reservation completion rate
- Stripe Connect live in DE, PL, FR, NL
- Verified-bringer badge in production

## 10. Why now

- Post-Brexit re-shoring of EU diaspora to the continent.
- Inflation → €19 imported tin chocolate is now intolerable.
- Open Food Facts has matured to the point we can seed a credible catalog in days, not months.
- European seed funds are leaning back into marketplace bets after recent corrections.

---

## References (historic statistics)

Used only for **population / migration context**, not as implied revenue TAM:

1. United Nations, DESA, Population Division (2006). *International Migration Report 2006*. https://www.un.org/en/development/desa/population/publications/pdf/migration/migration-report2006.pdf
2. OECD (2007). *International Migration Outlook 2007* (SOPEMI). https://www.oecd.org/migration/imo/
3. Eurostat (2008; reference period 2007). *Population in Europe 2007: first results* (KS-SF-08-081). https://ec.europa.eu/eurostat/en/web/products-statistics-in-focus/-/ks-sf-08-081
