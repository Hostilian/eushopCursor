import { tractionWeeklyGrowthInput } from '@eushop/validators';
import { sql } from 'drizzle-orm';
import { listings, profiles, requests, tripOffers, tripReservations, users } from '@eushop/db';
import { publicProcedure, router } from '../trpc';

/**
 * Live counters used by the public `/traction` page and the admin dashboard.
 *
 * This router never consults the showcase / demo dataset. Even when the
 * database is empty, it returns honest zeros — investors are looking at this
 * page specifically to read real numbers.
 */
export const tractionRouter = router({
  liveCounts: publicProcedure.query(async ({ ctx }) => {
    const empty = {
      signups: 0,
      profiles: 0,
      listings: 0,
      requests: 0,
      tripsPosted: 0,
      reservationsConfirmed: 0,
      reservationsCompleted: 0,
      gmvCents: 0,
      platformFeeCents: 0,
      countriesActive: 0,
    };
    try {
      const [u] = await ctx.db.select({ c: sql<number>`count(*)::int` }).from(users);
      const [p] = await ctx.db.select({ c: sql<number>`count(*)::int` }).from(profiles);
      const [l] = await ctx.db.select({ c: sql<number>`count(*)::int` }).from(listings);
      const [r] = await ctx.db.select({ c: sql<number>`count(*)::int` }).from(requests);
      const [t] = await ctx.db.select({ c: sql<number>`count(*)::int` }).from(tripOffers);
      const [rc] = await ctx.db
        .select({ c: sql<number>`count(*)::int` })
        .from(tripReservations)
        .where(sql`status = 'confirmed'`);
      const [rcd] = await ctx.db
        .select({ c: sql<number>`count(*)::int` })
        .from(tripReservations)
        .where(sql`status = 'completed'`);
      const [gmv] = await ctx.db
        .select({
          gross: sql<number>`coalesce(sum(agreed_finder_fee * 100)::int, 0)`,
          fee: sql<number>`coalesce(sum(platform_fee * 100)::int, 0)`,
        })
        .from(tripReservations)
        .where(sql`status IN ('completed','confirmed')`);
      const [countries] = await ctx.db
        .select({
          c: sql<number>`count(distinct origin_country_iso2)::int + count(distinct destination_country_iso2)::int`,
        })
        .from(tripOffers);

      return {
        signups: u?.c ?? 0,
        profiles: p?.c ?? 0,
        listings: l?.c ?? 0,
        requests: r?.c ?? 0,
        tripsPosted: t?.c ?? 0,
        reservationsConfirmed: rc?.c ?? 0,
        reservationsCompleted: rcd?.c ?? 0,
        gmvCents: gmv?.gross ?? 0,
        platformFeeCents: gmv?.fee ?? 0,
        countriesActive: countries?.c ?? 0,
      };
    } catch {
      return empty;
    }
  }),

  /** Last-N-days roll-up for sparkline rendering. */
  weeklyGrowth: publicProcedure.input(tractionWeeklyGrowthInput).query(async ({ ctx, input }) => {
    const weeks = input?.weeks ?? 12;
    try {
      const rows = await ctx.db.execute<{
        week: string;
        signups: number;
        trips: number;
        reservations: number;
      }>(sql`
          WITH series AS (
            SELECT generate_series(
              date_trunc('week', now()) - (${weeks - 1} || ' weeks')::interval,
              date_trunc('week', now()),
              '1 week'
            ) AS week
          )
          SELECT
            to_char(s.week, 'IYYY-IW') AS week,
            (SELECT count(*)::int FROM users WHERE date_trunc('week', created_at) = s.week) AS signups,
            (SELECT count(*)::int FROM trip_offers WHERE date_trunc('week', created_at) = s.week) AS trips,
            (SELECT count(*)::int FROM trip_reservations WHERE date_trunc('week', created_at) = s.week) AS reservations
          FROM series s
          ORDER BY s.week ASC
        `);
      const list =
        (
          rows as unknown as {
            rows: Array<{ week: string; signups: number; trips: number; reservations: number }>;
          }
        ).rows ??
        (rows as unknown as Array<{
          week: string;
          signups: number;
          trips: number;
          reservations: number;
        }>);
      return Array.isArray(list) ? list : [];
    } catch {
      return Array.from({ length: weeks }, (_v, i) => ({
        week: `w${i + 1}`,
        signups: 0,
        trips: 0,
        reservations: 0,
      }));
    }
  }),
});
