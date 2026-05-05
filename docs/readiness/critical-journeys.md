# Critical Journeys And Definition Of Ready

This document defines launch-critical journeys and pass criteria for release gates.

## Journey 1: Discovery To Listing Engagement

### Steps

1. User opens discovery surfaces (web/mobile).
2. User browses/searches listings and trip offers.
3. User opens detail and initiates contact/action.

### Definition of ready

- Search returns relevant results for seeded and user-generated content.
- Listing/trip cards render with usable visual fallback when photo is missing.
- Detail pages load without blocker errors.
- Key CTA is functional on web and mobile.
- Error states are human-readable and actionable.

## Journey 2: Trip Offer To Reservation To Completion

### Steps

1. Bringer creates a trip offer.
2. Buyer discovers and reserves a slot.
3. Parties complete coordination and mark completion.

### Definition of ready

- Offer creation validates required fields and persists correctly.
- Reservation lifecycle transitions are valid (`created -> reserved -> confirmed/completed/cancelled`).
- Pricing/fee information is shown consistently and does not regress.
- User receives expected notifications or status updates.
- Failure paths do not strand reservations in invalid state.

## Journey 3: Chat And Trust-Critical Interaction

### Steps

1. Two matched users open chat.
2. Messages send/receive in near real-time.
3. Safety/trust indicators are visible where required.

### Definition of ready

- Message send and receipt work in both directions.
- Presence and conversation continuity hold through reconnects.
- Report/block/safety affordances are reachable and logged.
- No known P0 privacy issue in chat payload or metadata exposure.

## Journey 4: Product Picker And Picture Attachment

### Steps

1. User opens picker and navigates Pics.
2. User selects product image (real or fallback).
3. Selection is attached to listing/request payload.

### Definition of ready

- Pics pagination is reachable beyond first page.
- Every selected product includes a picture URL payload.
- Fallback cards render deterministic, readable visuals.
- Mobile and web behavior are functionally aligned.

## Minimum evidence per journey

- Automated checks: type/lint/unit/build where applicable.
- Manual walkthrough: one successful run on web and mobile for each journey.
- Defect triage note for every failing step with owner and ETA.
