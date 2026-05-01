import createMiddleware from 'next-intl/middleware';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@eushop/i18n';

export default createMiddleware({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|media|.*\\..*).*)'],
};
