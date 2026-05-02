import { TRPCError } from '@trpc/server';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { connectAccounts, kycSessions, payouts, reservationPayments, users } from '@eushop/db';
import { connectOnboardingInput } from '@eushop/validators';
import {
  StripeNotConfiguredError,
  createAccountLink,
  createExpressAccount,
  retrieveAccount,
} from '../lib/stripe';
import { adminProcedure, protectedProcedure, publicProcedure, router } from '../trpc';

/**
 * Stripe Connect surface used by:
 *   - the seller onboarding flow (`/profile/payouts` on web)
 *   - the trip-reservation flow (creates PaymentIntents on the seller's
 *     connected account; routed from `trips.reserve`)
 *   - the admin dashboard (audit page consumes `connect_accounts` + KYC).
 *
 * When `STRIPE_SECRET_KEY` is unset every mutation responds with
 * `PRECONDITION_FAILED` so the rest of the app keeps working in dev.
 */
export const paymentsRouter = router({
  capabilities: publicProcedure.query(() => ({
    stripeConnectEnabled: Boolean(process.env.STRIPE_SECRET_KEY),
    kycVendor: process.env.KYC_VENDOR ?? null,
    platformFeeFormula: 'min(150, round(0.12 * agreedSlotFeeCents))' as const,
  })),

  /** Returns the Connect account row for the current user, if any. */
  myConnectAccount: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select()
      .from(connectAccounts)
      .where(eq(connectAccounts.userId, ctx.user.id))
      .limit(1);
    if (!row) return null;
    const [latestKyc] = await ctx.db
      .select()
      .from(kycSessions)
      .where(eq(kycSessions.userId, ctx.user.id))
      .orderBy(desc(kycSessions.createdAt))
      .limit(1);
    return { account: row, kyc: latestKyc ?? null };
  }),

  /**
   * Idempotent onboarding entry point: creates a Stripe Express account
   * (and the local mirror row) on first call, then returns a fresh
   * Account Link the user can follow to complete KYC + bank details.
   */
  startConnectOnboarding: protectedProcedure
    .input(connectOnboardingInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const [user] = await ctx.db
          .select({ id: users.id, email: users.email })
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);
        if (!user?.email) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You need a verified email before starting payouts onboarding.',
          });
        }
        const [existing] = await ctx.db
          .select()
          .from(connectAccounts)
          .where(eq(connectAccounts.userId, ctx.user.id))
          .limit(1);

        let stripeAccountId = existing?.stripeAccountId ?? null;
        if (!stripeAccountId) {
          const created = await createExpressAccount({
            email: user.email,
            countryIso2: input.countryIso2.toUpperCase(),
          });
          stripeAccountId = created.id;
          await ctx.db.insert(connectAccounts).values({
            userId: ctx.user.id,
            stripeAccountId,
            countryIso2: input.countryIso2.toUpperCase(),
            chargesEnabled: created.charges_enabled,
            payoutsEnabled: created.payouts_enabled,
            detailsSubmitted: created.details_submitted,
            requirementsCurrentlyDue: created.requirements?.currently_due ?? [],
            requirementsDisabledReason: created.requirements?.disabled_reason ?? null,
            status: 'pending',
          });
        }

        const link = await createAccountLink({
          stripeAccountId,
          returnUrl: input.returnUrl,
          refreshUrl: input.refreshUrl,
        });
        return { stripeAccountId, url: link.url };
      } catch (e) {
        if (e instanceof StripeNotConfiguredError) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Stripe is not configured (STRIPE_SECRET_KEY).',
          });
        }
        throw e;
      }
    }),

  /** Re-pulls the latest account state from Stripe and writes it locally. */
  refreshConnectAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const [row] = await ctx.db
      .select()
      .from(connectAccounts)
      .where(eq(connectAccounts.userId, ctx.user.id))
      .limit(1);
    if (!row) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No connect account on file.' });
    }
    try {
      const remote = await retrieveAccount(row.stripeAccountId);
      const status =
        remote.charges_enabled && remote.payouts_enabled
          ? ('active' as const)
          : remote.details_submitted
            ? ('restricted' as const)
            : ('pending' as const);
      await ctx.db
        .update(connectAccounts)
        .set({
          chargesEnabled: remote.charges_enabled,
          payoutsEnabled: remote.payouts_enabled,
          detailsSubmitted: remote.details_submitted,
          requirementsCurrentlyDue: remote.requirements?.currently_due ?? [],
          requirementsDisabledReason: remote.requirements?.disabled_reason ?? null,
          status,
          updatedAt: new Date(),
        })
        .where(eq(connectAccounts.id, row.id));
      return { ok: true as const, status };
    } catch (e) {
      if (e instanceof StripeNotConfiguredError) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Stripe is not configured (STRIPE_SECRET_KEY).',
        });
      }
      throw e;
    }
  }),

  /**
   * Admin: list connect accounts grouped by status. Powers the `/audit`
   * dashboard's payouts column and lets ops chase up restricted accounts.
   */
  adminListConnectAccounts: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        account: connectAccounts,
        userEmail: users.email,
        userName: users.name,
      })
      .from(connectAccounts)
      .innerJoin(users, eq(users.id, connectAccounts.userId))
      .orderBy(desc(connectAccounts.updatedAt))
      .limit(200);
    return rows;
  }),

  /** Admin: per-reservation payment ledger. */
  adminListReservationPayments: adminProcedure
    .input(
      z
        .object({
          status: z.string().trim().min(1).max(64).optional(),
          limit: z.number().int().min(1).max(500).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 200;
      const base = ctx.db.select().from(reservationPayments);
      const rows = await (
        input?.status ? base.where(eq(reservationPayments.status, input.status)) : base
      )
        .orderBy(desc(reservationPayments.createdAt))
        .limit(limit);
      return rows;
    }),

  /** Admin: trip payout rows (Stripe transfer id vs Dashboard). */
  adminListPayouts: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(payouts).orderBy(desc(payouts.updatedAt)).limit(200);
    return rows;
  }),

  /** Public: the platform fee formula and KYC vendor surface for the manifesto page. */
  publicCapabilities: publicProcedure.query(() => ({
    paymentsLive: Boolean(process.env.STRIPE_SECRET_KEY),
    kycVendor: process.env.KYC_VENDOR ?? null,
  })),
});

void and; // silence unused-import linter when this file is imported with bundler tree-shake quirks
