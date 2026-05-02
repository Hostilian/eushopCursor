/**
 * Stripe Connect + KYC + financial-event tables.
 *
 * The trip marketplace charges a per-reservation `application_fee_amount` on
 * the seller's connected account. Each Stripe object that affects the books
 * (PaymentIntent state changes, charges, refunds, transfers, payouts,
 * disputes) is mirrored into `financial_events` so the admin can prove
 * the take-rate to investors and so reconciliation does not depend on the
 * Stripe dashboard being reachable.
 *
 * KYC lives next to payments because identity verification is a hard
 * pre-requisite for moving money through Connect Express in EU markets.
 */

import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
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
import { tripOffers, tripReservations } from './trips';

/* -------------------------------------------------------------- *
 * Stripe Connect: the seller side of every reservation.          *
 * -------------------------------------------------------------- */

export const connectAccountStatusEnum = pgEnum('connect_account_status', [
  'pending',
  'restricted',
  'active',
  'disabled',
]);

export const connectAccounts = pgTable(
  'connect_accounts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Stripe account id (acct_…). Set as soon as we create the Express account. */
    stripeAccountId: text('stripe_account_id').notNull().unique(),
    countryIso2: text('country_iso2').notNull(),
    chargesEnabled: boolean('charges_enabled').notNull().default(false),
    payoutsEnabled: boolean('payouts_enabled').notNull().default(false),
    detailsSubmitted: boolean('details_submitted').notNull().default(false),
    /** Mirror of `requirements.currently_due` from Stripe so the admin UI can
     *  surface what is missing without a Stripe round-trip. */
    requirementsCurrentlyDue: jsonb('requirements_currently_due')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    requirementsDisabledReason: text('requirements_disabled_reason'),
    status: connectAccountStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('connect_accounts_user_idx').on(t.userId),
    statusIdx: index('connect_accounts_status_idx').on(t.status),
  }),
);

/* -------------------------------------------------------------- *
 * Reservation payment intent linkage.                            *
 *                                                                *
 * We do not move PaymentIntent/Charge identifiers onto the       *
 * `trip_reservations` row directly because that table predates    *
 * payments. A 1:1 sidecar keeps the reservation schema clean and *
 * lets us add multiple captures (e.g. partial refunds) later.    *
 * -------------------------------------------------------------- */

export const reservationPayments = pgTable(
  'reservation_payments',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    reservationId: uuid('reservation_id')
      .notNull()
      .unique()
      .references(() => tripReservations.id, { onDelete: 'cascade' }),
    sellerUserId: uuid('seller_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    buyerUserId: uuid('buyer_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sellerStripeAccountId: text('seller_stripe_account_id').notNull(),
    stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
    stripeChargeId: text('stripe_charge_id'),
    stripeTransferId: text('stripe_transfer_id'),
    amountTotalCents: numeric('amount_total_cents', { precision: 12, scale: 0 }).notNull(),
    amountPlatformFeeCents: numeric('amount_platform_fee_cents', {
      precision: 12,
      scale: 0,
    }).notNull(),
    amountSellerCents: numeric('amount_seller_cents', { precision: 12, scale: 0 }).notNull(),
    currency: text('currency').notNull().default('EUR'),
    /** Mirrors PI.status from Stripe. */
    status: text('status').notNull().default('requires_payment_method'),
    capturedAt: timestamp('captured_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    refundedAt: timestamp('refunded_at', { withTimezone: true }),
    disputedAt: timestamp('disputed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    reservationIdx: index('reservation_payments_reservation_idx').on(t.reservationId),
    sellerIdx: index('reservation_payments_seller_idx').on(t.sellerUserId),
    statusIdx: index('reservation_payments_status_idx').on(t.status),
  }),
);

/* -------------------------------------------------------------- *
 * Append-only money audit trail.                                  *
 * -------------------------------------------------------------- */

export const financialEventKindEnum = pgEnum('financial_event_kind', [
  'payment_intent.created',
  'payment_intent.requires_action',
  'payment_intent.succeeded',
  'payment_intent.canceled',
  'charge.captured',
  'charge.refunded',
  'charge.dispute.created',
  'charge.dispute.closed',
  'transfer.created',
  'transfer.failed',
  'payout.paid',
  'payout.failed',
  'connect.account.updated',
]);

export const financialEvents = pgTable(
  'financial_events',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    kind: financialEventKindEnum('kind').notNull(),
    /** Stripe event id (`evt_…`). Unique so retries are idempotent. */
    stripeEventId: text('stripe_event_id').unique(),
    /** Stripe object id this event is about (`pi_…`, `ch_…`, `tr_…`, …). */
    stripeObjectId: text('stripe_object_id'),
    reservationId: uuid('reservation_id').references(() => tripReservations.id, {
      onDelete: 'set null',
    }),
    tripOfferId: uuid('trip_offer_id').references(() => tripOffers.id, { onDelete: 'set null' }),
    sellerUserId: uuid('seller_user_id').references(() => users.id, { onDelete: 'set null' }),
    buyerUserId: uuid('buyer_user_id').references(() => users.id, { onDelete: 'set null' }),
    amountCents: numeric('amount_cents', { precision: 12, scale: 0 }),
    currency: text('currency'),
    payload: jsonb('payload')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    kindIdx: index('financial_events_kind_idx').on(t.kind),
    sellerIdx: index('financial_events_seller_idx').on(t.sellerUserId),
    reservationIdx: index('financial_events_reservation_idx').on(t.reservationId),
    tripIdx: index('financial_events_trip_idx').on(t.tripOfferId),
    objectIdx: index('financial_events_object_idx').on(t.stripeObjectId),
  }),
);

/* -------------------------------------------------------------- *
 * KYC sessions (Veriff/Onfido). Verification gates Connect.       *
 * -------------------------------------------------------------- */

export const kycProviderEnum = pgEnum('kyc_provider', ['veriff', 'onfido', 'manual']);
export const kycStatusEnum = pgEnum('kyc_status', [
  'pending',
  'in-review',
  'verified',
  'rejected',
  'expired',
]);

export const kycSessions = pgTable(
  'kyc_sessions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: kycProviderEnum('provider').notNull(),
    externalId: text('external_id').notNull(),
    status: kycStatusEnum('status').notNull().default('pending'),
    verifiedCountryIso2: text('verified_country_iso2'),
    rejectionReason: text('rejection_reason'),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('kyc_sessions_user_idx').on(t.userId),
    statusIdx: index('kyc_sessions_status_idx').on(t.status),
    externalUniq: uniqueIndex('kyc_sessions_external_uniq').on(t.provider, t.externalId),
  }),
);
