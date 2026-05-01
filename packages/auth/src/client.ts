import { createAuthClient } from 'better-auth/client';
import { magicLinkClient } from 'better-auth/client/plugins';

export function makeAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [magicLinkClient()],
  });
}

export type EushopAuthClient = ReturnType<typeof makeAuthClient>;
