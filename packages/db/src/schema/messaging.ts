import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { listings } from './listings';
import { requests } from './requests';

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    initiatorId: uuid('initiator_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    recipientId: uuid('recipient_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'set null' }),
    requestId: uuid('request_id').references(() => requests.id, { onDelete: 'set null' }),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    initiatorIdx: index('conversations_initiator_idx').on(t.initiatorId),
    recipientIdx: index('conversations_recipient_idx').on(t.recipientId),
    listingIdx: index('conversations_listing_idx').on(t.listingId),
  }),
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    attachments: jsonb('attachments')
      .$type<Array<{ url: string; width?: number; height?: number }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    convIdx: index('messages_conv_idx').on(t.conversationId, t.createdAt),
    senderIdx: index('messages_sender_idx').on(t.senderId),
  }),
);
