export const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'es', 'it', 'pl'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const localeMeta: Record<Locale, { label: string; native: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English', native: 'English', dir: 'ltr' },
  de: { label: 'German', native: 'Deutsch', dir: 'ltr' },
  fr: { label: 'French', native: 'Français', dir: 'ltr' },
  es: { label: 'Spanish', native: 'Español', dir: 'ltr' },
  it: { label: 'Italian', native: 'Italiano', dir: 'ltr' },
  pl: { label: 'Polish', native: 'Polski', dir: 'ltr' },
};

export function isLocale(input: unknown): input is Locale {
  return typeof input === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(input);
}

export async function loadMessages(locale: Locale): Promise<Record<string, string>> {
  const mod = await import(`./messages/${locale}.json`, { with: { type: 'json' } });
  return mod.default as Record<string, string>;
}
