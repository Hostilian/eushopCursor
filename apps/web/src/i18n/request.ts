import { getRequestConfig } from 'next-intl/server';
import {
  DEFAULT_LOCALE,
  isLocale,
  loadMessages,
  SUPPORTED_LOCALES,
  type Locale,
} from '@eushop/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  const messages = await loadMessages(locale);
  return { locale, messages };
});

export { SUPPORTED_LOCALES };
