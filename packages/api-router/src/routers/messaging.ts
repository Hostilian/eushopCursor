import { sendMessageInput, startConversationInput } from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, ne, or } from 'drizzle-orm';
import { z } from 'zod';
import { conversations, messages } from '@eushop/db';
import { protectedProcedure, router } from '../trpc.js';

export const messagingRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(conversations)
      .where(or(eq(conversations.initiatorId, ctx.user.id), eq(conversations.recipientId, ctx.user.id))!)
      .orderBy(desc(conversations.lastMessageAt));
  }),

  conversation: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const conv = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, input.id),
      });
      if (!conv) throw new TRPCError({ code: 'NOT_FOUND' });
      if (conv.initiatorId !== ctx.user.id && conv.recipientId !== ctx.user.id)
        throw new TRPCError({ code: 'FORBIDDEN' });
      const msgs = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.id))
        .orderBy(asc(messages.createdAt))
        .limit(200);
      return { conversation: conv, messages: msgs };
    }),

  start: protectedProcedure.input(startConversationInput).mutation(async ({ ctx, input }) => {
    if (input.recipientId === ctx.user.id)
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot message yourself' });

    const existing = await ctx.db.query.conversations.findFirst({
      where: and(
        or(
          and(
            eq(conversations.initiatorId, ctx.user.id),
            eq(conversations.recipientId, input.recipientId),
          )!,
          and(
            eq(conversations.initiatorId, input.recipientId),
            eq(conversations.recipientId, ctx.user.id),
          )!,
        )!,
        input.listingId ? eq(conversations.listingId, input.listingId) : undefined,
      ),
    });
    let conv = existing;
    if (!conv) {
      const [created] = await ctx.db
        .insert(conversations)
        .values({
          initiatorId: ctx.user.id,
          recipientId: input.recipientId,
          listingId: input.listingId,
          requestId: input.requestId,
        })
        .returning();
      conv = created;
    }

    const [msg] = await ctx.db
      .insert(messages)
      .values({
        conversationId: conv!.id,
        senderId: ctx.user.id,
        body: input.body,
      })
      .returning();
    await ctx.db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conv!.id));
    return { conversation: conv!, message: msg };
  }),

  send: protectedProcedure.input(sendMessageInput).mutation(async ({ ctx, input }) => {
    const conv = await ctx.db.query.conversations.findFirst({
      where: eq(conversations.id, input.conversationId),
    });
    if (!conv) throw new TRPCError({ code: 'NOT_FOUND' });
    if (conv.initiatorId !== ctx.user.id && conv.recipientId !== ctx.user.id)
      throw new TRPCError({ code: 'FORBIDDEN' });

    const [msg] = await ctx.db
      .insert(messages)
      .values({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        body: input.body,
        attachments: input.attachments ?? [],
      })
      .returning();
    await ctx.db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, input.conversationId));
    return msg;
  }),

  markRead: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(messages)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            ne(messages.senderId, ctx.user.id),
          ),
        );
      return { ok: true };
    }),
});

export const SAFE_TEMPLATES = [
  'Hi! Is your stash still available?',
  'Could we meet near a metro stop you like? Privacy first.',
  'What freshness window works for the handoff?',
  'Happy with the finder\u2019s fee — do you accept Revolut/cash on pickup?',
];
