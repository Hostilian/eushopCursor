'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';
import superjson from 'superjson';
import { trpc, apiUrl } from './lib/trpc';

export function Providers({ children }: { children: ReactNode }) {
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
