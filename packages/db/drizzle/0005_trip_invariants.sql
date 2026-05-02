-- Server-side invariants for the trip marketplace. The router already enforces
-- these in app code; the DB layer provides defence-in-depth so a buggy import
-- script or a stale migration cannot poison the books.

ALTER TABLE "trip_offers"
  ADD CONSTRAINT IF NOT EXISTS "trip_offers_slots_total_positive"
  CHECK ("slots_total" > 0);

ALTER TABLE "trip_offers"
  ADD CONSTRAINT IF NOT EXISTS "trip_offers_slots_available_range"
  CHECK ("slots_available" >= 0 AND "slots_available" <= "slots_total");

ALTER TABLE "trip_reservations"
  ADD CONSTRAINT IF NOT EXISTS "trip_reservations_qty_positive"
  CHECK ("qty" > 0);

ALTER TABLE "trip_reservations"
  ADD CONSTRAINT IF NOT EXISTS "trip_reservations_agreed_finder_fee_nonneg"
  CHECK ("agreed_finder_fee" >= 0);

ALTER TABLE "trip_reservations"
  ADD CONSTRAINT IF NOT EXISTS "trip_reservations_platform_fee_nonneg"
  CHECK ("platform_fee" >= 0);
