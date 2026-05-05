# Trip reservations index review (`EUSHOP-B-021`)

Date: 2026-05-05  
Scope: `packages/db/src/schema/trips.ts` + `packages/api-router/src/routers/trips.ts`

## Current indexes

`trip_reservations` already has:

- `trip_reservations_trip_idx` on `(trip_offer_id, status)`
- `trip_reservations_buyer_idx` on `(buyer_id)`
- `trip_reservations_food_idx` on `(food_item_id)`
- partial unique `trip_reservations_active_uniq` on `(trip_offer_id, buyer_id, food_item_id, freeform_text)` where status in `('pending','confirmed')`

## Hot query patterns in router

Observed from `trips.ts`:

1. Seller list for one trip: `where trip_offer_id = ? order by created_at desc`
2. Buyer list for one trip: `where trip_offer_id = ? and buyer_id = ? and status in (...) order by created_at desc`
3. Buyer history: `where buyer_id = ? order by created_at desc`
4. Status aggregation by trip: `where trip_offer_id = ? group by status`

## Assessment

- Existing `(trip_offer_id, status)` helps status filters and group-by but is not ideal for sort-by-created-at workloads.
- Existing `(buyer_id)` helps buyer history, but sort-by-created-at can still require extra work.
- No index currently covers `(trip_offer_id, created_at desc)` which is used in the most common list endpoint.

## Recommended follow-up migration (small, safe)

Add two non-unique indexes:

1. `(trip_offer_id, created_at desc)` for trip reservation lists.
2. `(buyer_id, created_at desc)` for buyer history lists.

Optionally evaluate (after production `EXPLAIN ANALYZE`):

- `(trip_offer_id, buyer_id, created_at desc)` if buyer-in-trip lists become a measurable hotspot.

## Rollout notes

- Keep this as a separate migration PR touching only schema + migration files.
- Run `EXPLAIN (ANALYZE, BUFFERS)` on the four patterns above before and after.
- Track index bloat/write overhead in staging before broad rollout.
# Trip reservations — index review

Trip offers and reservations are hot paths for seller dashboards and payment state.

## When migrating or slowing down

1. List queries from [`packages/api-router`](../../packages/api-router) `trips` and `reservations` routers that filter by `trip_offer_id`, `buyer_id`, `seller_id`, `status`, `created_at`.
2. Compare with **Drizzle** / Postgres indexes in [`packages/db/src/schema`](../../packages/db/src/schema); add composite indexes only when `EXPLAIN (ANALYZE)` shows sequential scans at realistic row counts.
3. Avoid redundant indexes that slow writes on high-churn status updates.

## Payments join

- Reservation payment rows should join on stable UUID keys; verify foreign keys and index direction match the admin **Payments** view queries.
