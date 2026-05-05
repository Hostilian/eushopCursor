# App Review — submission notes

Paste the contents of this file into the **App Review Information** field in App Store Connect (and the equivalent **Reviewer notes** in Play Console pre-launch report).

The reviewer test account is created in seed data — see `packages/db/src/seed.ts` `seedReviewerAccount()`. It's an isolated user with curated demo content; deleting it is safe and does not break production.

---

## Demo / test account

```
Email:        reviewer@eushop.eu
Sign-in:      Magic link (no password)
Region:       EU (Munich)
Pre-seeded:   2 active trip offers, 1 reservation, 3 local listings, 1 open ask
```

The reviewer signs in with the magic-link flow:

1. Open the app → tap **Sign in** on the Profile tab.
2. Enter `reviewer@eushop.eu`.
3. The magic-link email arrives at the **shared review inbox** (we forward it via Apple-managed alias). Tap the link on the same device → the app opens via Universal Link.
4. They are now signed in as the reviewer.

> **For reviewers who cannot receive email**, we have a **bypass code** documented inline in App Store Connect's *Notes* field (rotated each submission, never committed to git). It calls a constant-time-checked endpoint that issues a one-shot session cookie for `reviewer@eushop.eu` only. The bypass is rate-limited (5 / hour / IP) and is automatically disabled if used outside the review window.

## What to test

The fastest happy-path:

1. **Today** tab — fresh listings load near "Munich".
2. **Trips** tab — tap the seeded trip "Munich → Warsaw, May 14, 6 slots".
3. Tap **Reserve a slot**. (No payment is captured in test mode.)
4. **Messages** tab — open the seeded conversation with "Marta" and send a message. Realtime echo confirms the chat works.
5. **Profile** tab — verify badge, exchange count, **Privacy choices** opens the consent screen, **Delete account** button visible.

## Permissions the app may prompt for

| Prompt                | When it appears                                     | Why we need it                                                  |
| --------------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| Camera                | Tapping "Add photo" on a listing or profile         | Capture listing/trip photos                                     |
| Photo Library         | Same as above, "Pick from library"                  | Choose existing photos                                          |
| Location When In Use  | Pulling Today tab to refresh "near you"             | Approximate (5 km cell) discovery only                          |
| Notifications         | After completing the consent screen                 | Push for new messages and trip-reservation updates              |

We **never** request:

- Tracking (App Tracking Transparency)
- Precise / Background location
- Microphone / Audio recording
- Contacts
- Calendar
- Health data

## Compliance highlights

- **Encryption export compliance**: declared `ITSAppUsesNonExemptEncryption=false` in `Info.plist`. We use only HTTPS/TLS.
- **Privacy policy**: <https://eushop.eu/privacy> (counsel-approved; link from app footer and consent screen).
- **Account deletion**: in-app (Profile → Delete account) and on the web (`https://eushop.eu/account/delete`) — both delete everything via cascading FK constraints.
- **Children**: minimum age 18 per ToS; no kid-directed surfaces.
- **Adult content**: catalog is curated; UGC moderation queue is documented in `docs/readiness/`. We rate the app **17+ (Apple)** / **Mature 17+ (Play)** to avoid surprises.
- **Sign-in with Apple**: not yet wired (only magic-link). When social sign-in (Google) lands, Sign in with Apple ships in the same release per App Review Guideline 4.8.

## Build details

| Field                  | Value                                                    |
| ---------------------- | -------------------------------------------------------- |
| Bundle id (iOS) / pkg  | `eu.eushop.app`                                          |
| Build channel          | `production`                                             |
| Source                 | `apps/mobile` in <https://github.com/eushop/eushop>      |
| Built with             | EAS Build (`eas build --profile production --platform all`) |
| API endpoint           | `https://api.eushop.eu`                                  |
| Web companion          | `https://eushop.eu`                                      |
| Realtime               | `https://party.eushop.eu`                                |

## Contact

- App Review escalation: `app-review@eushop.eu`
- Operations on-call: see `docs/readiness/oncall-run-card.md`
- DPO: `dpo@eushop.eu`
