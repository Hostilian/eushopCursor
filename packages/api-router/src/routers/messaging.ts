import {
  conversationMessagesInput,
  conversationUuidInput,
  sendMessageInput,
  startConversationInput,
} from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, ne, or } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { blocks, conversations, messages } from '@eushop/db';
import { usersAreBlockedPair } from '../lib/blocks';
import { protectedProcedure, rateLimited, router } from '../trpc';

const startConversationLimit = rateLimited({
  scope: 'messaging.start',
  perMinute: 30,
  perDay: 200,
});
const sendMessageLimit = rateLimited({
  scope: 'messaging.send',
  perMinute: 60,
  perDay: 4000,
});

export const messagingRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(conversations)
      .where(
        or(eq(conversations.initiatorId, ctx.user.id), eq(conversations.recipientId, ctx.user.id))!,
      )
      .orderBy(desc(conversations.lastMessageAt));

    const blockRows = await ctx.db
      .select()
      .from(blocks)
      .where(or(eq(blocks.blockerId, ctx.user.id), eq(blocks.blockedId, ctx.user.id)));
    const blockedPeerIds = new Set<string>();
    for (const b of blockRows) {
      blockedPeerIds.add(b.blockerId === ctx.user.id ? b.blockedId : b.blockerId);
    }

    type ConvRow = InferSelectModel<typeof conversations>;
    return rows.filter((c: ConvRow) => {
      const other = c.initiatorId === ctx.user.id ? c.recipientId : c.initiatorId;
      return !blockedPeerIds.has(other);
    });
  }),

  conversation: protectedProcedure.input(conversationUuidInput).query(async ({ ctx, input }) => {
    const conv = await ctx.db.query.conversations.findFirst({
      where: eq(conversations.id, input.id),
    });
    if (!conv) throw new TRPCError({ code: 'NOT_FOUND' });
    if (conv.initiatorId !== ctx.user.id && conv.recipientId !== ctx.user.id)
      throw new TRPCError({ code: 'FORBIDDEN' });
    const peerId = conv.initiatorId === ctx.user.id ? conv.recipientId : conv.initiatorId;
    if (await usersAreBlockedPair(ctx.db, ctx.user.id, peerId)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Messaging is not available' });
    }
    const msgs = await ctx.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, input.id))
      .orderBy(asc(messages.createdAt))
      .limit(200);
    return { conversation: conv, messages: msgs };
  }),

  start: protectedProcedure
    .use(startConversationLimit)
    .input(startConversationInput)
    .mutation(async ({ ctx, input }) => {
      if (input.recipientId === ctx.user.id)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot message yourself' });

      if (await usersAreBlockedPair(ctx.db, ctx.user.id, input.recipientId)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Messaging is not available' });
      }

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

  send: protectedProcedure
    .use(sendMessageLimit)
    .input(sendMessageInput)
    .mutation(async ({ ctx, input }) => {
      const conv = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, input.conversationId),
      });
      if (!conv) throw new TRPCError({ code: 'NOT_FOUND' });
      if (conv.initiatorId !== ctx.user.id && conv.recipientId !== ctx.user.id)
        throw new TRPCError({ code: 'FORBIDDEN' });

      const peerId = conv.initiatorId === ctx.user.id ? conv.recipientId : conv.initiatorId;
      if (await usersAreBlockedPair(ctx.db, ctx.user.id, peerId)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Messaging is not available' });
      }

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

  markRead: protectedProcedure.input(conversationMessagesInput).mutation(async ({ ctx, input }) => {
    const conv = await ctx.db.query.conversations.findFirst({
      where: eq(conversations.id, input.conversationId),
    });
    if (!conv) throw new TRPCError({ code: 'NOT_FOUND' });
    if (conv.initiatorId !== ctx.user.id && conv.recipientId !== ctx.user.id)
      throw new TRPCError({ code: 'FORBIDDEN' });
    const peerId = conv.initiatorId === ctx.user.id ? conv.recipientId : conv.initiatorId;
    if (await usersAreBlockedPair(ctx.db, ctx.user.id, peerId)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Messaging is not available' });
    }
    await ctx.db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(eq(messages.conversationId, input.conversationId), ne(messages.senderId, ctx.user.id)),
      );
    return { ok: true };
  }),
});
