'use client';

import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Button } from '../ui/button';

const SAFE_TEMPLATES = [
  'Hi! Is your stash still available?',
  'Could we meet near a metro stop you like?',
  'What freshness window works for the handoff?',
  'Happy with the finder\u2019s fee — Revolut/cash on pickup?',
];

export function ChatView({ conversationId }: { conversationId: string }) {
  const { data, isLoading } = trpc.messaging.conversation.useQuery({ id: conversationId }, { retry: false });
  const send = trpc.messaging.send.useMutation();
  const [body, setBody] = useState('');
  const utils = trpc.useUtils();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [data?.messages.length]);

  if (isLoading) return <p className="text-ash">Loading…</p>;
  if (!data) {
    return (
      <div className="rounded-3xl border border-ink/10 bg-porcelain p-12 text-center">
        <p className="font-serif text-2xl text-ink">Sign in to view this chat</p>
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-12rem)] grid-rows-[auto_1fr_auto] rounded-3xl border border-ink/10 bg-porcelain">
      <header className="border-b border-ink/10 p-5">
        <p className="font-serif text-2xl text-ink">Conversation #{conversationId.slice(0, 8)}</p>
        <p className="text-sm text-ash">
          Privacy first — keep details inside the chat. Eushop never reveals exact addresses.
        </p>
      </header>

      <div ref={scrollerRef} className="space-y-3 overflow-y-auto p-5">
        {data.messages.map((m) => (
          <div
            key={m.id}
            className="max-w-[80%] rounded-2xl bg-paper p-3 text-sm text-ink"
          >
            <p>{m.body}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-ash">
              {new Date(m.createdAt).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-ink/10 p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {SAFE_TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => setBody(t)}
              className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink/70 hover:border-ink/40 hover:text-ink"
            >
              {t}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!body.trim()) return;
            await send.mutateAsync({ conversationId, body });
            setBody('');
            await utils.messaging.conversation.invalidate({ id: conversationId });
          }}
        >
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message"
            className="flex-1 rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm focus:border-saffron-500 focus:outline-none"
          />
          <Button type="submit" size="icon" aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
