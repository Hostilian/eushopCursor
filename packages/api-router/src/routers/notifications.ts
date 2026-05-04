import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { uuidString } from '@eushop/validators';
import { deviceTokens, notifications } from '@eushop/db';
import { protectedProcedure, router } from '../trpc';

const DEFAULT_NOTIFICATION_LIMIT = 50;
const MAX_NOTIFICATION_LIMIT = 100;

export const notificationsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({ limit: z.number().int().min(1).max(MAX_NOTIFICATION_LIMIT).optional() })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const lim = Math.min(input?.limit ?? DEFAULT_NOTIFICATION_LIMIT, MAX_NOTIFICATION_LIMIT);
      return ctx.db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, ctx.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(lim);
    }),

  registerDevice: protectedProcedure
    .input(
      z.object({
        platform: z.enum(['ios', 'android', 'web']),
        expoPushToken: z.string().min(8),
        locale: z.string().min(2).max(10).default('en'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(deviceTokens)
        .values({
          userId: ctx.user.id,
          platform: input.platform,
          expoPushToken: input.expoPushToken,
          locale: input.locale,
        })
        .onConflictDoUpdate({
          target: deviceTokens.expoPushToken,
          set: { userId: ctx.user.id, locale: input.locale, lastSeenAt: new Date() },
        });
      return { ok: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.userId, ctx.user.id));
    return { ok: true };
  }),

  markRead: protectedProcedure
    .input(z.object({ id: uuidString }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)));
      return { ok: true };
    }),
});
