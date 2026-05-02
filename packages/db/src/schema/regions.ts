import { sql } from 'drizzle-orm';
import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { countries } from './catalog';

/**
 * Optional sub-national regions for nicer browsing (e.g. Bavaria, Catalonia).
 * Seeded lightly; admin grows the tree.
 */
export const regions = pgTable(
  'regions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    countryIso2: text('country_iso2')
      .notNull()
      .references(() => countries.iso2, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    sortOrder: integer('sort_order').notNull().default(100),
  },
  (t) => ({
    countrySlugUq: index('regions_country_slug_idx').on(t.countryIso2, t.slug),
  }),
);
