import { sql } from 'drizzle-orm';
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Tables required by Better Auth. Names and column shapes are kept compatible
 * with the Drizzle adapter so we can plug Better Auth straight in.
 */

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    name: text('name'),
    image: text('image'),
    role: text('role').notNull().default('user'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index('users_email_idx').on(t.email),
  }),
);

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    idToken: text('id_token'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('accounts_user_idx').on(t.userId),
    providerIdx: index('accounts_provider_idx').on(t.providerId, t.accountId),
  }),
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('sessions_user_idx').on(t.userId),
    tokenIdx: index('sessions_token_idx').on(t.token),
  }),
);

export const verifications = pgTable(
  'verifications',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    idIdx: index('verifications_identifier_idx').on(t.identifier),
  }),
);
