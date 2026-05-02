# @eushop/mobile

Expo Router app (iOS, Android, web preview). Shares validators and design tokens with the monorepo.

## Run

```bash
pnpm --filter @eushop/mobile dev
```

Use **development** env in [eas.json](./eas.json) for local API (`EXPO_PUBLIC_*` in that profile).

## Assets and Expo config

Generate app icon / adaptive icon / splash assets (replace these placeholders with final brand assets before public launch):

```bash
pnpm --filter @eushop/mobile generate-assets
```

- `app.json` now references `./assets/icon.png`, `./assets/adaptive-icon.png`, and `./assets/splash.png`.
- `app.config.ts` supports `EAS_PROJECT_ID` and maps it into `expo.extra.eas.projectId`.

## EAS build + submit

Set up once:

```bash
npx eas-cli login
npx eas-cli project:init
npx eas-cli credentials
```

Internal testing:

```bash
npx eas-cli build --profile preview --platform all
npx eas-cli submit --profile internal --platform android
```

Production:

```bash
npx eas-cli build --profile production --platform all
npx eas-cli submit --profile production --platform android
npx eas-cli submit --profile production --platform ios
```

See [../../docs/ops/mobile-store-release.md](../../docs/ops/mobile-store-release.md) for Play/App Store compliance and submission checklist.
