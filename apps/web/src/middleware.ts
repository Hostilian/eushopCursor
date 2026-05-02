import { type NextRequest, NextResponse } from 'next/server';
import { DEMO_MODE_COOKIE, isDemoModeEnvEnabled } from './lib/demo-mode';

/**
 * When ENABLE_DEMO_MODE is set, `?demo=1` / `?demo=0` toggles the demo cookie and redirects
 * with the query stripped. When disabled, `?demo=` is ignored and any existing demo cookie is cleared.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const demoParam = url.searchParams.get('demo');
  if (demoParam !== '1' && demoParam !== '0') {
    return NextResponse.next();
  }

  url.searchParams.delete('demo');
  const res = NextResponse.redirect(url);

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
