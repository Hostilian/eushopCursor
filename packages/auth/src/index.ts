import { db } from '@eushop/db/client';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3001';
/** ≥32 chars so Better Auth does not warn in dev when `.env` is missing. */
const secret =
  process.env.BETTER_AUTH_SECRET ??
  'dev-only-not-for-production-openssl-rand-base64-32-chars-min-ok-xxxxxxxx';

function escapeHtmlAttr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

async function sendMagicLinkEmail(to: string, url: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[magic-link] ${to} → ${url}`);
    return;
  }
  const from = process.env.EMAIL_FROM ?? 'Eushop <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Sign in to Eushop',
      html: `<p><a href="${escapeHtmlAttr(url)}">Sign in to Eushop</a></p><p>If you did not request this, you can ignore this email.</p>`,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('[magic-link] Resend error', res.status, body);
    throw new Error(`Magic link email failed (${res.status})`);
  }
}

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
  database: drizzleAdapter(db, {
    provider: 'pg',
    /** Our Drizzle tables are plural (`users`, `sessions`, …) — match Better Auth defaults. */
    usePlural: true,
  }),
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
        await sendMagicLinkEmail(email, url);
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
