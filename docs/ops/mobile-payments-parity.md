# Mobile payments and Connect parity

The **web** app is the first-class surface for **Stripe Connect onboarding** (`payments.startConnectOnboarding` account links) and for **card confirmation** once `trips.reserve` returns a `paymentClientSecret` (Stripe.js / Elements — wire on web as you productize).

## Product decision (shipped)

- **Mobile does not embed Stripe.js / Elements.** Web is the supported surface for Connect onboarding (`payments.startConnectOnboarding`) and for **card authorization** (`ReservationPaymentStep`).
- **Mobile** (`apps/mobile`) calls `trips.reserve` like web; when the API returns `paymentClientSecret`, the trip screen prompts the user to open **`EXPO_PUBLIC_SITE_URL`/reservations** on the website to finish the hold (see [`eas.json`](../../apps/mobile/eas.json)).

## Today

- **Mobile** (`apps/mobile`) calls `trips.reserve` like web; the API may return `paymentClientSecret` when the seller has Connect + charges enabled.
- The mobile trip screen does not embed Stripe Elements; when a client secret is present, the app prompts the user to **complete the hold on the website** (see `EXPO_PUBLIC_SITE_URL` in [`eas.json`](../../apps/mobile/eas.json) and `/reservations`).

## Target parity

- **Option A**: Expo WebView or `@stripe/stripe-react-native` for confirm/capture flows (review PCI and SDK support per platform).
- **Option B**: Deep link to authenticated web checkout for the reservation.

Document the chosen approach in the deploy runbook when you ship mobile card capture.
