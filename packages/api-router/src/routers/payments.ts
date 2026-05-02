import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';

/**
 * Stripe Connect–shaped surface. Full onboarding and webhooks are documented in
 * `docs/ops/stripe-connect.md`; this router exposes capability flags and a stub link
 * until `STRIPE_SECRET_KEY` and Connect are wired.
 */
export const paymentsRouter = router({
  capabilities: publicProcedure.query(() => ({
    stripeConnectEnabled: Boolean(process.env.STRIPE_SECRET_KEY),
    platformFeeFormula: 'min(150, round(0.12 * agreedSlotFeeCents))' as const,
  })),

  /** Returns a Connect Express onboarding URL when Stripe is configured; otherwise 501. */
  connectOnboardingUrl: protectedProcedure
    .input(z.object({ returnUrl: z.string().url().optional() }).optional())
    .mutation(async ({ input }) => {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Stripe is not configured (STRIPE_SECRET_KEY).',
        });
      }
      void input;
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message:
          'Connect account link creation is not implemented yet. See docs/ops/stripe-connect.md.',
      });
    }),
});
