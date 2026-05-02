import type { DB } from '@eushop/db/client';
import { and, eq, or } from 'drizzle-orm';
import { blocks } from '@eushop/db';

/** True if either user has blocked the other (no messaging between the pair). */
export async function usersAreBlockedPair(
  db: DB,
  userIdA: string,
  userIdB: string,
): Promise<boolean> {
  const row = await db.query.blocks.findFirst({
    where: or(
      and(eq(blocks.blockerId, userIdA), eq(blocks.blockedId, userIdB)),
      and(eq(blocks.blockerId, userIdB), eq(blocks.blockedId, userIdA)),
    ),
  });
  return row != null;
}
