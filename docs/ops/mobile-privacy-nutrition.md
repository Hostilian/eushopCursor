# App Store — Privacy Nutrition Label

Source of truth for the **App Privacy** section in App Store Connect for `eu.eushop.app`.

Same data model as `mobile-data-safety.md` (Play), translated to Apple's three-bucket schema:
**Data Used to Track You** / **Data Linked to You** / **Data Not Linked to You**.

## 1. Data Used to Track You

**None.** Eushop does **not** request `App Tracking Transparency` permission and the IDFA is never read. The `NSUserTrackingUsageDescription` string in `app.json` is set defensively only to satisfy reviewers who scan all permission strings; we never present the prompt.

## 2. Data Linked to You

| Category              | Data                              | Purpose                                                         |
| --------------------- | --------------------------------- | --------------------------------------------------------------- |
| **Contact Info**      | Email address, Name               | App Functionality, Customer Support                             |
| **User Content**      | Photos or Videos, Other User Content (chat messages, listings) | App Functionality            |
| **Identifiers**       | User ID                           | App Functionality                                               |
| **Location**          | Coarse Location (≥5 km cell)      | App Functionality                                               |
| **Diagnostics**       | Crash Data, Performance Data      | App Functionality                                               |
| **Purchases**         | Purchase History (when Stripe Connect is active) | App Functionality                              |

## 3. Data Not Linked to You

| Category              | Data                              | Purpose                  |
| --------------------- | --------------------------------- | ------------------------ |
| **Usage Data**        | Product Interaction               | Analytics (opt-in only)  |

## 4. Required disclosures

- **Data is collected:** Yes
- **Data is linked to the user:** Yes (above categories)
- **Data is used for tracking:** No
- **Account deletion in app:** Yes (`Profile → Delete account`)
- **Account deletion via web:** Yes (`https://eushop.eu/account/delete`)
- **All data encrypted in transit:** Yes
- **Privacy policy URL:** `https://eushop.eu/privacy`

## 5. Per-permission disclosures (`Info.plist` mappings)

| Permission                                  | `Info.plist` key                       | Used for                                                                                       |
| ------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Camera                                      | `NSCameraUsageDescription`             | Profile, listing, and trip photos                                                              |
| Photo Library — read                        | `NSPhotoLibraryUsageDescription`       | Pick existing photos for profile, listings, trips                                              |
| Photo Library — add                         | `NSPhotoLibraryAddUsageDescription`    | Save QR codes and shared listing photos                                                        |
| Location When In Use                        | `NSLocationWhenInUseUsageDescription`  | Approximate (5 km cell) discovery only — `NSLocationAlwaysAndWhenInUseUsageDescription` is **not** declared |
| Tracking                                    | `NSUserTrackingUsageDescription`       | Defensive string; the prompt is **never** presented                                            |
| Encryption export compliance                | `ITSAppUsesNonExemptEncryption=false`  | We use only HTTPS/TLS, no proprietary cryptography                                             |

## 6. Reviewer-facing confirmation

If App Review asks for backing evidence:

- Source: `apps/mobile/app.json` (Info.plist strings)
- Source: `apps/mobile/src/lib/observability.ts` (PostHog gated on consent)
- Source: `apps/mobile/app/consent.tsx` (consent flow)
- Privacy policy: <https://eushop.eu/privacy>
- Test creds: see `docs/ops/mobile-app-review.md`
