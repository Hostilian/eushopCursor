import { submitReportInput, submitReviewInput } from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  conversations,
  kycSessions,
  listings,
  moderationActions,
  profiles,
  reports,
  reviews,
  users,
} from '@eushop/db';
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

  /** After KYC review, grant or revoke the `verified_bringer` profile badge. */
  setVerifiedBringer: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        verified: z.boolean(),
        note: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.userId, input.userId),
      });
      if (!profile) throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });

      const badge = 'verified_bringer';
      const nextBadges = input.verified
        ? Array.from(new Set([...profile.badges, badge]))
        : profile.badges.filter((b) => b !== badge);

      await ctx.db
        .update(profiles)
        .set({ badges: nextBadges, updatedAt: new Date() })
        .where(eq(profiles.userId, input.userId));

      await ctx.db.insert(moderationActions).values({
        actorId: ctx.user.id,
        action: 'note',
        note: input.verified
          ? `Granted verified_bringer badge${input.note ? `: ${input.note}` : ''}`
          : `Revoked verified_bringer badge${input.note ? `: ${input.note}` : ''}`,
        metadata: {
          userId: input.userId,
          kind: input.verified ? 'grant_verified_bringer' : 'revoke_verified_bringer',
        },
      });

      return { ok: true, badges: nextBadges };
    }),

  /* -------------------------------------------------------------- *
   * KYC: Veriff / Onfido session bootstrap.                         *
   *                                                                 *
   * The vendor is selected via `KYC_VENDOR` (`veriff` or `onfido`). *
   * For dev we record a `manual` session so the verified-bringer    *
   * flow can be tested end-to-end without third-party calls.        *
   * -------------------------------------------------------------- */

  myKycStatus: protectedProcedure.query(async ({ ctx }) => {
    const [latest] = await ctx.db
      .select()
      .from(kycSessions)
      .where(eq(kycSessions.userId, ctx.user.id))
      .orderBy(desc(kycSessions.createdAt))
      .limit(1);
    return latest ?? null;
  }),

  startKyc: protectedProcedure
    .input(
      z.object({
        callbackUrl: z.string().url(),
        countryIso2: z.string().length(2).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = (process.env.KYC_VENDOR ?? 'manual').toLowerCase();
      if (vendor !== 'veriff' && vendor !== 'onfido' && vendor !== 'manual') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Unknown KYC vendor: ${vendor}`,
        });
      }

      const [user] = await ctx.db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);
      if (!user?.email) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email required' });

      // Veriff: create a session (POST /v1/sessions). Returns session URL.
      if (vendor === 'veriff' && process.env.VERIFF_API_KEY && process.env.VERIFF_BASE_URL) {
        try {
          const res = await fetch(`${process.env.VERIFF_BASE_URL}/v1/sessions`, {
            method: 'POST',
            headers: {
              'X-AUTH-CLIENT': process.env.VERIFF_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              verification: {
                callback: input.callbackUrl,
                person: { firstName: user.name ?? 'Eushop user', lastName: '' },
                vendorData: user.id,
              },
            }),
          });
          const json = (await res.json()) as {
            verification?: { id?: string; url?: string };
          };
          const externalId = json.verification?.id;
          const url = json.verification?.url;
          if (!externalId || !url) {
            throw new TRPCError({ code: 'BAD_GATEWAY', message: 'Veriff returned no session' });
          }
          const [created] = await ctx.db
            .insert(kycSessions)
            .values({
              userId: ctx.user.id,
              provider: 'veriff',
              externalId,
              status: 'pending',
              verifiedCountryIso2: input.countryIso2,
            })
            .returning();
          return { sessionId: created?.id, url };
        } catch (e) {
          throw new TRPCError({
            code: 'BAD_GATEWAY',
            message: e instanceof Error ? e.message : 'Veriff session failed',
          });
        }
      }

      // Onfido: create applicant + SDK token (simplified). Real production code
      // would call POST /v3.6/applicants and then /v3.6/sdk_token.
      if (vendor === 'onfido' && process.env.ONFIDO_API_TOKEN) {
        try {
          const applicantRes = await fetch('https://api.eu.onfido.com/v3.6/applicants', {
            method: 'POST',
            headers: {
              Authorization: `Token token=${process.env.ONFIDO_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              first_name: user.name ?? 'Eushop',
              last_name: 'User',
              email: user.email,
            }),
          });
          const applicant = (await applicantRes.json()) as { id?: string };
          if (!applicant.id) {
            throw new TRPCError({ code: 'BAD_GATEWAY', message: 'Onfido applicant failed' });
          }
          const [created] = await ctx.db
            .insert(kycSessions)
            .values({
              userId: ctx.user.id,
              provider: 'onfido',
              externalId: applicant.id,
              status: 'pending',
              verifiedCountryIso2: input.countryIso2,
            })
            .returning();
          return { sessionId: created?.id, applicantId: applicant.id };
        } catch (e) {
          throw new TRPCError({
            code: 'BAD_GATEWAY',
            message: e instanceof Error ? e.message : 'Onfido session failed',
          });
        }
      }

      // Dev / manual fallback: create a pending session the admin can flip.
      const externalId = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const [created] = await ctx.db
        .insert(kycSessions)
        .values({
          userId: ctx.user.id,
          provider: 'manual',
          externalId,
          status: 'pending',
          verifiedCountryIso2: input.countryIso2,
        })
        .returning();
      return { sessionId: created?.id, manual: true as const };
    }),

  /** Admin: flip a KYC session to verified/rejected and reflect on profile. */
  adminReviewKycSession: adminProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        status: z.enum(['verified', 'rejected', 'expired']),
        verifiedCountryIso2: z.string().length(2).optional(),
        rejectionReason: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.query.kycSessions.findFirst({
        where: eq(kycSessions.id, input.sessionId),
      });
      if (!session) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.db
        .update(kycSessions)
        .set({
          status: input.status,
          verifiedCountryIso2: input.verifiedCountryIso2 ?? session.verifiedCountryIso2,
          rejectionReason: input.rejectionReason ?? null,
          verifiedAt: input.status === 'verified' ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(kycSessions.id, input.sessionId));
      // Add/remove the verified_bringer badge in lockstep.
      const profile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.userId, session.userId),
      });
      if (profile) {
        const badge = 'verified_bringer';
        const next =
          input.status === 'verified'
            ? Array.from(new Set([...profile.badges, badge]))
            : profile.badges.filter((b) => b !== badge);
        await ctx.db
          .update(profiles)
          .set({ badges: next, updatedAt: new Date() })
          .where(eq(profiles.userId, session.userId));
      }
      await ctx.db.insert(moderationActions).values({
        actorId: ctx.user.id,
        action: 'note',
        note: `KYC session ${input.sessionId} → ${input.status}`,
        metadata: {
          kind: 'kyc_review',
          sessionId: input.sessionId,
          status: input.status,
          rejectionReason: input.rejectionReason ?? null,
        },
      });
      return { ok: true as const };
    }),

  /** Remove a pantry listing from public surfaces (operator safety). */
  adminRemoveListing: adminProcedure
    .input(
      z.object({
        listingId: z.string().uuid(),
        note: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.query.listings.findFirst({
        where: eq(listings.id, input.listingId),
      });
      if (!row) throw new TRPCError({ code: 'NOT_FOUND', message: 'Listing not found' });
      if (row.status === 'removed') {
        return { ok: true as const, alreadyRemoved: true as const };
      }
      await ctx.db
        .update(listings)
        .set({ status: 'removed', updatedAt: new Date() })
        .where(eq(listings.id, input.listingId));
      await ctx.db.insert(moderationActions).values({
        actorId: ctx.user.id,
        action: 'remove_listing',
        note: input.note?.trim() || 'Admin removed listing from public feed',
        metadata: { listingId: input.listingId, sellerId: row.sellerId },
      });
      return { ok: true as const };
    }),

  /* -------------------------------------------------------------- *
   * Admin user management.                                          *
   * -------------------------------------------------------------- */

  adminSetUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(['user', 'moderator', 'admin']),
        note: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id && input.role !== 'admin') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot demote yourself.',
        });
      }
      await ctx.db
        .update(users)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(users.id, input.userId));
      await ctx.db.insert(moderationActions).values({
        actorId: ctx.user.id,
        action: 'note',
        note: `Set role to ${input.role}${input.note ? `: ${input.note}` : ''}`,
        metadata: { kind: 'set_role', userId: input.userId, role: input.role },
      });
      return { ok: true as const };
    }),

  adminSuspendUser: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        suspended: z.boolean(),
        shadowBan: z.boolean().optional(),
        note: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.userId, input.userId),
      });
      if (!profile) throw new TRPCError({ code: 'NOT_FOUND' });

      const flagSuspended = 'suspended';
      const flagShadow = 'shadow_banned';
      let badges = profile.badges;
      if (input.suspended) {
        badges = Array.from(new Set([...badges, flagSuspended]));
      } else {
        badges = badges.filter((b) => b !== flagSuspended);
      }
      if (input.shadowBan === true) {
        badges = Array.from(new Set([...badges, flagShadow]));
      } else if (input.shadowBan === false) {
        badges = badges.filter((b) => b !== flagShadow);
      }
      await ctx.db
        .update(profiles)
        .set({ badges, updatedAt: new Date() })
        .where(eq(profiles.userId, input.userId));

      await ctx.db.insert(moderationActions).values({
        actorId: ctx.user.id,
        action: input.suspended ? 'suspend_user' : 'note',
        note:
          (input.suspended ? 'Suspend' : 'Unsuspend') +
          (input.shadowBan === true
            ? ' + shadow ban'
            : input.shadowBan === false
              ? ' + clear shadow'
              : '') +
          (input.note ? ` — ${input.note}` : ''),
        metadata: {
          kind: input.suspended ? 'suspend' : 'unsuspend',
          userId: input.userId,
          shadowBan: input.shadowBan ?? null,
        },
      });
      return { ok: true as const, badges };
    }),
});
