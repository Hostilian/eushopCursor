import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

export const countries = pgTable(
  'countries',
  {
    iso2: text('iso2').primaryKey(),
    name: text('name').notNull(),
    flagEmoji: text('flag_emoji').notNull(),
    defaultLocale: text('default_locale').notNull().default('en'),
    currency: text('currency').notNull().default('EUR'),
    region: text('region').notNull(),
    blurb: text('blurb'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    regionIdx: index('countries_region_idx').on(t.region),
  }),
);

export const categories = pgTable(
  'categories',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    emoji: text('emoji'),
    sortOrder: integer('sort_order').notNull().default(100),
  },
  (t) => ({
    sortIdx: index('categories_sort_idx').on(t.sortOrder),
  }),
);

export const brands = pgTable(
  'brands',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    countryIso2: text('country_iso2')
      .notNull()
      .references(() => countries.iso2),
    blurb: text('blurb'),
  },
  (t) => ({
    countryIdx: index('brands_country_idx').on(t.countryIso2),
  }),
);

export const foodItems = pgTable(
  'food_items',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    aka: jsonb('aka')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    originCountryIso2: text('origin_country_iso2')
      .notNull()
      .references(() => countries.iso2),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    brandId: uuid('brand_id').references(() => brands.id),
    description: text('description').notNull(),
    descriptionTranslated: jsonb('description_translated')
      .$type<Record<string, string>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    tags: jsonb('tags')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    defaultImageUrl: text('default_image_url'),
    /** Open Food Facts is licensed CC-BY-SA 4.0; we surface attribution at the
     *  rendering layer. Variants come from `display_small_url` etc. */
    imageVariants: jsonb('image_variants')
      .$type<{ thumb?: string; small?: string; large?: string; source?: 'off' | 'r2' | 'user' }>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    /** GTIN-13 / GTIN-8. `unique` so each scanned barcode resolves to a single
     *  catalog row, regardless of where it came in from (OFF, manual, etc.). */
    barcode: text('barcode').unique(),
    /** Stable Open Food Facts identifier (their `code`). Lets the importer
     *  upsert without races and lets us reverse-link product detail pages. */
    openFoodFactsId: text('off_id').unique(),
    /** Set by a moderator when the item has been reviewed. Items with
     *  `verifiedAt = null` are pulled in automatically and remain visible
     *  but flagged in the admin queue. */
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    /** Set when the item was promoted from the UGC candidates table. */
    submittedById: uuid('submitted_by_id').references(() => users.id, { onDelete: 'set null' }),
    embedding: vector('embedding', { dimensions: 768 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    countryIdx: index('food_items_country_idx').on(t.originCountryIso2),
    categoryIdx: index('food_items_category_idx').on(t.categoryId),
    brandIdx: index('food_items_brand_idx').on(t.brandId),
    verifiedIdx: index('food_items_verified_idx').on(t.verifiedAt),
    nameTrgmIdx: index('food_items_name_trgm_idx').using('gin', sql`${t.name} gin_trgm_ops`),
  }),
);

/* ---------------------------------------------------------------- *
 * UGC catalog moderation pipeline                                   *
 *                                                                   *
 * Anyone signed in can propose a product they could not find. The   *
 * candidate sits in `food_item_candidates` until a moderator        *
 * approves, rejects, or merges it into an existing item. Image      *
 * proposals work the same way at the image level so a single        *
 * canonical product can accumulate alternate photos voted up by     *
 * the community.                                                    *
 * ---------------------------------------------------------------- */

export const foodItemCandidateStatus = pgEnum('food_item_candidate_status', [
  'pending',
  'approved',
  'rejected',
  'duplicate',
]);

export const foodItemCandidates = pgTable(
  'food_item_candidates',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    name: text('name').notNull(),
    aka: jsonb('aka')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    categorySlug: text('category_slug').notNull(),
    originCountryIso2: text('origin_country_iso2').notNull(),
    description: text('description'),
    proposedImages: jsonb('proposed_images')
      .$type<Array<{ url: string; source?: string }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    /** Optional GTIN-13 / GTIN-8 the submitter scanned. Lets the moderator
     *  spot a duplicate of an already-imported OFF item before approving. */
    barcode: text('barcode'),
    submittedById: uuid('submitted_by_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: foodItemCandidateStatus('status').notNull().default('pending'),
    mergedIntoItemId: uuid('merged_into_item_id').references(() => foodItems.id, {
      onDelete: 'set null',
    }),
    moderatorId: uuid('moderator_id').references(() => users.id, { onDelete: 'set null' }),
    moderatorNote: text('moderator_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index('food_item_candidates_status_idx').on(t.status),
    submitterIdx: index('food_item_candidates_submitter_idx').on(t.submittedById),
    /** Moderation queue scans by `(status, created_at desc)`. */
    queueIdx: index('food_item_candidates_queue_idx').on(t.status, t.createdAt),
    barcodeIdx: index('food_item_candidates_barcode_idx').on(t.barcode),
  }),
);

export const foodItemImageProposalStatus = pgEnum('food_item_image_proposal_status', [
  'pending',
  'approved',
  'rejected',
]);

export const foodItemImageProposals = pgTable(
  'food_item_image_proposals',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    foodItemId: uuid('food_item_id')
      .notNull()
      .references(() => foodItems.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    /** Origin tag — `'r2'` for our presigned uploads, `'user-url'` for paste,
     *  `'off'` for Open Food Facts auto-imported alternates. */
    source: text('source').notNull().default('r2'),
    submittedById: uuid('submitted_by_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: foodItemImageProposalStatus('status').notNull().default('pending'),
    votes: integer('votes').notNull().default(0),
    moderatorId: uuid('moderator_id').references(() => users.id, { onDelete: 'set null' }),
    moderatorNote: text('moderator_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    itemIdx: index('food_item_image_proposals_item_idx').on(t.foodItemId, t.status),
    submitterIdx: index('food_item_image_proposals_submitter_idx').on(t.submittedById),
    /** Moderation queue: pending first, then by votes desc, then by recency. */
    queueIdx: index('food_item_image_proposals_queue_idx').on(t.status, t.votes, t.createdAt),
    /** Same user can't propose the same URL on the same item twice. */
    uniqueUrl: uniqueIndex('food_item_image_proposals_uniq').on(
      t.foodItemId,
      t.submittedById,
      t.url,
    ),
  }),
);

export const foodItemImageVotes = pgTable(
  'food_item_image_votes',
  {
    proposalId: uuid('proposal_id')
      .notNull()
      .references(() => foodItemImageProposals.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex('food_item_image_votes_pk').on(t.proposalId, t.userId),
  }),
);
