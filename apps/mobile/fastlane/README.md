# `apps/mobile/fastlane/`

Versionable, reviewable store-listing metadata for **App Store** (`metadata/<apple-locale>/`) and **Google Play** (`metadata/android/<play-locale>/`).

Picked up by `eas submit` (iOS) and the Play Developer API (Android) via the runbook in [docs/ops/mobile-store-release.md](../../../docs/ops/mobile-store-release.md).

## Locales

Launch corridors first (EN, DE, FR, PL, ES, IT). Anything marked `[needs translation: ...]` is flagged by `pnpm --filter @eushop/mobile preflight` and blocks `mobile:publish-ready` in the readiness scorecard.

| Apple   | Play    | Status               |
| ------- | ------- | -------------------- |
| `en-US` | `en-US` | hand-written, source |
| `de-DE` | `de-DE` | needs translation    |
| `fr-FR` | `fr-FR` | needs translation    |
| `pl-PL` | `pl-PL` | needs translation    |
| `es-ES` | `es-ES` | needs translation    |
| `it-IT` | `it-IT` | needs translation    |

## File reference

### iOS (`metadata/<locale>/`)

| File                   | Limit | Notes                                                                  |
| ---------------------- | ----- | ---------------------------------------------------------------------- |
| `name.txt`             | 30    | App Store display name                                                 |
| `subtitle.txt`         | 30    | One-line pitch under the name                                          |
| `description.txt`      | 4000  | Full description; first 3 lines render above the fold                  |
| `keywords.txt`         | 100   | Comma-separated, no spaces after commas                                |
| `promotional_text.txt` | 170   | Editable without re-review — use for launch news                       |
| `release_notes.txt`    | 4000  | "What's new" for the build                                             |
| `support_url.txt`      | URL   | Public support / contact page                                          |
| `marketing_url.txt`    | URL   | Public marketing site                                                  |
| `privacy_url.txt`      | URL   | Counsel-approved privacy policy                                        |
| `apple/copyright.txt`  | —     | `© <year> <legal entity>` shown in App Store Connect                   |
| `apple/categories.md`  | —     | Primary + secondary category notes (App Store Connect form, not text)  |

### Android (`metadata/android/<locale>/`)

| File                     | Limit | Notes                                                |
| ------------------------ | ----- | ---------------------------------------------------- |
| `title.txt`              | 50    | Play Store display name                              |
| `short_description.txt`  | 80    | One-line pitch                                       |
| `full_description.txt`   | 4000  | Full description; first 3 lines above the fold       |
| `video.txt`              | URL   | Optional YouTube preview URL (leave empty for none)  |
| `images/`                | —     | `icon.png`, `featureGraphic.png`, `phoneScreenshots/`|

## Editing rules

- Keep claims cite-able. Anything that smells like a market-size claim must trace back to [README.md](../../../README.md) "Historic statistics" section or the source list at `/sources` on the web app.
- Do not add emojis. Do not invent feature names.
- After editing copy, run `pnpm --filter @eushop/mobile preflight` — it catches over-length lines, missing files, and `[needs translation]` markers.
