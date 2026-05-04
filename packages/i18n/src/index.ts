export * from './formatters';

export const SUPPORTED_LOCALES = [
  'en',
  'de',
  'fr',
  'es',
  'it',
  'pl',
  'ro',
  'nl',
  'sv',
  'da',
  'fi',
  'cs',
  'sk',
  'hu',
  'bg',
  'hr',
  'el',
  'pt',
  'et',
  'lv',
  'lt',
  'sl',
  'is',
  'uk',
  'ru',
  'tr',
  'ja',
  'ko',
  'zh-CN',
  'hi',
  'ar',
  'fa',
  'he',
  'bn',
  'id',
] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const localeMeta: Record<Locale, { label: string; native: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English', native: 'English', dir: 'ltr' },
  de: { label: 'German', native: 'Deutsch', dir: 'ltr' },
  fr: { label: 'French', native: 'Français', dir: 'ltr' },
  es: { label: 'Spanish', native: 'Español', dir: 'ltr' },
  it: { label: 'Italian', native: 'Italiano', dir: 'ltr' },
  pl: { label: 'Polish', native: 'Polski', dir: 'ltr' },
  ro: { label: 'Romanian', native: 'Română', dir: 'ltr' },
  nl: { label: 'Dutch', native: 'Nederlands', dir: 'ltr' },
  sv: { label: 'Swedish', native: 'Svenska', dir: 'ltr' },
  da: { label: 'Danish', native: 'Dansk', dir: 'ltr' },
  fi: { label: 'Finnish', native: 'Suomi', dir: 'ltr' },
  cs: { label: 'Czech', native: 'Čeština', dir: 'ltr' },
  sk: { label: 'Slovak', native: 'Slovenčina', dir: 'ltr' },
  hu: { label: 'Hungarian', native: 'Magyar', dir: 'ltr' },
  bg: { label: 'Bulgarian', native: 'Български', dir: 'ltr' },
  hr: { label: 'Croatian', native: 'Hrvatski', dir: 'ltr' },
  el: { label: 'Greek', native: 'Ελληνικά', dir: 'ltr' },
  pt: { label: 'Portuguese', native: 'Português', dir: 'ltr' },
  et: { label: 'Estonian', native: 'Eesti', dir: 'ltr' },
  lv: { label: 'Latvian', native: 'Latviešu', dir: 'ltr' },
  lt: { label: 'Lithuanian', native: 'Lietuvių', dir: 'ltr' },
  sl: { label: 'Slovene', native: 'Slovenščina', dir: 'ltr' },
  is: { label: 'Icelandic', native: 'Íslenska', dir: 'ltr' },
  uk: { label: 'Ukrainian', native: 'Українська', dir: 'ltr' },
  ru: { label: 'Russian', native: 'Русский', dir: 'ltr' },
  tr: { label: 'Turkish', native: 'Türkçe', dir: 'ltr' },
  ja: { label: 'Japanese', native: '日本語', dir: 'ltr' },
  ko: { label: 'Korean', native: '한국어', dir: 'ltr' },
  'zh-CN': { label: 'Chinese (Simplified)', native: '简体中文', dir: 'ltr' },
  hi: { label: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  ar: { label: 'Arabic', native: 'العربية', dir: 'rtl' },
  fa: { label: 'Persian', native: 'فارسی', dir: 'rtl' },
  he: { label: 'Hebrew', native: 'עברית', dir: 'rtl' },
  bn: { label: 'Bengali', native: 'বাংলা', dir: 'ltr' },
  id: { label: 'Indonesian', native: 'Bahasa Indonesia', dir: 'ltr' },
};

export function isLocale(input: unknown): input is Locale {
  return typeof input === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(input);
}

export async function loadMessages(locale: Locale) {
  const mod = await import(`./messages/${locale}.json`, { with: { type: 'json' } });
  return mod.default;
}
