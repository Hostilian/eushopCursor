'use client';

import Link from 'next/link';
import { trpc } from '../../lib/trpc';
import { timeAgo } from '../../lib/utils';

export function ConversationsList() {
  const { data, isLoading, error } = trpc.messaging.list.useQuery(undefined, { retry: false });

  if (isLoading) return <p className="mt-12 text-ash">Loading…</p>;
  if (error) {
    return (
      <div className="mt-12 rounded-3xl border border-ink/10 bg-porcelain p-12 text-center">
        <p className="font-serif text-2xl text-ink">Sign in to see your inbox</p>
        <p className="mt-2 text-ink/70">All chats are end-to-end private between matched users.</p>
      </div>
    );
  }
  if (!data?.length) {
    return (
      <div className="mt-12 rounded-3xl border border-ink/10 bg-porcelain p-12 text-center">
        <p className="font-serif text-2xl text-ink">No conversations yet</p>
        <p className="mt-2 text-ink/70">Find a listing you like and start a chat.</p>
      </div>
    );
  }

  return (
    <ul className="mt-10 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-porcelain">
      {data.map((c) => (
        <li key={c.id}>
          <Link
            href={`/messages/${c.id}`}
            className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-paper"
          >
            <div>
              <p className="font-serif text-lg text-ink">Conversation #{c.id.slice(0, 8)}</p>
              <p className="text-sm text-ash">Last activity {timeAgo(c.lastMessageAt)}</p>
            </div>
            <span className="text-xs text-ash">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
