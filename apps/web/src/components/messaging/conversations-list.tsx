'use client';

import Link from 'next/link';
import { trpc } from '../../lib/trpc';
import { timeAgo } from '../../lib/utils';

export function ConversationsList() {
  const { data, isLoading, error } = trpc.messaging.list.useQuery(undefined, { retry: false });

  if (isLoading) return <p className="text-ash mt-12">Loading…</p>;
  if (error) {
    return (
      <div className="border-ink/10 bg-porcelain mt-12 rounded-3xl border p-12 text-center">
        <p className="text-ink font-serif text-2xl">Sign in to see your inbox</p>
        <p className="text-ink/70 mt-2">All chats are end-to-end private between matched users.</p>
      </div>
    );
  }
  if (!data?.length) {
    return (
      <div className="border-ink/10 bg-porcelain mt-12 rounded-3xl border p-12 text-center">
        <p className="text-ink font-serif text-2xl">No conversations yet</p>
        <p className="text-ink/70 mt-2">Find a listing you like and start a chat.</p>
      </div>
    );
  }

  return (
    <ul className="divide-ink/10 border-ink/10 bg-porcelain mt-10 divide-y rounded-3xl border">
      {data.map((c) => (
        <li key={c.id}>
          <Link
            href={`/messages/${c.id}`}
            className="hover:bg-paper flex items-center justify-between gap-4 p-5 transition-colors"
          >
            <div>
              <p className="text-ink font-serif text-lg">Conversation #{c.id.slice(0, 8)}</p>
              <p className="text-ash text-sm">Last activity {timeAgo(c.lastMessageAt)}</p>
            </div>
            <span className="text-ash text-xs">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
