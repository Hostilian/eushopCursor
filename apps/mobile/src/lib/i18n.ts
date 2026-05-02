import { DEFAULT_LOCALE, type Locale, isLocale, loadMessages } from '@eushop/i18n';
import * as Localization from 'expo-localization';
import { useEffect, useState } from 'react';

type Messages = Record<string, unknown>;

export function resolveDeviceLocale(): Locale {
  const tag = Localization.getLocales()[0]?.languageCode ?? 'en';
  return isLocale(tag) ? tag : DEFAULT_LOCALE;
}

/** Loads `@eushop/i18n` messages for the device locale (fallback EN). */
export function useMobileMessages(): Messages | null {
  const [messages, setMessages] = useState<Messages | null>(null);
  useEffect(() => {
    const locale = resolveDeviceLocale();
    let cancelled = false;
    void loadMessages(locale).then((m) => {
      if (!cancelled) setMessages(m as Messages);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return messages;
}

export function pickString(messages: Messages | null, path: string[], fallback: string): string {
  if (!messages) return fallback;
  let cur: unknown = messages;
  for (const key of path) {
    if (cur === null || typeof cur !== 'object' || !(key in cur)) return fallback;
    cur = (cur as Record<string, unknown>)[key];
  }
  return typeof cur === 'string' ? cur : fallback;
}

/** Replace `{key}` placeholders in ICU-style simple templates. */
export function formatMessage(template: string, vars: Record<string, string | number>): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}
