# Mobile launch day — checklist

The 24-hour window after the production listing goes live. Owner: Mobile lead. Backup owner: Ops lead.

Every box is binary. If you cannot tick a box, escalate per [`docs/readiness/escalation-contact-matrix.md`](../readiness/escalation-contact-matrix.md). Don't tick boxes you didn't actually verify.

## T-24 h (day before)

- [ ] **Final preflight green:** `pnpm --filter @eushop/mobile preflight` exits 0 with < 50 `[needs translation]` warnings.
- [ ] **Compliance docs reviewed by counsel** — initials in [`docs/readiness/decision-audit-trail-index.md`](../readiness/decision-audit-trail-index.md).
- [ ] **Production build approved** in App Store Connect and Play Console (status: "Pending Developer Release" / "Available").
- [ ] **Sentry alerts armed** for crash-free session rate < 99.0 % on `eu.eushop.app`.
- [ ] **PostHog cohorts created** for "First mobile session" and "Day-1 retention".
- [ ] **PartyKit + API capacity check** — at least 3× expected concurrent connections.
- [ ] **Inngest dashboard** — no failed events in the last 6 h on `notify-message` / `trip.offer.created`.
- [ ] **Magic-link inbox** for `reviewer@eushop.eu` confirmed receiving and opening.
- [ ] **Status page** stub at `status.eushop.eu` reports green.
- [ ] **Support inbox** (`hello@eushop.eu`) staffed for the launch window.

## T-0 (release moment)

- [ ] App Store: tap **Release this version** (or confirm phased release setting).
- [ ] Play: bump rollout from internal track → 20 % production.
- [ ] Verify the listing pages render with screenshots, descriptions, and store badges.
- [ ] Tap install on a clean iOS test device — magic-link sign-in works end-to-end via Universal Link.
- [ ] Tap install on a clean Android test device — magic-link sign-in works end-to-end via App Link.
- [ ] **Smart App Banner** appears on `eushop.eu` when viewed in Mobile Safari.
- [ ] **Universal Link** test: paste `https://eushop.eu/trip/<seeded-id>` in Notes app on iPhone → opens app.
- [ ] **App Link** test: paste same URL in Gmail on Pixel → opens app.

## T+1 h

- [ ] Sentry crash-free session rate ≥ 99.5 %.
- [ ] No "stuck on splash" reports in support inbox.
- [ ] Push notification roundtrip: send a test message via tRPC; both iOS and Android receive within 10 s.

## T+6 h

- [ ] Sentry crash-free session rate ≥ 99.5 %.
- [ ] Bump Play rollout 20 % → 50 % if green.
- [ ] First-day install count > 0 in PostHog.
- [ ] Active users by country shows expected EU corridor distribution (DE, PL, IT, ES, FR primarily).

## T+24 h

- [ ] Sentry crash-free session rate ≥ 99.5 %.
- [ ] Bump Play rollout 50 % → 100 % if green.
- [ ] No App Store / Play reviewer messages waiting.
- [ ] First retro auto-scheduled per [`docs/readiness/retro-24h-template.md`](../readiness/retro-24h-template.md).
- [ ] [`docs/readiness/evidence-log.md`](../readiness/evidence-log.md) updated with launch evidence (screenshots of dashboards, install counts).

## If anything is red

1. **Crash > 1 %**: stop the rollout in Play Console (`Halt rollout`). Investigate top stack trace in Sentry. If JS-only, OTA fix; if native, hotfix per [`mobile-store-release.md`](mobile-store-release.md) §9.
2. **Universal/App Link fails**: check [`apps/web/src/app/.well-known/apple-app-site-association/route.ts`](../../apps/web/src/app/.well-known/apple-app-site-association/route.ts) returns the correct team ID at `https://eushop.eu/.well-known/apple-app-site-association`. Apple caches AASA for 24 h, so changes there don't help an existing failure — the fix is to ship a new build with the correct domain.
3. **Push not delivered**: check `EXPO_PUSH_ACCESS_TOKEN` is set, then check the user has an entry in `device_tokens`, then check the Expo push receipt API for the specific token (most failures are `DeviceNotRegistered` from uninstalled apps and are safe to ignore).
4. **Magic-link not arriving**: confirm `RESEND_API_KEY` is set in API env. In dev, links print to API logs.
5. **App Review rejection**: read the message carefully; common rejections (Guideline 5.1.1 missing data deletion URL, Guideline 4.8 missing Sign in with Apple) are addressed in [`mobile-app-review.md`](mobile-app-review.md).

## Cooldown (T+48 h)

- [ ] Disable expedited-monitoring rotation; revert to weekly readiness cadence.
- [ ] Update [`docs/readiness/lessons-to-actions-tracker.md`](../readiness/lessons-to-actions-tracker.md) with anything learned.
- [ ] Tag the release: `git tag mobile-v$(node -p "require('./apps/mobile/app.json').expo.version") && git push origin mobile-v...`.
