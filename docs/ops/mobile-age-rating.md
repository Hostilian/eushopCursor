# Mobile age rating — questionnaire answers

Source of truth for the **Apple App Store Age Rating** and **Google Play Content Rating (IARC)** questionnaires for `eu.eushop.app`.

Target rating: **17+ (Apple) / Mature 17+ (Play / IARC: Mature)** — keeps room for occasional adult products in the local-listings UGC stream and avoids rating churn on each catalog expansion.

If the answers below change (e.g., we add a kids mode, or remove UGC), update both stores' questionnaires and amend this file in the same PR.

## Apple — age rating questionnaire

| Question                                                                 | Answer       |
| ------------------------------------------------------------------------ | ------------ |
| Cartoon or fantasy violence                                              | None         |
| Realistic violence                                                       | None         |
| Prolonged graphic or sadistic realistic violence                         | None         |
| Profanity or crude humor                                                 | None         |
| Mature/suggestive themes                                                 | None         |
| Horror/fear themes                                                       | None         |
| Medical/treatment information                                            | None         |
| Alcohol, tobacco, or drug use or references                              | Infrequent/Mild — local listings may include alcohol or tobacco products legally sold between adults |
| Simulated gambling                                                       | None         |
| Sexual content or nudity                                                 | None         |
| Graphic sexual content and nudity                                        | None         |
| **Unrestricted Web Access**                                              | **No** — in-app links to `eushop.eu` only |
| **Gambling and Contests**                                                | No           |
| **Made for Kids**                                                        | No — minimum age 18 per ToS |

Resulting rating: **17+** (driven by the Mild alcohol/tobacco answer).

## Apple — additional declarations

- **App uses encryption**: Yes — only standard HTTPS/TLS. Declared `ITSAppUsesNonExemptEncryption=false` in `Info.plist` (export-compliance exempt).
- **App uses third-party content**: Yes — Open Food Facts catalog (CC-BY-SA, attributed in-app per `apps/web/src/app/(marketing)/sources/page.tsx`).
- **Content rights**: We have rights to all imagery and copy used in the listing. UGC photos are subject to the moderation queue at `apps/admin`.

## Google Play — IARC questionnaire

| Question                                                          | Answer       |
| ----------------------------------------------------------------- | ------------ |
| Violence                                                          | None         |
| Sexual content                                                    | None         |
| Drugs / alcohol                                                   | Reference (in user-generated local listings only)  |
| Gambling                                                          | None         |
| Crude humor                                                       | None         |
| Fear or shock content                                             | None         |
| Discrimination / hate                                             | None — community guidelines prohibit; moderation queue removes |
| Music and audio                                                   | None         |
| User interaction (online)                                         | **Yes** — users can communicate with each other |
| Sharing of user-provided content                                  | **Yes**      |
| Sharing of user's location                                        | **Yes** — coarse only, 5 km cell |
| Digital purchases                                                 | Optional (Stripe Connect when active in region) |

Resulting IARC rating: **Mature 17+** (driven by user interaction + UGC).

## Google Play — additional declarations

- **Target audience**: 18+
- **Designed for Families**: No
- **Ads**: None — the app is ad-free. `app-ads.txt` published at `https://eushop.eu/app-ads.txt` blocks future scammer impersonation.
- **Government / sensitive permissions**: None requested.
- **News app**: No.

## Why we deliberately rate higher than the minimum

A common Play Console mistake is to declare "no UGC" because moderation is strict. App Review later sees a magic-link sign-in + chat + photo upload and lowers your rating to **Mature 17+** anyway, often after a punitive 7-day delay. We pre-empt this by declaring UGC up-front. The store badge is still 17+ on iOS (the lowest rating that reflects reality), which is invisible to most users and identical to most marketplaces.
