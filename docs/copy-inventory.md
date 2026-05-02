# Copy inventory (user-facing surfaces)

| Surface | Location | Claim type | Notes |
|--------|----------|--------------|-------|
| i18n | `packages/i18n/src/messages/*.json` | Product, CTA | Single source for nav, hero, home pillars, mobile onboarding |
| Web marketing | `apps/web/src/app/(marketing)/{about,manifesto,roadmap,...}/page.tsx` | Editorial, occasional stats | Hardcoded EN; align with i18n tone |
| Web product | `apps/web/src/app/(product)/{discover,listings,trips,...}/**` | Product flows | Route group; URLs unchanged |
| Web content | `apps/web/content/pitch.md` | Investor, stats, projections | Gated deck; separate cited history vs forward-looking |
| Web trips UI | `apps/web/src/components/trips/*.tsx` | Product labels | Trip slot fees vs listing finder fee |
| Mobile | `apps/mobile/app/**/*.tsx` | Product | Trip detail labels |
| Admin | `apps/admin/src/app/**` | Cockpit | Moderation copy |
| Validators | `packages/validators/src/index.ts` | Chat template | User-visible string |
| Root | `README.md`, `package.json` | Product + stack | Opening paragraph; no uncited millions |
| Ops docs | `docs/README.md`, `docs/ops/*` | Runbooks, env, compliance prep | Index at `docs/README.md`; production matrix in `docs/ops/environment.md` |
| Citations | `apps/web/src/app/(marketing)/sources/page.tsx`, `docs/pre-2008-sources.md` | Bibliography | Pre-2008 official sources; Eurostat 2007 ref. via 2008 SiF where noted |
| Home KPI | `apps/web/src/components/marketing/kpi-strip.tsx` | Product counts | Footnote links `/traction` and `/sources` |
