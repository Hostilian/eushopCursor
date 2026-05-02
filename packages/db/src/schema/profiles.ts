import { sql } from 'drizzle-orm';
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    displayName: text('display_name').notNull(),
    bio: text('bio'),
    homeCountry: text('home_country'), // ISO2
    currentCountry: text('current_country'),
    currentCity: text('current_city'),
    currentCellGeohash: text('current_cell_geohash'), // privacy: ~5km
    preferredLocale: text('preferred_locale').notNull().default('en'),
    languagesSpoken: jsonb('languages_spoken').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    badges: jsonb('badges').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    successfulExchanges: integer('successful_exchanges').notNull().default(0),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    homeIdx: index('profiles_home_country_idx').on(t.homeCountry),
    currentIdx: index('profiles_current_country_idx').on(t.currentCountry),
    cellIdx: index('profiles_current_cell_idx').on(t.currentCellGeohash),
  }),
);

export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    blockerId: uuid('blocker_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    blockedId: uuid('blocked_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pairIdx: index('blocks_pair_idx').on(t.blockerId, t.blockedId),
  }),
);
