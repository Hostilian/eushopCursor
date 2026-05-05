# Play Store — Data Safety form answers

Source of truth for the **Data Safety** section in Google Play Console for `eu.eushop.app`.

When the form is updated in Play Console, also update this file in the same PR. `pnpm --filter @eushop/mobile preflight` checks the file exists and that its declared categories match what the app actually requests at runtime.

## 1. Data collection summary

| Question                                                            | Answer                                                                 |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Does your app collect or share any of the required user data types? | **Yes**                                                                |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (TLS 1.2+ enforced; HSTS on `*.eushop.eu`)                     |
| Do you provide a way for users to request that their data is deleted? | **Yes** — `https://eushop.eu/account/delete` (public, non-authenticated) |

## 2. Data types — what we collect

| Data type             | Collected? | Shared? | Optional? | Purpose                                         | Retention                          |
| --------------------- | ---------- | ------- | --------- | ----------------------------------------------- | ---------------------------------- |
| **Personal info**     |            |         |           |                                                 |                                    |
| Name                  | Yes        | No      | Yes       | Account, App functionality                      | While account is active            |
| Email address         | Yes        | No      | Required  | Account, magic-link sign-in, comms              | While account is active            |
| User IDs              | Yes        | No      | Required  | Account                                         | While account is active            |
| **Location**          |            |         |           |                                                 |                                    |
| Approximate location  | Yes        | No      | Yes       | App functionality (5 km privacy cell discovery) | While listing/trip is active       |
| Precise location      | **No**     | —       | —         | We never request `ACCESS_FINE_LOCATION`         | n/a                                |
| **Messages**          |            |         |           |                                                 |                                    |
| Other in-app messages | Yes        | No      | Required  | App functionality (chat between buyer/bringer)  | While account is active            |
| **Photos and videos** |            |         |           |                                                 |                                    |
| Photos                | Yes        | No      | Yes       | App functionality (profile, listing photos)     | Until user deletes                 |
| **App activity**      |            |         |           |                                                 |                                    |
| App interactions      | Yes        | No      | Yes (opt-in via consent screen) | Analytics                           | 90 days then aggregated            |
| Crash logs            | Yes        | No      | Required  | Analytics, App functionality                    | 90 days                            |
| Diagnostics           | Yes        | No      | Required  | Analytics                                       | 90 days                            |
| **Device or other identifiers** |  |         |           |                                                 |                                    |
| Device or other IDs   | Yes        | No      | Required  | App functionality (push token), Account         | While device registered            |
| **Financial info**    |            |         |           |                                                 |                                    |
| Purchase history      | Conditional* | No   | —         | App functionality (Stripe Connect when enabled) | 7 years (tax/accounting compliance)|

\* Only collected when the trip-reservation Stripe Connect feature is enabled in the user's region. Card numbers and full payment instruments are never seen by Eushop — they live entirely in Stripe.

## 3. Data sharing summary

**No data is sold to third parties.** Service providers used:

| Provider          | Data shared                  | Purpose                            | Region |
| ----------------- | ---------------------------- | ---------------------------------- | ------ |
| Hetzner (Cloud)   | All app data                 | Primary hosting                    | EU     |
| Cloudflare        | Web traffic metadata         | CDN, DDoS protection               | EU     |
| Resend            | Email address, message body  | Transactional email delivery       | EU     |
| Expo (push)       | Push token + notification    | Push notification delivery         | US (push tokens are anonymous) |
| Sentry            | Crash reports                | Error monitoring                   | EU (self-hosted) |
| PostHog           | Anonymous usage events       | Product analytics (opt-in only)    | EU     |
| Stripe (optional) | Payment metadata             | Trip-reservation payment holds     | EU/US (PCI-DSS) |

All providers have signed DPAs available on request.

## 4. Security practices

- **Data encrypted in transit**: Yes — TLS 1.2+ required.
- **Data encrypted at rest**: Yes — Hetzner volume encryption + Postgres TDE for sensitive columns.
- **Users can request deletion**: Yes — `/account/delete` (public) and `/profile` → "Delete account" (signed-in).
- **Independent security review**: Annual penetration test (results summarised in `docs/ops/observability.md`).
- **Committed to Play Families Policy**: Not applicable — Eushop is 17+ (peer-to-peer marketplace, possible adult products).

## 5. Children's data

Eushop is **not** directed to children under 13. The minimum age in Terms of Service is 18. No COPPA / GDPR-K data collection.

## 6. Reviewer-facing confirmation

If a Play reviewer asks for backing evidence, point them to:

- Privacy policy: <https://eushop.eu/privacy>
- Account deletion: <https://eushop.eu/account/delete>
- Terms of service: <https://eushop.eu/terms>
- Open-source commitment: source-available at <https://github.com/eushop/eushop>
