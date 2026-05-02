import { profileUpdateInput } from '@eushop/validators';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { profiles, users } from '@eushop/db';
import { protectedProcedure, publicProcedure, router } from '../trpc.js';

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.user.id),
    });
    return { user: ctx.user, profile };
  }),

  upsert: protectedProcedure.input(profileUpdateInput).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.user.id),
    });
    if (existing) {
      const [updated] = await ctx.db
        .update(profiles)
        .set({
          displayName: input.displayName ?? existing.displayName,
          bio: input.bio ?? existing.bio,
          homeCountry: input.homeCountry ?? existing.homeCountry,
          currentCountry: input.currentCountry ?? existing.currentCountry,
          currentCity: input.currentCity ?? existing.currentCity,
          preferredLocale: input.preferredLocale ?? existing.preferredLocale,
          languagesSpoken: input.languagesSpoken ?? existing.languagesSpoken,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, ctx.user.id))
        .returning();
      return updated;
    }
    const [created] = await ctx.db
      .insert(profiles)
      .values({
        userId: ctx.user.id,
        displayName: input.displayName ?? ctx.user.name ?? ctx.user.email.split('@')[0]!,
        bio: input.bio,
        homeCountry: input.homeCountry,
        currentCountry: input.currentCountry,
        currentCity: input.currentCity,
        preferredLocale: input.preferredLocale ?? 'en',
        languagesSpoken: input.languagesSpoken ?? [],
      })
      .returning();
    return created;
  }),

  byUserId: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.profiles.findFirst({ where: eq(profiles.userId, input.userId) });
    }),

  exportMyData: protectedProcedure.query(async ({ ctx }) => {
    // GDPR Art. 20 — right to data portability
    const profile = await ctx.db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.user.id),
    });
    return {
      generatedAt: new Date().toISOString(),
      user: ctx.user,
      profile,
    };
  }),

  deleteMyAccount: protectedProcedure.mutation(async ({ ctx }) => {
    // GDPR Art. 17 — delete the auth user; FK cascades clear profiles, listings, requests, etc.
    await ctx.db.delete(users).where(eq(users.id, ctx.user.id));
    return { ok: true };
  }),
});
