ALTER TABLE "food_item_image_proposals"
  ADD COLUMN IF NOT EXISTS "moderator_id" uuid REFERENCES "users"("id") ON DELETE SET NULL;
ALTER TABLE "food_item_image_proposals"
  ADD COLUMN IF NOT EXISTS "moderator_note" text;
