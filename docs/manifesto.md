AI_MANIFESTO_VERSION: 1.0   of https://github.com/Hostilian/eushopCursor
CANONICAL_STATUS: ACTIVE
LAST_UPDATED_UTC: 2026-05-04
FORMAT: PLAIN_TEXT
AUDIENCE: AUTONOMOUS_SOFTWARE_AGENTS

================================================================
0. DOCUMENT CONTRACT
================================================================
0.1 PURPOSE
- This file is the canonical machine-facing orientation artifact for the Eushop repository.
- It exists to reduce ambiguity for future AI agents working on this codebase.
- It encodes mission, operational reality, constraints, and execution protocol.

0.2 PRECEDENCE MODEL
- Source-level truth has highest precedence over this file if direct contradiction exists.
- Primary source docs:
  - README.md
  - AGENTS.md
  - docs/claims/README.md
  - docs/README.md
  - package.json
- If this file conflicts with current source docs, agents MUST trust source docs and update this file.

0.3 INTENDED USAGE
- Read sections 1, 2, 5, 7, and 9 before making edits.
- Treat normative keywords literally:
  - MUST = hard requirement
  - SHOULD = strong default unless justified
  - MUST NOT = prohibited
  - MAY = optional

================================================================
1. SYSTEM IDENTITY (MISSION, GOAL, NON-GOALS)
================================================================
1.1 IDENTITY
- System name: Eushop
- Core statement: "Get something from somewhere. Bring something for someone."
- Product thesis: open peer layer for trips, locals, and open asks.

1.2 PRIMARY GOAL
- Build trustworthy cross-border peer exchange primitives around mobility corridors.
- Focus launch execution in dense EU diaspora corridors, while designing globally portable primitives.

1.3 CORE PRODUCT PRIMITIVES
- Trip offers: users announce routes with reservable slots.
- Open asks: demand posts trigger matching supply signals.
- Local listings: neighborhood finder-fee offers with privacy-preserving discovery.

1.4 MONETIZATION MODEL (CURRENT)
- Platform monetization event: confirmed trip reservation.
- Fee model: platformFee = min(EUR 1.50, 12 percent of agreed slot fee).
- Historical naming note:
  - Validator/internal legacy field may still reference "finderFee".
  - Product language uses "agreed slot fee" in trip UI contexts.

1.5 NON-GOALS / EXPLICIT BOUNDARIES
- System is NOT a customs broker.
- System is NOT freight logistics infrastructure.
- System is NOT full regulated goods settlement for listing transactions.
- Platform emphasizes discovery, identity, trust, matching, and communication.

================================================================
2. IMPLEMENTATION STATUS MAP
================================================================
2.1 IMPLEMENTED (IN REPO)
- Trip marketplace flows on web/mobile with DB-backed reservation lifecycle.
- Hybrid product catalog (curated + Open Food Facts ingestion + moderation queue).
- Local listings and open asks with geospatial search and privacy geohash handling.
- Realtime chat via PartyKit Durable Objects.
- Better Auth based authentication.
- Inngest job workflows (notifications, reminders, indexing-related workflows).
- Investor-facing surfaces (manifesto/traction/investor deck flow with tokenized access path).

2.2 ROADMAP / PARTIAL / CONDITIONAL
- Stripe Connect end-to-end maturity is active but not universal across all checkout contexts.
- Listing checkout and complete mobile card parity remain roadmap-oriented.
- Verified bringer lifecycle and additional trust affordances continue to evolve.
- Group-buy, restock alert, pickup hub, and expanded multilingual surfaces are directional.

2.3 TRUTHFULNESS CONSTRAINT
- Agents MUST distinguish shipped behavior from roadmap intent.
- Agents MUST NOT describe roadmap items as implemented without source confirmation.

================================================================
3. CANONICAL ARCHITECTURE MODEL
================================================================
3.1 HIGH-LEVEL FLOW
- Clients: Next.js web + Expo mobile + CDN edge.
- API surface: Hono + tRPC modular monolith.
- Data services: PostgreSQL + PostGIS + pgvector, Meilisearch, Redis.
- Async/realtime/services: Inngest, PartyKit, Cloudflare R2.

