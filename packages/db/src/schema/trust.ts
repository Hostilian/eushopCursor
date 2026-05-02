import { sql } from 'drizzle-orm';
import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { conversations } from './messaging';

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    reviewerId: uuid('reviewer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    revieweeId: uuid('reviewee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    tags: jsonb('tags')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    revieweeIdx: index('reviews_reviewee_idx').on(t.revieweeId),
    conversationIdx: index('reviews_conv_idx').on(t.conversationId),
  }),
);

export const reportTargetEnum = pgEnum('report_target_type', [
  'listing',
  'request',
  'user',
  'message',
]);

export const reportReasonEnum = pgEnum('report_reason', [
  'spam',
  'commercial',
  'unsafe-food',
  'scam',
  'inappropriate',
  'duplicate',
  'other',
]);

export const reportStatusEnum = pgEnum('report_status', [
  'open',
  'reviewing',
  'resolved',
  'dismissed',
]);

export const reports = pgTable(
  'reports',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    reporterId: uuid('reporter_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    targetType: reportTargetEnum('target_type').notNull(),
    targetId: uuid('target_id').notNull(),
    reason: reportReasonEnum('reason').notNull(),
    details: text('details'),
    status: reportStatusEnum('status').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolverId: uuid('resolver_id').references(() => users.id, { onDelete: 'set null' }),
  },
  (t) => ({
    statusIdx: index('reports_status_idx').on(t.status),
    targetIdx: index('reports_target_idx').on(t.targetType, t.targetId),
  }),
);

export const moderationActionEnum = pgEnum('moderation_action_type', [
  'warn',
  'suspend_user',
  'remove_listing',
  'remove_request',
  'resolve_report',
  'dismiss_report',
  'note',
  'catalog_approve_item',
  'catalog_reject_item',
  'catalog_duplicate_item',
  'catalog_approve_image',
  'catalog_reject_image',
]);

export const moderationActions = pgTable(
  'moderation_actions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    reportId: uuid('report_id').references(() => reports.id, { onDelete: 'set null' }),
    actorId: uuid('actor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    action: moderationActionEnum('action').notNull(),
    note: text('note'),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    reportIdx: index('moderation_actions_report_idx').on(t.reportId),
    actorIdx: index('moderation_actions_actor_idx').on(t.actorId),
  }),
);
