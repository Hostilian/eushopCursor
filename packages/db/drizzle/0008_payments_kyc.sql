-- Stripe Connect, reservation payments, financial events audit, KYC sessions.

CREATE TYPE "connect_account_status" AS ENUM ('pending', 'restricted', 'active', 'disabled');

CREATE TABLE IF NOT EXISTS "connect_accounts" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "stripe_account_id" text NOT NULL UNIQUE,
  "country_iso2" text NOT NULL,
  "charges_enabled" boolean NOT NULL DEFAULT false,
  "payouts_enabled" boolean NOT NULL DEFAULT false,
  "details_submitted" boolean NOT NULL DEFAULT false,
  "requirements_currently_due" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "requirements_disabled_reason" text,
  "status" "connect_account_status" NOT NULL DEFAULT 'pending',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "connect_accounts_user_idx" ON "connect_accounts" ("user_id");
CREATE INDEX IF NOT EXISTS "connect_accounts_status_idx" ON "connect_accounts" ("status");

CREATE TABLE IF NOT EXISTS "reservation_payments" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "reservation_id" uuid NOT NULL UNIQUE REFERENCES "trip_reservations"("id") ON DELETE CASCADE,
  "seller_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "buyer_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "seller_stripe_account_id" text NOT NULL,
  "stripe_payment_intent_id" text UNIQUE,
  "stripe_charge_id" text,
  "stripe_transfer_id" text,
  "amount_total_cents" numeric(12, 0) NOT NULL,
  "amount_platform_fee_cents" numeric(12, 0) NOT NULL,
  "amount_seller_cents" numeric(12, 0) NOT NULL,
  "currency" text NOT NULL DEFAULT 'EUR',
  "status" text NOT NULL DEFAULT 'requires_payment_method',
  "captured_at" timestamptz,
  "cancelled_at" timestamptz,
  "refunded_at" timestamptz,
  "disputed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "reservation_payments_reservation_idx" ON "reservation_payments" ("reservation_id");
CREATE INDEX IF NOT EXISTS "reservation_payments_seller_idx" ON "reservation_payments" ("seller_user_id");
CREATE INDEX IF NOT EXISTS "reservation_payments_status_idx" ON "reservation_payments" ("status");

CREATE TYPE "financial_event_kind" AS ENUM (
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
  'connect.account.updated'
);

CREATE TABLE IF NOT EXISTS "financial_events" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "kind" "financial_event_kind" NOT NULL,
  "stripe_event_id" text UNIQUE,
  "stripe_object_id" text,
  "reservation_id" uuid REFERENCES "trip_reservations"("id") ON DELETE SET NULL,
  "trip_offer_id" uuid REFERENCES "trip_offers"("id") ON DELETE SET NULL,
  "seller_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "buyer_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "amount_cents" numeric(12, 0),
  "currency" text,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "financial_events_kind_idx" ON "financial_events" ("kind");
CREATE INDEX IF NOT EXISTS "financial_events_seller_idx" ON "financial_events" ("seller_user_id");
CREATE INDEX IF NOT EXISTS "financial_events_reservation_idx" ON "financial_events" ("reservation_id");
CREATE INDEX IF NOT EXISTS "financial_events_trip_idx" ON "financial_events" ("trip_offer_id");
CREATE INDEX IF NOT EXISTS "financial_events_object_idx" ON "financial_events" ("stripe_object_id");

CREATE TYPE "kyc_provider" AS ENUM ('veriff', 'onfido', 'manual');
CREATE TYPE "kyc_status" AS ENUM ('pending', 'in-review', 'verified', 'rejected', 'expired');

CREATE TABLE IF NOT EXISTS "kyc_sessions" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" "kyc_provider" NOT NULL,
  "external_id" text NOT NULL,
  "status" "kyc_status" NOT NULL DEFAULT 'pending',
  "verified_country_iso2" text,
  "rejection_reason" text,
  "verified_at" timestamptz,
  "expires_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "kyc_sessions_user_idx" ON "kyc_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "kyc_sessions_status_idx" ON "kyc_sessions" ("status");
CREATE UNIQUE INDEX IF NOT EXISTS "kyc_sessions_external_uniq" ON "kyc_sessions" ("provider", "external_id");
