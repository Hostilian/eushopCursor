import { tractionWeeklyGrowthInput } from '@eushop/validators';
import { sql } from 'drizzle-orm';
import { listings, profiles, requests, tripOffers, tripReservations, users } from '@eushop/db';
import { publicProcedure, router } from '../trpc';

/**
 * Live counters used by the public `/traction` page and the admin dashboard.
 *
 * This router reads the database only — never static marketing fallbacks. Even when the
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
      activeSellers: 0,
      reservationsConfirmed: 0,
      reservationsCompleted: 0,
      gmvCents: 0,
      platformFeeCents: 0,
      countriesActive: 0,
    };
    try {
      const [[u], [p], [l], [r], [t], activeSellerRows, [reservationCounts], [gmv], [countries]] =
        await Promise.all([
          ctx.db.select({ c: sql<number>`count(*)::int` }).from(users),
          ctx.db.select({ c: sql<number>`count(*)::int` }).from(profiles),
          ctx.db.select({ c: sql<number>`count(*)::int` }).from(listings),
          ctx.db.select({ c: sql<number>`count(*)::int` }).from(requests),
          ctx.db.select({ c: sql<number>`count(*)::int` }).from(tripOffers),
          ctx.db.execute<{ c: number }>(sql`
          select count(*)::int as c
          from (
            select seller_id from trip_offers
            union
            select seller_id from listings
          ) as sellers
        `),
          ctx.db
            .select({
              confirmed: sql<number>`count(*) filter (where status = 'confirmed')::int`,
              completed: sql<number>`count(*) filter (where status = 'completed')::int`,
            })
            .from(tripReservations),
          ctx.db
            .select({
              gross: sql<number>`coalesce(sum(agreed_finder_fee * 100)::int, 0)`,
              fee: sql<number>`coalesce(sum(platform_fee * 100)::int, 0)`,
            })
            .from(tripReservations)
            .where(sql`status IN ('completed','confirmed')`),
          ctx.db
            .select({
              c: sql<number>`count(distinct origin_country_iso2)::int + count(distinct destination_country_iso2)::int`,
            })
            .from(tripOffers),
        ]);

      const activeSellers =
        (
          activeSellerRows as unknown as {
            rows?: Array<{ c: number }>;
          }
        ).rows?.[0]?.c ?? 0;

      return {
        signups: u?.c ?? 0,
        profiles: p?.c ?? 0,
        listings: l?.c ?? 0,
        requests: r?.c ?? 0,
        tripsPosted: t?.c ?? 0,
        activeSellers,
        reservationsConfirmed: reservationCounts?.confirmed ?? 0,
        reservationsCompleted: reservationCounts?.completed ?? 0,
        gmvCents: gmv?.gross ?? 0,
        platformFeeCents: gmv?.fee ?? 0,
        countriesActive: countries?.c ?? 0,
      };
    } catch (e) {
      console.error('[traction.liveCounts] DB read failed; returning zeros', e);
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
          ),
          user_counts AS (
            SELECT date_trunc('week', created_at) AS week, count(*)::int AS signups
            FROM users
            WHERE created_at >= date_trunc('week', now()) - (${weeks - 1} || ' weeks')::interval
            GROUP BY 1
          ),
          trip_counts AS (
            SELECT date_trunc('week', created_at) AS week, count(*)::int AS trips
            FROM trip_offers
            WHERE created_at >= date_trunc('week', now()) - (${weeks - 1} || ' weeks')::interval
            GROUP BY 1
          ),
          reservation_counts AS (
            SELECT date_trunc('week', created_at) AS week, count(*)::int AS reservations
            FROM trip_reservations
            WHERE created_at >= date_trunc('week', now()) - (${weeks - 1} || ' weeks')::interval
            GROUP BY 1
          )
          SELECT
            to_char(s.week, 'IYYY-IW') AS week,
            coalesce(u.signups, 0)::int AS signups,
            coalesce(t.trips, 0)::int AS trips,
            coalesce(r.reservations, 0)::int AS reservations
          FROM series s
          LEFT JOIN user_counts u ON u.week = s.week
          LEFT JOIN trip_counts t ON t.week = s.week
          LEFT JOIN reservation_counts r ON r.week = s.week
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
