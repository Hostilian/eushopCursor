/**
 * Deep-link routing.
 *
 * Maps incoming `https://eushop.eu/...` Universal/App Link URLs (or the
 * legacy `eushop://...` scheme used by magic-link emails before we moved
 * the callback to HTTPS) to the matching expo-router segment. Returns the
 * router-friendly path or `null` if the URL is unrecognised, in which case
 * the caller should leave the user on the current screen.
 *
 * Path table is centralised here so the AASA components in
 * `apps/web/src/app/.well-known/apple-app-site-association/route.ts` and
 * the Android `intentFilters` in `apps/mobile/app.json` stay in sync.
 */
import * as Linking from 'expo-linking';

const KNOWN_HOSTS = new Set(['eushop.eu', 'www.eushop.eu', 'staging.eushop.eu']);

export function resolveIncomingUrl(rawUrl: string): string | null {
  let url: ReturnType<typeof Linking.parse>;
  try {
    url = Linking.parse(rawUrl);
  } catch {
    return null;
  }

  // eushop:// scheme — strip and treat the rest as a path
  if (url.scheme && url.scheme.toLowerCase() === 'eushop') {
    const path = url.path ? `/${url.path.replace(/^\/+/, '')}` : '/';
    return appendQuery(path, url.queryParams ?? null);
  }

  if (!url.hostname || !KNOWN_HOSTS.has(url.hostname.toLowerCase())) return null;

  const path = url.path ? `/${url.path.replace(/^\/+/, '')}` : '/';
  // Auth callback: redirect to whatever the email link wanted us to land on.
  if (path === '/auth/callback') {
    const to = url.queryParams?.to;
    const target = typeof to === 'string' && to.startsWith('/') ? to : '/profile';
    return target;
  }
  return appendQuery(path, url.queryParams ?? null);
}

function appendQuery(
  path: string,
  query: Record<string, string | string[] | undefined> | null,
): string {
  if (!query) return path;
  const entries = Object.entries(query).filter(([, v]) => v !== undefined);
  if (!entries.length) return path;
  const search = entries
    .map(([k, v]) => {
      const val = Array.isArray(v) ? v.join(',') : String(v);
      return `${encodeURIComponent(k)}=${encodeURIComponent(val)}`;
    })
    .join('&');
  return search ? `${path}?${search}` : path;
}