3.2 ARCHITECTURE PRINCIPLE
- Current mode is modular monolith with domain routers.
- Domains are structured for eventual extraction if scale demands it.
- Premature microservice fragmentation is discouraged.

3.3 OPERATIONAL DEPENDENCIES
- Database is critical path.
- Search is critical for discovery quality and some product surfaces.
- Auth secret correctness is critical across all runtimes importing auth.
- Event key/signing key alignment is critical for workflow integrity.

================================================================
4. REPO TOPOLOGY AND OWNERSHIP INTENT
================================================================
4.1 TOP-LEVEL MONOREPO SHAPE
- apps/web: public product web and marketing surfaces.
- apps/mobile: mobile client.
- apps/api: API server and workflows.
- apps/admin: moderation/admin operations.
- apps/party: PartyKit realtime workers.
- packages/api-router: domain routers.
- packages/db: schema and migrations.
- packages/auth: auth integration.
- packages/validators: shared validation contracts.
- packages/i18n, ui, tokens, geo, catalog, config: shared support packages.

4.2 LANE OWNERSHIP MODEL
- Lane A (Web/UI): web + UI + i18n + tokens + catalog.
- Lane B (API/Data): api + party + router + db + auth + validators + geo.
- Lane O (Orchestrator): root configs, lockfile/dependency coordination, CI, root docs.

