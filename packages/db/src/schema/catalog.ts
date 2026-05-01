import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

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
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
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
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
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
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    aka: jsonb('aka').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
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
    tags: jsonb('tags').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    defaultImageUrl: text('default_image_url'),
    embedding: vector('embedding', { dimensions: 768 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    countryIdx: index('food_items_country_idx').on(t.originCountryIso2),
    categoryIdx: index('food_items_category_idx').on(t.categoryId),
    brandIdx: index('food_items_brand_idx').on(t.brandId),
    nameTrgmIdx: index('food_items_name_trgm_idx').using(
      'gin',
      sql`${t.name} gin_trgm_ops`,
    ),
  }),
);
