# Copy inventory (user-facing surfaces)

| Surface | Location | Claim type | Notes |
|--------|----------|--------------|-------|
| i18n | `packages/i18n/src/messages/*.json` | Product, CTA | Single source for nav, hero, home pillars, mobile onboarding |
| Web marketing | `apps/web/src/app/{about,manifesto,roadmap,...}/page.tsx` | Editorial, occasional stats | Hardcoded EN; align with i18n tone |
| Web content | `apps/web/content/pitch.md` | Investor, stats, projections | Gated deck; separate cited history vs forward-looking |
| Web trips UI | `apps/web/src/components/trips/*.tsx` | Product labels | Trip slot fees vs listing finder fee |
| Mobile | `apps/mobile/app/**/*.tsx` | Product | Trip detail labels |
| Admin | `apps/admin/src/app/**` | Cockpit | Moderation copy |
| Validators | `packages/validators/src/index.ts` | Chat template | User-visible string |
| Root | `README.md`, `package.json` | Product + stack | Opening paragraph; no uncited millions |
| Citations | `apps/web/src/app/sources/page.tsx`, `docs/pre-2008-sources.md` | Bibliography | Pre-2008 official sources only |
