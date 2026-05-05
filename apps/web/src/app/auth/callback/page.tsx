import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

/**
 * Magic-link / Universal-Link callback.
 *
 * iOS Universal Links and Android App Links open this URL on the device.
 * If the Eushop app is installed and the AASA / assetlinks.json fingerprints
 * match, the OS opens the app directly with the same URL — our deep-link
 * handler reads `?to=...` and routes to the matching screen.
 *
 * Otherwise the browser loads this page and we forward to the requested
 * destination on the web app, preserving any tokens already attached as
 * cookies by the auth callback.
 */
export const metadata: Metadata = {
  title: 'Signing you in… · Eushop',
  robots: { index: false, follow: false },
};

const SAFE_PATHS = new Set<string>([
  '/',
  '/profile',
  '/trips',
  '/trips/new',
  '/listings',
  '/requests',
  '/inbox',
  '/notifications',
  '/reservations',
]);

function safeRedirect(rawTo: string | string[] | undefined): string {
  if (Array.isArray(rawTo)) rawTo = rawTo[0];
  if (!rawTo) return '/profile';
  if (!rawTo.startsWith('/')) return '/profile';
  // Allow nested /trip/abc, /listing/abc, /chat/abc, /country/it, /item/foo
  if (
    SAFE_PATHS.has(rawTo) ||
    /^\/(trip|listing|request|chat|country|item|profile)\/[A-Za-z0-9_-]+$/.test(rawTo) ||
    rawTo.startsWith('/profile/')
  ) {
    return rawTo;
  }
  return '/profile';
}

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string | string[] }>;
}) {
  const sp = await searchParams;
  redirect(safeRedirect(sp.to));
}
