'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState, type ReactNode } from 'react';
import superjson from 'superjson';
import { initWebSentry } from './lib/observability';
import { initPostHog } from './lib/posthog';
import { trpc, apiUrl } from './lib/trpc';

const CONSENT_KEY = 'eushop.consent.v1';

function readAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { analytics?: boolean };
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void initWebSentry('client');
    if (readAnalyticsConsent()) initPostHog();
  }, []);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') ||
            opts.direction === 'down',
        }),
        httpBatchLink({
          url: `${apiUrl}/trpc`,
          transformer: superjson,
          fetch(url, options) {
            return fetch(url, { ...options, credentials: 'include' });
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
