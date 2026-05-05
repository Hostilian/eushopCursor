import { NextResponse } from 'next/server';

/**
 * Apple App Site Association (AASA) — Universal Links manifest.
 *
 * Served at https://eushop.eu/.well-known/apple-app-site-association as
 * `application/json` with no file extension (Apple verifies the exact path).
 *
 * `applinks.details[].appIDs` uses `<TEAMID>.<bundleId>`. The team id ships
 * via env so we don't leak it in git history; until set, the route returns
 * an empty manifest so iOS quietly falls back to the browser.
 *
 * Reference: https://developer.apple.com/documentation/xcode/supporting-associated-domains
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  const bundleId = process.env.APPLE_BUNDLE_ID?.trim() || 'eu.eushop.app';

  const manifest =
    teamId && bundleId
      ? {
          applinks: {
            details: [
              {
                appIDs: [`${teamId}.${bundleId}`],
                components: [
                  { '/': '/trip/*', comment: 'Trip detail' },
                  { '/': '/trips', comment: 'Trip list' },
                  { '/': '/trips/new', comment: 'Publish a trip' },
                  { '/': '/listing/*', comment: 'Listing detail' },
                  { '/': '/request/*', comment: 'Request detail' },
                  { '/': '/country/*', comment: 'Country page' },
                  { '/': '/item/*', comment: 'Item page' },
                  { '/': '/chat/*', comment: 'Chat thread' },
                  { '/': '/profile', comment: 'Profile' },
                  { '/': '/profile/*', comment: 'Profile sub-pages' },
                  { '/': '/auth/callback', comment: 'Magic-link callback' },
                  { '/': '/notifications', comment: 'Notifications' },
                  { '/': '/reservations', comment: 'Reservations' },
                ],
              },
            ],
          },
          webcredentials: {
            apps: [`${teamId}.${bundleId}`],
          },
        }
      : { applinks: { details: [] } };

  return NextResponse.json(manifest, {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600',
    },
  });
}
