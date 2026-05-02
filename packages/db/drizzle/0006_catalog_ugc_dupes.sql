-- Catalog UGC: barcode column on candidates + composite moderation queue indexes.

ALTER TABLE "food_item_candidates" ADD COLUMN IF NOT EXISTS "barcode" text;

CREATE INDEX IF NOT EXISTS "food_item_candidates_queue_idx"
  ON "food_item_candidates" ("status", "created_at");

CREATE INDEX IF NOT EXISTS "food_item_candidates_barcode_idx"
  ON "food_item_candidates" ("barcode");

CREATE INDEX IF NOT EXISTS "food_item_image_proposals_queue_idx"
  ON "food_item_image_proposals" ("status", "votes", "created_at");
