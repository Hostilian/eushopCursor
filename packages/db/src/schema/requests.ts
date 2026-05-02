import { sql } from 'drizzle-orm';
import {
  boolean,
  customType,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { foodItems } from './catalog';

const geographyPoint = customType<{ data: { lat: number; lng: number }; driverData: string }>({
  dataType() {
    return 'geography(Point, 4326)';
  },
  toDriver(value) {
    return `SRID=4326;POINT(${value.lng} ${value.lat})`;
  },
});

export const requestStatusEnum = pgEnum('request_status', [
  'open',
  'matched',
  'fulfilled',
  'expired',
  'closed',
]);

export const requests = pgTable(
  'requests',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    buyerId: uuid('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    foodItemId: uuid('food_item_id').references(() => foodItems.id),
    freeformText: text('freeform_text').notNull(),
    notes: text('notes'),
    maxFinderFee: numeric('max_finder_fee', { precision: 8, scale: 2 }),
    currency: text('currency').notNull().default('EUR'),

    location: geographyPoint('location').notNull(),
    cellGeohash: text('cell_geohash').notNull(),
    approximateCity: text('approximate_city').notNull(),
    countryIso2: text('country_iso2').notNull(),
    radiusKm: integer('radius_km').notNull().default(25),

    notifyOnMatch: boolean('notify_on_match').notNull().default(true),
    status: requestStatusEnum('status').notNull().default('open'),

    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    buyerIdx: index('requests_buyer_idx').on(t.buyerId),
    foodItemIdx: index('requests_food_item_idx').on(t.foodItemId),
    cellIdx: index('requests_cell_idx').on(t.cellGeohash),
    statusIdx: index('requests_status_idx').on(t.status),
    locationIdx: index('requests_location_idx').using('gist', t.location),
  }),
);
