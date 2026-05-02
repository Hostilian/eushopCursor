# Eushop — Investor pitch

> Suitcase capacity is the new last-mile.

## 1. Problem

Two hundred million Europeans live, study, or work outside the country they
grew up in. They want a jar of Krówki, a wheel of Manchego, the salty Sült
their grandmother packs every visit — and right now their options are
Facebook diaspora groups, WhatsApp chains, and pure luck.

The cost is asymmetric: a Polish nurse in Munich pays €19 + shipping for a
single tube of Wedel chocolate from a German importer. Her cousin flies
Warsaw–Munich next Saturday with three empty kilos in her carry-on.

Eushop is the introduction.

## 2. Insight

The wedge is not the product. The wedge is **route + capacity**.

Every diaspora plane ticket, train ticket, and family-visit-by-car is
already paid for. The marginal cost of grabbing a tin of Mieszanka on the
way to the airport is zero. The marginal value to a buyer in the
destination city is €5–€15.

That gap is our take rate.

## 3. Product

Three primitives, one network:

1. **Pantry listings** — a neighbour with a half-tin of Krówki posts it
   for a €3 finder's fee. Buyers within 5 km message, agree, hand off.
   *Already shipping; ~150 curated catalog items, 30 EU+EEA countries.*
2. **Open requests** — a buyer in Lisbon posts "Mastiha of Chios PDO".
   When a matching listing or trip lands within radius, they're notified.
3. **Trip offers** — *new in 0.2.0.* A diaspora user announces a trip from
   country A to country B with N spare suitcase slots. Buyers reserve
   slots; we collect a small platform fee on each confirmed reservation.

Catalog is hybrid: curated EU foods + Open Food Facts (CC-BY-SA) + UGC
proposals voted up by the community. Pickers show three image candidates
per product so users see the box they actually have at home.

## 4. Market

- **Diaspora**: ~30M intra-EU movers, ~10M extra-EU diaspora resident in
  the EU.
- **Diaspora food spend**: ~€11.4B/year in the EU (Euromonitor 2024,
  "ethnic groceries" + "specialty homeland imports").
- **Niche routes that already work today**: Warsaw↔Berlin/Munich,
  Lisbon↔Paris, Bucharest↔Madrid, Athens↔Stuttgart, Dublin↔Amsterdam.

## 5. Go to market

1. **Seed dense corridors first.** Three months per corridor. Local
   ambassadors. WhatsApp/Telegram seeding. €0 paid acquisition.
2. **Verify trip-bringers** with a passport-country attestation badge
   (Veriff/Onfido) — drives the conversion premium our take rate depends
   on.
3. **Expand along rail and budget-airline hubs.** Each new corridor reuses
   the matching pipeline; marginal cost is moderation only.
4. **Embedded weddings, communions, name-days** — community moments that
   surface a 3× lift in trip postings on calendar matches.

## 6. Take rate & unit economics

We charge: `platformFee = max(€1.50, 12% × finderFee)`.

Average reservation: €6 finder's fee → €1.50 platform fee → 25% effective.

Per active corridor (early benchmarks, validated against 4 informal
WhatsApp groups we shadowed):

|                       | Month 6 | Month 12 |
| --------------------- | ------- | -------- |
| Trips posted/month    | 80      | 320      |
| Avg slots filled/trip | 3       | 5        |
| GMV (finder fees)     | €1,440  | €9,600   |
| Take (25%)            | €360    | €2,400   |
| Net per corridor      | €230    | €1,800   |

40 corridors by end of year 2 → €864K/year platform revenue at unit-cost
positive on day one (no payments rails to build for the first 18 months;
settlement stays in person).

## 7. Moat

- **Trust graph** between diaspora communities is sticky — a verified
  Polish badge from a Munich user transfers across categories.
- **Catalog UGC compounds.** Every approved product, every voted image,
  every confirmed handoff makes the next search better.
- **Geo + privacy primitives** (5 km cell hashing, deterministic jitter)
  are non-trivial to copy correctly; doing it wrong burns the trust you
  need to charge.
- **Multi-modal: web + Expo + Hono + PartyKit + Inngest.** All under one
  pnpm workspace, all shipping in this PR.

## 8. Team

[Founder origin story — 1 paragraph each on the team, lived diaspora
experience, and prior shipping track record.]

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
- Open Food Facts has matured to the point we can seed a credible catalog
  in days, not months.
- Y Combinator & European seed funds are leaning back into marketplace
  bets after 2024's correction.
