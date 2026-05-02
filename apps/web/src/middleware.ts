import { type NextRequest, NextResponse } from 'next/server';
import { DEMO_MODE_COOKIE } from './lib/demo-mode';

/**
 * Middleware exists exclusively to interpret the `?demo=` query parameter
 * and persist it as a first-party cookie. Everything else (auth, routing,
 * i18n) is handled in app/ files.
 *
 * - `?demo=1` sets the cookie for 30 days.
 * - `?demo=0` clears it.
 * - Other values are ignored.
 *
 * After processing, the visitor is redirected to the same URL with the
 * `demo` param stripped so links shared in pitch decks stay clean.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const demoParam = url.searchParams.get('demo');
  if (demoParam !== '1' && demoParam !== '0') {
    return NextResponse.next();
  }

  url.searchParams.delete('demo');
  const res = NextResponse.redirect(url);

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
