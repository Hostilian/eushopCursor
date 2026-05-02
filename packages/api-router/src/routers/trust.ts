import { submitReportInput, submitReviewInput } from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { conversations, moderationActions, profiles, reports, reviews, users } from '@eushop/db';
import { adminProcedure, protectedProcedure, publicProcedure, router } from '../trpc';

export const trustRouter = router({
  reviewsForUser: publicProcedure
    .input(
      z.object({ userId: z.string().uuid(), limit: z.number().int().min(1).max(40).default(10) }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(reviews)
        .where(eq(reviews.revieweeId, input.userId))
        .limit(input.limit);
    }),

  submitReview: protectedProcedure.input(submitReviewInput).mutation(async ({ ctx, input }) => {
    const conv = await ctx.db.query.conversations.findFirst({
      where: eq(conversations.id, input.conversationId),
    });
    if (!conv) throw new TRPCError({ code: 'NOT_FOUND' });
    if (conv.initiatorId !== ctx.user.id && conv.recipientId !== ctx.user.id)
      throw new TRPCError({ code: 'FORBIDDEN' });

    const revieweeId = conv.initiatorId === ctx.user.id ? conv.recipientId : conv.initiatorId;
    const [created] = await ctx.db
      .insert(reviews)
      .values({
        conversationId: input.conversationId,
        reviewerId: ctx.user.id,
        revieweeId,
        rating: input.rating,
        comment: input.comment,
        tags: input.tags ?? [],
      })
      .returning();

    await ctx.db
      .update(profiles)
      .set({ successfulExchanges: sql`${profiles.successfulExchanges} + 1` })
      .where(eq(profiles.userId, revieweeId));

    return created;
  }),

  report: protectedProcedure.input(submitReportInput).mutation(async ({ ctx, input }) => {
    const [created] = await ctx.db
      .insert(reports)
      .values({
        reporterId: ctx.user.id,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        details: input.details,
      })
      .returning();
    return created;
  }),

  // ---- admin / moderation queue --------------------------------------------
  moderationQueue: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(reports).where(eq(reports.status, 'open')).limit(50);
  }),

  /** Moderation audit trail for admin review (backed by `moderation_actions`). */
  auditLog: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: moderationActions.id,
        reportId: moderationActions.reportId,
        actorId: moderationActions.actorId,
        actorEmail: users.email,
        action: moderationActions.action,
        note: moderationActions.note,
        metadata: moderationActions.metadata,
        createdAt: moderationActions.createdAt,
      })
      .from(moderationActions)
      .innerJoin(users, eq(users.id, moderationActions.actorId))
      .orderBy(desc(moderationActions.createdAt))
      .limit(100);
  }),

  resolveReport: adminProcedure
    .input(z.object({ id: z.string().uuid(), action: z.enum(['resolved', 'dismissed']) }))
    .mutation(async ({ ctx, input }) => {
      const modAction = input.action === 'dismissed' ? 'dismiss_report' : 'resolve_report';
      await ctx.db.insert(moderationActions).values({
        reportId: input.id,
        actorId: ctx.user.id,
        action: modAction,
        note: `Report ${input.action} by moderator`,
      });
      await ctx.db
        .update(reports)
        .set({ status: input.action, resolvedAt: new Date(), resolverId: ctx.user.id })
        .where(eq(reports.id, input.id));
      return { ok: true };
    }),
});
