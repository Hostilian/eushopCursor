import { db } from '@eushop/db/client';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3001';
const secret = process.env.BETTER_AUTH_SECRET ?? 'dev-secret-not-for-production';

/**
 * Better Auth instance shared across the API server, the web app's server
 * actions, and the admin app. Mobile uses the HTTP endpoints exposed by the
 * API server.
 *
 * Email + password is on for fastest dev. In production we lean on magic-link
 * (passwordless), Google and Apple. Passkeys come on once we ship 2FA.
 */
export const auth = betterAuth({
  baseURL,
  secret,
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? {
          apple: {
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // TODO: wire to Resend in production. For dev we log to mailhog.
        console.info(`[magic-link] ${email} → ${url}`);
      },
    }),
  ],
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 },
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3002',
    'exp://127.0.0.1:8081',
    ...(process.env.NODE_ENV === 'production'
      ? ['https://eushop.eu', 'https://www.eushop.eu', 'https://admin.eushop.eu']
      : []),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session['user'];
