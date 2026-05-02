-- Migration 0002: trip-marketplace pivot.
-- Adds:
--   * UGC + image metadata columns on `food_items`
--   * `food_item_candidates`, `food_item_image_proposals`, `food_item_image_votes`
--   * full trip & reservation spine: `trip_offers`, `trip_reservations`, `payouts`

------------------------------------------------------------------------
-- Catalog: image variants, barcode, OFF id, verified flag, submitter --
------------------------------------------------------------------------

ALTER TABLE "food_items"
  ADD COLUMN IF NOT EXISTS "image_variants" jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS "barcode" text,
  ADD COLUMN IF NOT EXISTS "off_id" text,
  ADD COLUMN IF NOT EXISTS "verified_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "submitted_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "food_items_barcode_uq" ON "food_items" ("barcode") WHERE barcode IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "food_items_off_id_uq" ON "food_items" ("off_id") WHERE off_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "food_items_verified_idx" ON "food_items" ("verified_at");

------------------------------------------------------------------------
-- Catalog UGC moderation                                             --
------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "food_item_candidate_status" AS ENUM ('pending','approved','rejected','duplicate');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "food_item_image_proposal_status" AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "food_item_candidates" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" text NOT NULL,
  "aka" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "category_slug" text NOT NULL,
  "origin_country_iso2" text NOT NULL,
  "description" text,
  "proposed_images" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "submitted_by_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" "food_item_candidate_status" NOT NULL DEFAULT 'pending',
  "merged_into_item_id" uuid REFERENCES "food_items"("id") ON DELETE SET NULL,
  "moderator_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "moderator_note" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "food_item_candidates_status_idx" ON "food_item_candidates" ("status");
CREATE INDEX IF NOT EXISTS "food_item_candidates_submitter_idx" ON "food_item_candidates" ("submitted_by_id");

CREATE TABLE IF NOT EXISTS "food_item_image_proposals" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "food_item_id" uuid NOT NULL REFERENCES "food_items"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "source" text NOT NULL DEFAULT 'r2',
  "submitted_by_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" "food_item_image_proposal_status" NOT NULL DEFAULT 'pending',
  "votes" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "food_item_image_proposals_item_idx" ON "food_item_image_proposals" ("food_item_id","status");
CREATE INDEX IF NOT EXISTS "food_item_image_proposals_submitter_idx" ON "food_item_image_proposals" ("submitted_by_id");
CREATE UNIQUE INDEX IF NOT EXISTS "food_item_image_proposals_uniq" ON "food_item_image_proposals" ("food_item_id","submitted_by_id","url");

CREATE TABLE IF NOT EXISTS "food_item_image_votes" (
  "proposal_id" uuid NOT NULL REFERENCES "food_item_image_proposals"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "food_item_image_votes_pk" ON "food_item_image_votes" ("proposal_id","user_id");

------------------------------------------------------------------------
-- Trip marketplace spine                                             --
------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "trip_offer_status" AS ENUM ('draft','open','closed','in-transit','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "trip_reservation_status" AS ENUM ('pending','confirmed','seller-rejected','expired','completed','disputed','refunded','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "payout_status" AS ENUM ('pending','in-transit','paid','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "trip_offers" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "seller_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

  "origin_country_iso2" text NOT NULL,
  "origin_city" text NOT NULL,
  "origin_location" geography(Point,4326) NOT NULL,
  "cell_geohash_origin" text NOT NULL,

  "destination_country_iso2" text NOT NULL,
  "destination_city" text NOT NULL,
  "destination_location" geography(Point,4326) NOT NULL,
  "cell_geohash_destination" text NOT NULL,

  "depart_at" timestamp with time zone NOT NULL,
  "return_at" timestamp with time zone,

  "slots_total" integer NOT NULL,
  "slots_available" integer NOT NULL,
  "default_per_slot_fee" numeric(8,2) NOT NULL DEFAULT 5,
  "currency" text NOT NULL DEFAULT 'EUR',
  "notes" text,
  "intended_item_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,

  "status" "trip_offer_status" NOT NULL DEFAULT 'open',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "trip_offers_seller_idx" ON "trip_offers" ("seller_id");
CREATE INDEX IF NOT EXISTS "trip_offers_origin_idx" ON "trip_offers" ("origin_country_iso2","cell_geohash_origin");
CREATE INDEX IF NOT EXISTS "trip_offers_dest_idx" ON "trip_offers" ("destination_country_iso2","cell_geohash_destination");
CREATE INDEX IF NOT EXISTS "trip_offers_status_idx" ON "trip_offers" ("status","depart_at");
CREATE INDEX IF NOT EXISTS "trip_offers_depart_idx" ON "trip_offers" ("depart_at");
CREATE INDEX IF NOT EXISTS "trip_offers_origin_loc_idx" ON "trip_offers" USING GIST ("origin_location");
CREATE INDEX IF NOT EXISTS "trip_offers_dest_loc_idx" ON "trip_offers" USING GIST ("destination_location");

CREATE TABLE IF NOT EXISTS "trip_reservations" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "trip_offer_id" uuid NOT NULL REFERENCES "trip_offers"("id") ON DELETE CASCADE,
  "buyer_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

  "food_item_id" uuid REFERENCES "food_items"("id") ON DELETE SET NULL,
  "freeform_text" text NOT NULL,
  "qty" integer NOT NULL DEFAULT 1,

  "agreed_finder_fee" numeric(8,2) NOT NULL,
  "platform_fee" numeric(8,2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'EUR',

  "status" "trip_reservation_status" NOT NULL DEFAULT 'pending',
  "confirmed_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "cancellation_reason" text,

  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "trip_reservations_trip_idx" ON "trip_reservations" ("trip_offer_id","status");
CREATE INDEX IF NOT EXISTS "trip_reservations_buyer_idx" ON "trip_reservations" ("buyer_id");
CREATE INDEX IF NOT EXISTS "trip_reservations_food_idx" ON "trip_reservations" ("food_item_id");
CREATE UNIQUE INDEX IF NOT EXISTS "trip_reservations_active_uniq"
  ON "trip_reservations" ("trip_offer_id","buyer_id","food_item_id","freeform_text")
  WHERE status IN ('pending','confirmed');

CREATE TABLE IF NOT EXISTS "payouts" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "seller_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "trip_offer_id" uuid NOT NULL REFERENCES "trip_offers"("id") ON DELETE CASCADE,
  "amount_gross" numeric(10,2) NOT NULL,
  "amount_fee" numeric(10,2) NOT NULL,
  "amount_net" numeric(10,2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'EUR',
  "status" "payout_status" NOT NULL DEFAULT 'pending',
  "stripe_transfer_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "payouts_seller_idx" ON "payouts" ("seller_id");
CREATE INDEX IF NOT EXISTS "payouts_trip_idx" ON "payouts" ("trip_offer_id");
CREATE INDEX IF NOT EXISTS "payouts_status_idx" ON "payouts" ("status");
