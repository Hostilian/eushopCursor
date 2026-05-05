/**
 * Mobile observability bootstrap.
 *
 * Mirrors the web pattern in apps/web/src/lib/observability.ts and posthog.ts,
 * but tuned for React Native:
 * - Sentry initializes immediately (crash reporting is exempt from the EU
 *   analytics consent flow because it is necessary to operate the service —
 *   we never attach user-level metadata until the user opts in).
 * - PostHog only initializes once the user has accepted analytics in the
 *   on-launch consent screen. The choice is persisted in AsyncStorage under
 *   `eushop.consent.v1` and surfaced via the consent helper below.
 *
 * Both SDKs are dynamically imported so the bundle stays lean when the env
 * keys are not configured (preview/dev builds without DSNs).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const CONSENT_KEY = 'eushop.consent.v1';

export type ConsentChoice = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  legalCountryIso2?: string;
  decidedAt: string;
};

let sentryInitialized = false;
let posthogInitialized = false;
let posthogClient: { capture: (event: string, props?: Record<string, unknown>) => void } | null =
  null;

function getExtra<T = unknown>(key: string): T | undefined {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  return extra[key] as T | undefined;
}

export function getEnv(): 'development' | 'staging' | 'production' {
  const env = process.env.EXPO_PUBLIC_ENV;
  if (env === 'staging' || env === 'production') return env;
  return 'development';
}

export async function initSentry(): Promise<void> {
  if (sentryInitialized) return;
  const dsn =
    process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() || getExtra<{ dsn?: string }>('sentry')?.dsn?.trim();
  if (!dsn) return;
  try {
    const mod = await import('@sentry/react-native');
    mod.init({
      dsn,
      environment: getEnv(),
      tracesSampleRate: getEnv() === 'production' ? 0.1 : 1,
      enableAutoSessionTracking: true,
      sendDefaultPii: false,
    });
    sentryInitialized = true;
  } catch {
    // @sentry/react-native not installed — no-op.
  }
}

export async function getConsent(): Promise<ConsentChoice | null> {
  try {
    const raw = await AsyncStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentChoice;
    if (typeof parsed === 'object' && parsed?.necessary === true) return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function saveConsent(
  choice: Omit<ConsentChoice, 'necessary' | 'decidedAt'>,
): Promise<ConsentChoice> {
  const next: ConsentChoice = {
    necessary: true,
    analytics: !!choice.analytics,
    marketing: !!choice.marketing,
    legalCountryIso2: choice.legalCountryIso2?.toUpperCase(),
    decidedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  if (next.analytics) {
    await initPostHogIfConsented(next);
  }
  return next;
}

export async function initPostHogIfConsented(consent?: ConsentChoice | null): Promise<void> {
  if (posthogInitialized) return;
  const decided = consent ?? (await getConsent());
  if (!decided?.analytics) return;
  const key =
    process.env.EXPO_PUBLIC_POSTHOG_KEY?.trim() ||
    getExtra<{ key?: string }>('posthog')?.key?.trim();
  if (!key) return;
  const host =
    process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim() ||
    getExtra<{ host?: string }>('posthog')?.host?.trim() ||
    'https://eu.posthog.com';
  try {
    const mod = await import('posthog-react-native');
    const PostHog = (mod as unknown as { default: new (k: string, o: unknown) => unknown }).default;
    const client = new PostHog(key, { host, captureAppLifecycleEvents: true }) as {
      capture: (event: string, props?: Record<string, unknown>) => void;
    };
    posthogClient = client;
    posthogInitialized = true;
    client.capture('app_open', { env: getEnv() });
  } catch {
    // posthog-react-native not installed — no-op.
  }
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (!posthogClient) return;
  try {
    posthogClient.capture(event, props);
  } catch {
    // best-effort — analytics never blocks UX.
  }
}
