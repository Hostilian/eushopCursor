import { type NextRequest, NextResponse } from 'next/server';
import { DEMO_MODE_COOKIE, isDemoModeEnvEnabled } from './lib/demo-mode';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Generate a per-request CSP nonce so we can drop `'unsafe-inline'`
 * from `script-src` in production. Next.js will read `x-nonce` and
 * inline it on its own framework `<script>` tags. Any of our own
 * inline `<Script>` tags must read the nonce from `headers()` and
 * pass it via the `nonce` prop.
 *
 * In development we keep `'unsafe-inline'` because the React Refresh
 * runtime injects scripts without a nonce.
 */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = '';
  for (const b of bytes) bin += String.fromCodePoint(b);
  return btoa(bin);
}

function buildCsp(nonce: string): string {
  const scriptSrc = isProd
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: http://localhost:* http://127.0.0.1:* ws: wss:",
    "frame-src 'self' https://www.openstreetmap.org https://*.openstreetmap.org",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

function applySecurityHeaders(res: NextResponse, nonce: string): void {
  res.headers.set('Content-Security-Policy', buildCsp(nonce));
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

/**
 * When ENABLE_DEMO_MODE is set, `?demo=1` / `?demo=0` toggles the demo cookie and redirects
 * with the query stripped. When disabled, `?demo=` is ignored and any existing demo cookie is cleared.
 *
 * Always: generate a per-request CSP nonce and attach it to the response so
 * the production `script-src` policy can drop `'unsafe-inline'`.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const demoParam = url.searchParams.get('demo');

  const nonce = generateNonce();
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set('x-nonce', nonce);

  if (demoParam !== '1' && demoParam !== '0') {
    const res = NextResponse.next({ request: { headers: reqHeaders } });
    applySecurityHeaders(res, nonce);
    res.headers.set('x-nonce', nonce);
    return res;
  }

  url.searchParams.delete('demo');
  const res = NextResponse.redirect(url);
  applySecurityHeaders(res, nonce);
  res.headers.set('x-nonce', nonce);

  if (!isDemoModeEnvEnabled()) {
    res.cookies.delete(DEMO_MODE_COOKIE);
    return res;
  }

  if (demoParam === '1') {
    res.cookies.set(DEMO_MODE_COOKIE, '1', {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    res.cookies.delete(DEMO_MODE_COOKIE);
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
