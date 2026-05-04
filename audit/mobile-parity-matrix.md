# Web vs mobile parity (Part 5.4)

| Feature | Web (2026-05-04) | Mobile | Gap / next step |
|---------|------------------|--------|------------------|
| Trip list & detail | `/trips`, `/trips/[id]` | `app/trip/*` | Re-verify reservation + payment steps on device |
| Trip reservation | shipped | partial | Align Stripe Elements parity per `docs/ops/mobile-payments-parity.md` |
| Open asks / requests | shipped | `request/new` | Ensure matches + feed parity |
| Local listings | shipped | `listing/new` | Map discovery parity |
| Realtime chat | PartyKit | `chat/[id]` | Auth token + history parity |
| Auth | Better Auth | `sign-in` | Biometrics roadmap |
| Push | n/a web | Expo token env | Wire `EXPO_PUSH_ACCESS_TOKEN` in prod |
| Deep links | web URLs | `eushop://` scheme | Document universal links in mobile README |

Update this table when either client ships a feature.
