import { sql } from 'drizzle-orm';
import {
  customType,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './auth.js';
import { foodItems } from './catalog.js';

/**
 * Drizzle doesn't ship a PostGIS type, so we declare a custom column. The DB
 * value is stored as `geography(Point, 4326)` and we use raw SQL helpers
 * (ST_MakePoint, ST_DWithin) at query time.
 */
const geographyPoint = customType<{ data: { lat: number; lng: number }; driverData: string }>({
  dataType() {
    return 'geography(Point, 4326)';
  },
  toDriver(value) {
    return `SRID=4326;POINT(${value.lng} ${value.lat})`;
  },
});

export const freshnessEnum = pgEnum('freshness_window', [
  'today',
  '3-days',
  'week',
  'month',
  'shelf-stable',
]);

export const listingStatusEnum = pgEnum('listing_status', [
  'draft',
  'live',
  'reserved',
  'completed',
  'expired',
  'removed',
]);

export const listings = pgTable(
  'listings',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    foodItemId: uuid('food_item_id').references(() => foodItems.id),
    freeformName: text('freeform_name'),
    brandName: text('brand_name'),
    notes: text('notes'),
    qty: integer('qty').notNull().default(1),
    unit: text('unit').notNull().default('item'),
    finderFee: numeric('finder_fee', { precision: 8, scale: 2 }).notNull().default('0'),
    currency: text('currency').notNull().default('EUR'),
    freshness: freshnessEnum('freshness').notNull().default('week'),
    status: listingStatusEnum('status').notNull().default('live'),

    // Location: precise (server-side) + display cell (clients only ever see this)
    location: geographyPoint('location').notNull(),
    indexGeohash: text('index_geohash').notNull(),
    cellGeohash: text('cell_geohash').notNull(),
    approximateCity: text('approximate_city').notNull(),
    countryIso2: text('country_iso2').notNull(),

    photos: jsonb('photos')
      .$type<Array<{ url: string; width?: number; height?: number; blurhash?: string }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sellerIdx: index('listings_seller_idx').on(t.sellerId),
    foodItemIdx: index('listings_food_item_idx').on(t.foodItemId),
    cellIdx: index('listings_cell_idx').on(t.cellGeohash),
    countryIdx: index('listings_country_idx').on(t.countryIso2),
    statusIdx: index('listings_status_idx').on(t.status),
    locationIdx: index('listings_location_idx').using('gist', t.location),
    createdIdx: index('listings_created_idx').on(t.createdAt),
  }),
);
