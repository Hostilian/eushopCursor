import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './auth.js';

export const deviceTokens = pgTable(
  'device_tokens',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(), // ios | android | web
    expoPushToken: text('expo_push_token').notNull().unique(),
    locale: text('locale').notNull().default('en'),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('device_tokens_user_idx').on(t.userId),
  }),
);

export const notificationKindEnum = pgEnum('notification_kind', [
  'new-message',
  'new-listing-match',
  'new-request-match',
  'review-received',
  'system',
]);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: notificationKindEnum('kind').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    data: jsonb('data').$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('notifications_user_idx').on(t.userId, t.readAt),
  }),
);

export const consents = pgTable(
  'consents',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    sessionId: text('session_id'),
    necessary: boolean('necessary').notNull().default(true),
    analytics: boolean('analytics').notNull().default(false),
    marketing: boolean('marketing').notNull().default(false),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('consents_user_idx').on(t.userId),
  }),
);
