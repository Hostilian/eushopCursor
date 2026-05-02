/**
 * Trip & reservation tables.
 *
 * Eushop's monetisable primitive is a *trip offer*: a traveler publishes a real
 * route (city/location-first, multi-leg supported), dates, spare luggage capacity
 * (volume, dimensions, weight), and pricing mode (fixed or bid). Buyers reserve
 * capacity; each reservation locks fees + platform cut when the seller marks
 * the reservation completed.
 *
 * The table layout intentionally mirrors `listings` and `requests` so that
 * geo helpers (`@eushop/geo`), the messaging spine, and the Inngest match
 * pipeline can all operate on a uniform shape.
 */

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
  uniqueIndex,
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

export const tripOfferStatus = pgEnum('trip_offer_status', [
  'draft',
  'open',
  'closed',
  'in-transit',
  'completed',
  'cancelled',
]);

export const tripOffers = pgTable(
  'trip_offers',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    originCountryIso2: text('origin_country_iso2').notNull(),
    originCity: text('origin_city').notNull(),
    /** Coarse origin point for searching ("flying out of Warsaw"). Stored
     *  precisely on the server so geo helpers work; clients only see the
     *  cell hash. */
    originLocation: geographyPoint('origin_location').notNull(),
    cellGeohashOrigin: text('cell_geohash_origin').notNull(),

    destinationCountryIso2: text('destination_country_iso2').notNull(),
    destinationCity: text('destination_city').notNull(),
    destinationLocation: geographyPoint('destination_location').notNull(),
    cellGeohashDestination: text('cell_geohash_destination').notNull(),

    departAt: timestamp('depart_at', { withTimezone: true }).notNull(),
    returnAt: timestamp('return_at', { withTimezone: true }),

    slotsTotal: integer('slots_total').notNull(),
    slotsAvailable: integer('slots_available').notNull(),
    defaultPerSlotFee: numeric('default_per_slot_fee', { precision: 8, scale: 2 })
      .notNull()
      .default('5'),
    currency: text('currency').notNull().default('EUR'),
    notes: text('notes'),
    /** Items the seller commits to bringing back regardless of reservations.
     *  Helps the matcher prioritise this trip for buyers asking for those. */
    intendedItemIds: jsonb('intended_item_ids')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    status: tripOfferStatus('status').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sellerIdx: index('trip_offers_seller_idx').on(t.sellerId),
    originIdx: index('trip_offers_origin_idx').on(t.originCountryIso2, t.cellGeohashOrigin),
    destIdx: index('trip_offers_dest_idx').on(t.destinationCountryIso2, t.cellGeohashDestination),
    statusIdx: index('trip_offers_status_idx').on(t.status, t.departAt),
    departIdx: index('trip_offers_depart_idx').on(t.departAt),
    /** GIST indexes on the geography columns make `ST_DWithin` queries fast. */
    originLocIdx: index('trip_offers_origin_loc_idx').using('gist', t.originLocation),
    destLocIdx: index('trip_offers_dest_loc_idx').using('gist', t.destinationLocation),
  }),
);

export const tripReservationStatus = pgEnum('trip_reservation_status', [
  'pending',
  'confirmed',
  'seller-rejected',
  'expired',
  'completed',
  'disputed',
  'refunded',
  'cancelled',
]);

export const tripReservations = pgTable(
  'trip_reservations',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    tripOfferId: uuid('trip_offer_id')
      .notNull()
      .references(() => tripOffers.id, { onDelete: 'cascade' }),
    buyerId: uuid('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    /** Optional canonical product if the buyer picked one. Otherwise the
     *  `freeformText` carries the literal phrasing they used. */
    foodItemId: uuid('food_item_id').references(() => foodItems.id, { onDelete: 'set null' }),
    freeformText: text('freeform_text').notNull(),
    qty: integer('qty').notNull().default(1),

    /** What the seller and buyer agreed on for this reservation. */
    agreedFinderFee: numeric('agreed_finder_fee', { precision: 8, scale: 2 }).notNull(),
    /** Eushop's cut. Calculated server-side at reservation time and frozen
     *  here so future price-rule changes never re-bill an existing booking. */
    platformFee: numeric('platform_fee', { precision: 8, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('EUR'),

    status: tripReservationStatus('status').notNull().default('pending'),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancellationReason: text('cancellation_reason'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tripIdx: index('trip_reservations_trip_idx').on(t.tripOfferId, t.status),
    buyerIdx: index('trip_reservations_buyer_idx').on(t.buyerId),
    foodIdx: index('trip_reservations_food_idx').on(t.foodItemId),
    /** Soft uniqueness — buyer can have multiple reservations on the same
     *  trip, but only one *active* per buyer+trip+item combo. */
    activeUniq: uniqueIndex('trip_reservations_active_uniq')
      .on(t.tripOfferId, t.buyerId, t.foodItemId, t.freeformText)
      .where(sql`status IN ('pending','confirmed')`),
  }),
);

export const payoutStatus = pgEnum('payout_status', [
  'pending',
  'in-transit',
  'paid',
  'failed',
  'refunded',
]);

/**
 * Payouts skeleton. Real Stripe Connect transfer wiring lands with the next
 * milestone — schema is here so the trip-completion path can already record
 * the financial side of an exchange and the admin can prove a take rate to
 * investors auditing the codebase.
 */
export const payouts = pgTable(
  'payouts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tripOfferId: uuid('trip_offer_id')
      .notNull()
      .references(() => tripOffers.id, { onDelete: 'cascade' }),
    /** GMV: sum of agreedFinderFee on all completed reservations. */
    amountGross: numeric('amount_gross', { precision: 10, scale: 2 }).notNull(),
    /** Sum of platformFee on those reservations. */
    amountFee: numeric('amount_fee', { precision: 10, scale: 2 }).notNull(),
    /** What we owe the seller. */
    amountNet: numeric('amount_net', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('EUR'),
    status: payoutStatus('status').notNull().default('pending'),
    stripeTransferId: text('stripe_transfer_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sellerIdx: index('payouts_seller_idx').on(t.sellerId),
    tripIdx: index('payouts_trip_idx').on(t.tripOfferId),
    statusIdx: index('payouts_status_idx').on(t.status),
  }),
);
