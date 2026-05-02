# Mobile store release checklist (Play Store + App Store)

This checklist makes `apps/mobile` release-ready for both stores.

## 1) Expo / EAS project linkage

1. Run `npx eas-cli login`.
2. Run `npx eas-cli project:init` from `apps/mobile` and store the resulting project ID as `EAS_PROJECT_ID` in CI/EAS env.
3. Confirm `eas.json` build profiles point to real hosts:
   - `preview`: `https://api.staging.eushop.eu`, `https://staging.eushop.eu`, `https://party.staging.eushop.eu`
   - `production`: `https://api.eushop.eu`, `https://eushop.eu`, `https://party.eushop.eu`

## 2) Credentials

### Android (Google Play)

1. Create app `eu.eushop.app` in Play Console.
2. Enable Play App Signing.
3. Upload a Google service account key in EAS credentials.
4. Upload one build manually once (Play API requirement), then use `eas submit`.

### iOS (Apple)

1. Create app `eu.eushop.app` in App Store Connect.
2. Set up App Store Connect API key (`eas credentials --platform ios`).
3. Capture `ascAppId` and place it in `eas.json` submit profile when known.

## 3) Submit profiles

Current `apps/mobile/eas.json` submit profiles:

- `internal`: Android internal track (for tester distribution)
- `production`: Android production track

For iOS CI submission, add:

```json
"production": {
  "ios": {
    "ascAppId": "YOUR_ASC_APP_ID"
  }
}
```

## 4) Listing + compliance (required)

### Play Store

- App icon, feature graphic, screenshots/tablets.
- Content rating questionnaire.
- Data safety section (data collection, sharing, encryption, deletion requests).
- Privacy policy URL.

### App Store

- App Store screenshots for required device sizes.
- Privacy nutrition labels.
- App Review notes + demo/test credentials if needed.
- Privacy policy URL.

## 5) Permission parity check

`app.json` currently requests camera + location usage on iOS. Ensure store disclosures match this behavior and add Android permission rationale copy in listing text where needed.

## 6) Release commands

```bash
# Internal testing
npx eas-cli build --profile preview --platform all
npx eas-cli submit --profile internal --platform android

# Production
npx eas-cli build --profile production --platform all
npx eas-cli submit --profile production --platform android
npx eas-cli submit --profile production --platform ios
```
