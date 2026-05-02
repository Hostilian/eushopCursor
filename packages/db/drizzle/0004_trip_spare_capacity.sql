-- Optional spare capacity hints for trip offers (buyer UX; not enforced server-side).
ALTER TABLE "trip_offers" ADD COLUMN IF NOT EXISTS "spare_weight_kg" integer;
ALTER TABLE "trip_offers" ADD COLUMN IF NOT EXISTS "spare_volume_liters" integer;
