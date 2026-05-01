import { auth } from '@eushop/auth';
import { db } from '@eushop/db/client';
import { MeiliSearch } from 'meilisearch';

const meili = new MeiliSearch({
  host: process.env.MEILI_HOST ?? 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY ?? 'eushopDevMeiliMasterKey',
});

export interface CtxUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
}

export interface CreateContextOptions {
  headers: Headers;
}

export async function createContext({ headers }: CreateContextOptions) {
  const session = await auth.api.getSession({ headers }).catch(() => null);
  const user: CtxUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        role: (session.user as { role?: string }).role ?? 'user',
      }
    : null;

  return {
    db,
    meili,
    auth,
    user,
    headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
