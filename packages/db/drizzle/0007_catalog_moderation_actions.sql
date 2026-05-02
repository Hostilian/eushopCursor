-- Extend moderation_action_type with catalog UGC actions so the same audit
-- table powers the /audit page for both report queues and catalog reviews.
ALTER TYPE "moderation_action_type" ADD VALUE IF NOT EXISTS 'catalog_approve_item';
ALTER TYPE "moderation_action_type" ADD VALUE IF NOT EXISTS 'catalog_reject_item';
ALTER TYPE "moderation_action_type" ADD VALUE IF NOT EXISTS 'catalog_duplicate_item';
ALTER TYPE "moderation_action_type" ADD VALUE IF NOT EXISTS 'catalog_approve_image';
ALTER TYPE "moderation_action_type" ADD VALUE IF NOT EXISTS 'catalog_reject_image';