4.3 HOTSPOT SERIALIZATION
- H1-router: packages/api-router/src/router.ts
- H2-context: packages/api-router/src/context.ts
- H3-schema: packages/db/src/schema/**
- H4-i18n: packages/i18n/src/messages/**
- H5-shell: apps/web/src/app/layout.tsx and route error/loading shell files
- H6-deps: root package/dependency orchestration files

================================================================
5. AGENT SAFETY AND GOVERNANCE PROTOCOL
================================================================
5.1 CLAIMS ARE MANDATORY FOR SUBSTANTIVE EDITS
- Before substantive edits, create docs/claims/EUSHOP-<lane>-<nnn>.yaml.
- claim.id MUST match claim filename.
- claim.touches MUST list expected paths as precisely as possible.
- Run pnpm claims:check before merge readiness.

5.2 CONFLICT AVOIDANCE
- Agents MUST NOT run overlapping active claims on same touches.
- Exactly one active claim per hotspot sub-lane is allowed.
- Prefer append-only edits in known contention files where documented.

5.3 VERIFY CADENCE
- After every 2-3 tasks per lane, execute pnpm verify.
- pnpm verify includes format check, typecheck, lint, unit tests, claims check, build.

5.4 FORBIDDEN EXECUTION PATTERNS
- MUST NOT bypass declared ownership boundaries without explicit orchestration.
- MUST NOT perform drive-by refactors in hotspot files under unrelated claims.
- MUST NOT assume lockfile/dependency edits are safe for parallel multi-agent merge.

================================================================
6. OPERATIONAL COMMAND CONTRACT
================================================================
6.1 COMMON ROOT COMMANDS
- Install: pnpm install
- Full verification: pnpm verify
- Claims validation: pnpm claims:check
- Unit tests: pnpm test:unit
- Typecheck: pnpm typecheck
- Lint: pnpm lint

6.2 DEV ENTRY MODES
- Web only: pnpm dev:web
- Web + API: pnpm dev:web-api (alias: pnpm demo)
- Web + API + local infra stack: pnpm dev:stack (alias: pnpm demo:stack)

6.3 DATA + SEARCH OPS
- Start infra dependencies: pnpm db:up
- Run migrations: pnpm db:migrate
- Seed database: pnpm db:seed
- Reindex search: pnpm search:index

6.4 HEALTH ENDPOINT CONVENTION
- Default LB probe: GET /health
- Optional deep dependency probe: GET /health?deep=1 with HEALTHCHECK_DEEP=1

================================================================
7. ENVIRONMENTAL INVARIANTS
================================================================
7.1 CRITICAL RUNTIME VARIABLES
- DATABASE_URL
- REDIS_URL
- BETTER_AUTH_SECRET
- BETTER_AUTH_URL
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_API_URL
- MEILI_HOST and MEILI_MASTER_KEY
- INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY

7.2 SECURITY AND ACCURACY INVARIANTS
- Secrets MUST NOT be committed.
- Production MUST use real BETTER_AUTH_SECRET in all auth-consuming runtimes.
- Build graph SHOULD NOT require live Meilisearch or Redis at compile time.
- Consent-related analytics behavior MUST respect documented banner/opt-in model.

7.3 PAYMENTS/KYC FEATURE FLAGS (OPTIONAL PER ENV)
- Stripe keys and webhook secret are required only for payment-enabled environments.
- KYC vendor keys are required only when trust verification workflow is enabled.
- ENABLE_DEMO_MODE MUST remain disabled in production unless explicitly controlled.

================================================================
8. DECISION PROTOCOL FOR FUTURE AGENTS
================================================================
8.1 DEFAULT DECISION ORDER
1) Prefer user instruction.
2) If absent, prefer repository source docs.
3) If absent, use conservative implementation preserving existing behavior.
4) If still ambiguous, choose minimal reversible change and document assumptions.

8.2 DESIGN HEURISTICS
- Prefer explicit contracts over implicit behavior.
- Prefer additive changes over broad rewrites.
- Prefer narrow PRs with deterministic blast radius.
- Preserve truthful product claims (no invented metrics or fake operational confidence).

8.3 ESCALATION CONDITIONS
- Ambiguous legal/compliance implications.
- Conflicting operational docs.
- Required migration touching contested hotspots.
- Any requirement that violates lane/hotspot policy.

================================================================
9. HANDOFF PROTOCOL (AGENT-TO-AGENT)
================================================================
9.1 REQUIRED HANDOFF BLOCKS
- Objective: exact task target.
- Current state: completed/pending items.
- Touched files: explicit list.
- Verification status: commands run + outcome.
- Risk ledger: known uncertainties and potential regressions.
- Next executable step: single best next action.

9.2 MINIMUM MACHINE-READABLE HANDOFF TEMPLATE
- HANDOFF_OBJECTIVE:
- HANDOFF_STATUS:
- HANDOFF_TOUCHED_PATHS:
- HANDOFF_CHECKS_RUN:
- HANDOFF_BLOCKERS:
- HANDOFF_ASSUMPTIONS:
- HANDOFF_NEXT_STEP:

9.3 Handoff QUALITY STANDARD
- MUST separate facts from assumptions.
- MUST identify unverified claims as unverified.
- MUST include enough context for stateless continuation.

================================================================
10. CANONICAL TERMINOLOGY AND ALIASES
================================================================
- "Agreed slot fee" = product-facing trip reservation fee language.
- "finderFee" = historical/internal field naming that may still appear in code.
- "Trip reservation confirmation" = monetization event trigger context.
- "Lane" = broad repository ownership boundary.
- "Hotspot sub-lane" = globally serialized high-conflict path group.
- "Claim" = yaml declaration of intended touched paths and ownership.

================================================================
11. HARD DO-NOT ASSUME LIST
================================================================
- Do not assume roadmap entries are implemented.
- Do not assume optional services are always provisioned in every environment.
- Do not assume Stripe/payment flows are globally enabled.
- Do not assume unrestricted parallel edits are safe.
- Do not assume CI defaults equal production secrets.
- Do not assume naming consistency across old and new product copy.

================================================================
12. MAINTENANCE OF THIS DOCUMENT
================================================================
- Update this file whenever major architecture, operational, or governance changes land.
- Keep content machine-oriented: concise, explicit, deterministic.
- Avoid narrative marketing language unless encoded as identity primitives.
- If large drift occurs, regenerate this file from source docs and reassert precedence.

END_OF_AI_MANIFESTO
