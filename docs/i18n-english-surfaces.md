# i18n: intentionally English-only surfaces

[`packages/i18n`](../packages/i18n/src/messages/) covers marketing shell, nav, KPI strip, mobile strings, and many CTAs.

## Still hardcoded in English (audit snapshot)

Product UX that often stays English until translated:

- ~~Chat input placeholder (`chat-view.tsx`)~~ — uses `chat.placeholder` / `chat.placeholderUnavailable`.
- ~~Mobile chat placeholders (`app/chat/[id].tsx`)~~ — reads `chat.*` from `@eushop/i18n` `en.json` (device locale wiring can map to `loadMessages` later).
- ~~Search bar placeholder (`search-client.tsx`)~~ — uses `search.placeholder` and `search.inputAriaLabel` from i18n.
- ~~`ProductPicker`: **search field** uses `productPicker.searchPlaceholder` (all six locales); other picker/modal strings still English — migrate incrementally.~~ — main picker + propose modal strings live under `productPicker.*` in all six locales.
- Trip / listing / request form hints and placeholders (domain-specific examples).
- Admin app (operator console) — typically English-only.

## Policy

Either migrate strings to `packages/i18n` keys for all six locales, or document here that a surface is **EN-only by choice** to avoid duplicate translation work for internal tools.

## Admin app (`apps/admin`)

The operator console is **English-only by product choice**: moderation, payments reconciliation, and audit copy stay in `apps/admin` source until there is a concrete need for localized operator UIs. Do not block shipping translated consumer surfaces on admin translation.
