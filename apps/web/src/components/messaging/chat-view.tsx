'use client';

import { MESSAGING_SAFE_TEMPLATES as SAFE_TEMPLATES } from '@eushop/validators';
import { TRPCClientError } from '@trpc/client';
import { Send, UserX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Button } from '../ui/button';

export function ChatView({ conversationId }: { conversationId: string }) {
  const t = useTranslations('chat');
  const me = trpc.profile.me.useQuery(undefined, { retry: false });
  const { data, isLoading, error } = trpc.messaging.conversation.useQuery(
    { id: conversationId },
    { retry: false },
  );
  const send = trpc.messaging.send.useMutation();
  const [body, setBody] = useState('');
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);
  const utils = trpc.useUtils();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const myId = me.data?.user.id;
  const conv = data?.conversation;
  const peerId =
    myId && conv ? (conv.initiatorId === myId ? conv.recipientId : conv.initiatorId) : undefined;

  const blockStatus = trpc.profile.blockStatus.useQuery(
    { userId: peerId! },
    { enabled: Boolean(peerId && myId), retry: false },
  );

  const blockUser = trpc.profile.blockUser.useMutation({
    onSuccess: async () => {
      await utils.profile.blockStatus.invalidate({ userId: peerId! });
      await utils.messaging.list.invalidate();
    },
  });
  const unblockUser = trpc.profile.unblockUser.useMutation({
    onSuccess: async () => {
      await utils.profile.blockStatus.invalidate({ userId: peerId! });
      await utils.messaging.list.invalidate();
    },
  });

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [data?.messages.length]);

  if (me.isLoading || isLoading) return <p className="text-ash">{t('loading')}</p>;
  if (!me.data) {
    return (
      <div className="border-ink/10 bg-porcelain rounded-3xl border p-12 text-center">
        <p className="text-ink font-serif text-2xl">Sign in to view this chat</p>
      </div>
    );
  }
  if (error instanceof TRPCClientError && error.data?.code === 'FORBIDDEN') {
    return (
      <div className="border-ink/10 bg-porcelain rounded-3xl border p-12 text-center">
        <p className="text-ink font-serif text-2xl">This conversation is not available</p>
        <p className="text-ash mt-2 text-sm">
          Messaging may be limited when someone has blocked the other party.
        </p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="border-ink/10 bg-porcelain rounded-3xl border p-12 text-center">
        <p className="text-ink font-serif text-2xl">Conversation not found</p>
      </div>
    );
  }

  const blocked = blockStatus.data?.blocked;
  const iBlocked = blockStatus.data?.iBlockedThem;
  const theyBlocked = blockStatus.data?.theyBlockedMe;
  const canSend = !blocked;

  return (
    <div className="border-ink/10 bg-porcelain grid h-[calc(100vh-12rem)] grid-rows-[auto_1fr_auto] rounded-3xl border">
      <header className="border-ink/10 border-b p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-ink font-serif text-2xl">
              Conversation #{conversationId.slice(0, 8)}
            </p>
            <p className="text-ash text-sm">
              Privacy first — keep details inside the chat. Eushop never reveals exact addresses.
            </p>
          </div>
          {peerId && (
            <div className="flex flex-col items-end gap-2">
              {theyBlocked ? (
                <p className="text-oxide max-w-xs text-right text-xs">
                  You cannot reply in this thread.
                </p>
              ) : iBlocked ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={unblockUser.isPending}
                  onClick={() => unblockUser.mutate({ userId: peerId })}
                >
                  Unblock
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-oxide/30 text-oxide hover:bg-oxide/5 gap-1.5"
                  disabled={blockUser.isPending}
                  onClick={() => setConfirmBlockOpen(true)}
                >
                  <UserX className="h-3.5 w-3.5" />
                  Block
                </Button>
              )}
            </div>
          )}
        </div>
        {confirmBlockOpen ? (
          <div className="border-oxide/20 bg-oxide/5 mt-3 rounded-2xl border px-4 py-3">
            <p className="text-ink text-sm">
              Block this user? You will not be able to message each other.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={blockUser.isPending}
                onClick={() => setConfirmBlockOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-oxide text-paper hover:bg-oxide/90"
                disabled={blockUser.isPending}
                onClick={() => {
                  blockUser.mutate({ userId: peerId });
                  setConfirmBlockOpen(false);
                }}
              >
                Confirm block
              </Button>
            </div>
          </div>
        ) : null}
        {theyBlocked ? (
          <p className="border-oxide/20 bg-oxide/5 text-ink mt-3 rounded-2xl border px-4 py-3 text-sm">
            This person has blocked you. You cannot send new messages here.
          </p>
        ) : null}
        {iBlocked ? (
          <p className="border-ink/15 bg-ink/5 text-ink mt-3 rounded-2xl border px-4 py-3 text-sm">
            You have blocked this person. Unblock to message again.
          </p>
        ) : null}
      </header>

      <div ref={scrollerRef} className="space-y-3 overflow-y-auto p-5">
        {data.messages.map((m) => (
          <div key={m.id} className="bg-paper text-ink max-w-[80%] rounded-2xl p-3 text-sm">
            <p>{m.body}</p>
            <p className="text-ash mt-1 text-[10px] tracking-widest uppercase">
              {new Date(m.createdAt).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      <div className="border-ink/10 border-t p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {SAFE_TEMPLATES.map((t) => (
            <button
              key={t}
              type="button"
              disabled={!canSend}
              onClick={() => setBody(t)}
              className="border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink rounded-full border px-3 py-1 text-xs disabled:opacity-40"
            >
              {t}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSend || !body.trim()) return;
            await send.mutateAsync({ conversationId, body });
            setBody('');
            await utils.messaging.conversation.invalidate({ id: conversationId });
          }}
        >
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={!canSend}
            placeholder={canSend ? t('placeholder') : t('placeholderUnavailable')}
            className="border-ink/10 bg-paper focus:border-saffron-500 flex-1 rounded-2xl border px-4 py-3 text-sm focus:outline-none disabled:opacity-50"
          />
          <Button type="submit" size="icon" aria-label="Send" disabled={!canSend}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
