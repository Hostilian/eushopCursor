# @eushop/mobile

Expo Router app (iOS, Android, web preview). Shares validators and design tokens with the monorepo.

## Run

```bash
pnpm --filter @eushop/mobile dev
```

Use **development** env in [eas.json](./eas.json) for local API (`EXPO_PUBLIC_*` in that profile). For **preview** builds, replace `api.example.com` / `party.example.com` with your staging hosts before running EAS.

## EAS

```bash
npx eas-cli build --profile development --platform ios
```

See root README for production `EXPO_PUBLIC_*` and push (`EXPO_PUSH_ACCESS_TOKEN` in `.env.example`).
