import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES, type Locale } from '@eushop/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  const messages = (await import(`@eushop/i18n/messages/${locale}.json`)).default;
  return { locale, messages };
});

export { SUPPORTED_LOCALES };
