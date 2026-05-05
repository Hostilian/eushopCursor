import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';

const LAST_REVIEWED = '2026-05-05';

/**
 * Public account-deletion landing page.
 *
 * Google Play *requires* a public, non-authenticated URL that explains how
 * users (including ones without the app installed) can delete their account.
 * This page documents both the in-app and web flows, and links to the
 * authenticated `/data-export` (GDPR Art. 17) page where the actual deletion
 * happens.
 *
 * Linked from:
 * - Play Console → Data safety → Data deletion URL
 * - App Store Connect → App Privacy → Data deletion URL (when supported)
 * - apps/mobile fastlane metadata (`full_description.txt`)
 * - The mobile privacy page
 *
 * If you ever need to remove this URL, update the Play submission first —
 * Play will reject the next release until a new URL is provided.
 */
export const metadata: Metadata = {
  title: 'Delete your Eushop account · Eushop',
  description:
    'How to permanently delete your Eushop account and the data we hold about you. Public landing page that satisfies the Play Store account-deletion requirement.',
  robots: { index: true, follow: true },
};

export default function AccountDeletePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-paper min-h-screen">
        <div className="mx-auto max-w-2xl px-6 pt-16 pb-24">
          <p className="text-ash text-xs tracking-widest uppercase">GDPR · Art. 17</p>
          <h1 className="text-ink mt-3 font-serif text-4xl md:text-5xl">
            Delete your Eushop account.
          </h1>
          <p className="text-ink/70 mt-4 text-base leading-relaxed">
            Two ways. Pick whichever is easier. Both wipe the same data.
          </p>

          <section className="border-ink/10 mt-10 rounded-3xl border bg-white p-8">
            <h2 className="text-ink font-serif text-2xl">From the mobile app</h2>
            <ol className="text-ink/80 mt-4 ml-5 list-decimal space-y-2 text-sm leading-relaxed">
              <li>Open the Eushop app on iOS or Android.</li>
              <li>
                Tap the <strong>Profile</strong> tab at the bottom.
              </li>
              <li>
                Scroll down and tap <strong>Delete account</strong>.
              </li>
              <li>Confirm. Your data is removed within seconds.</li>
            </ol>
          </section>

          <section className="border-ink/10 mt-6 rounded-3xl border bg-white p-8">
            <h2 className="text-ink font-serif text-2xl">From the web</h2>
            <ol className="text-ink/80 mt-4 ml-5 list-decimal space-y-2 text-sm leading-relaxed">
              <li>
                Sign in at{' '}
                <Link className="underline" href="/sign-in">
                  eushop.eu/sign-in
                </Link>
                .
              </li>
              <li>Go to your profile.</li>
              <li>
                Tap <strong>Delete account</strong>. Confirm.
              </li>
            </ol>
            <p className="text-ash mt-4 text-xs">
              Lost access to your email? Write to{' '}
              <a className="underline" href="mailto:dpo@eushop.eu">
                dpo@eushop.eu
              </a>{' '}
              with a way to verify your identity (e.g. signed-in chat reference) and we&apos;ll
              delete the account on your behalf within 30 days.
            </p>
          </section>

          <section className="border-ink/10 mt-6 rounded-3xl border bg-white p-8">
            <h2 className="text-ink font-serif text-2xl">What gets deleted</h2>
            <ul className="text-ink/80 mt-4 ml-5 list-disc space-y-2 text-sm leading-relaxed">
              <li>Your account, profile, and verification badges.</li>
              <li>All listings, trip offers, reservations, and open asks you posted.</li>
              <li>All messages you sent, plus references to messages you received.</li>
              <li>All photos you uploaded.</li>
              <li>All reviews you wrote.</li>
              <li>Push tokens for every device you signed in on.</li>
              <li>Analytics linkage (server-side delete signal sent to PostHog EU).</li>
            </ul>
            <h3 className="text-ink mt-8 font-serif text-lg">What we keep</h3>
            <ul className="text-ink/80 mt-3 ml-5 list-disc space-y-2 text-sm leading-relaxed">
              <li>
                Aggregate, non-identifying counts (e.g. "5 trips on the Munich → Warsaw corridor
                this month") that contain no link back to your account.
              </li>
              <li>
                Transaction records that we are legally required to retain for tax / accounting
                compliance (kept for 7 years, then deleted). These contain only amounts and
                identifiers, no profile data.
              </li>
              <li>
                Aggregated abuse reports (banned-IP / banned-fingerprint signals) when the deletion
                was triggered by a community-guidelines violation.
              </li>
            </ul>
          </section>

          <p className="text-ash mt-10 text-xs">Last reviewed {LAST_REVIEWED}.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
