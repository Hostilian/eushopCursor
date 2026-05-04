# Locale matrix

Eushop registers **34** UI locales in [`packages/i18n/src/index.ts`](../packages/i18n/src/index.ts). Most non-English files are currently **English stubs** copied from `en.json` so keys stay in sync (`pnpm i18n:check`). Human translation should land incrementally per corridor.

## Bootstrap a new locale

```bash
pnpm i18n:bootstrap -- nl sv da
# or: LOCALES="nl,sv" pnpm i18n:bootstrap
```

Then register the code in `SUPPORTED_LOCALES` and `localeMeta` (set `dir: 'rtl'` for Arabic, Hebrew, Persian, etc.).

## After editing `en.json`

```bash
pnpm i18n:sync
```

This deep-fills missing keys in every other locale from English without overwriting existing translations.

## RTL

`ar`, `fa`, and `he` use `dir: 'rtl'`; [`apps/web/src/app/layout.tsx`](../apps/web/src/app/layout.tsx) sets `<html dir>` accordingly.

## Coverage tiers

| Tier | Locales (examples) | Notes |
|------|---------------------|--------|
| EU + neighbours | `de`, `fr`, `es`, `it`, `pl`, `ro`, `nl`, `sv`, `da`, `fi`, `cs`, `sk`, `hu`, `bg`, `hr`, `el`, `pt`, `et`, `lv`, `lt`, `sl`, `is`, `uk` | Stubs until native copy ships |
| Wider Europe / trade | `ru`, `tr` | Stubs |
| East Asia | `ja`, `ko`, `zh-CN` | `zh-CN` uses BCP-47 tag for filenames |
| South / SE Asia | `hi`, `bn`, `id` | Stubs |
| RTL | `ar`, `fa`, `he` | Layout tested; copy still EN until translated |
