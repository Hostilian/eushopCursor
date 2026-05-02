# i18n: intentionally English-only surfaces

[`packages/i18n`](../packages/i18n/src/messages/) covers marketing shell, nav, KPI strip, mobile strings, and many CTAs.

## Still hardcoded in English (audit snapshot)

Product UX that often stays English until translated:

- ~~Chat input placeholder (`chat-view.tsx`)~~ — uses `chat.placeholder` / `chat.placeholderUnavailable` (mobile `chat/[id].tsx` still EN-only).
- ~~Search bar placeholder (`search-client.tsx`)~~ — uses `search.placeholder` and `search.inputAriaLabel` from i18n.
- `ProductPicker` placeholders (web + mobile).
- Trip / listing / request form hints and placeholders (domain-specific examples).
- Admin app (operator console) — typically English-only.

## Policy

Either migrate strings to `packages/i18n` keys for all six locales, or document here that a surface is **EN-only by choice** to avoid duplicate translation work for internal tools.
