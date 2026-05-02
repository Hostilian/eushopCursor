'use client';

import Link from 'next/link';
import { trpc } from '../../lib/trpc';
import { Button } from '../ui/button';

function hrefForNotification(n: { kind: string; data: Record<string, unknown> }): string | null {
  const d = n.data;
  switch (n.kind) {
    case 'new-message':
      return typeof d.conversationId === 'string' ? `/messages/${d.conversationId}` : '/messages';
    case 'new-listing-match':
      return typeof d.listingId === 'string' ? `/listings/${d.listingId}` : '/discover';
    case 'new-request-match':
      return '/requests';
    case 'trip-reservation':
    case 'trip-departure-soon':
      return typeof d.tripOfferId === 'string' ? `/trips/${d.tripOfferId}` : '/trips';
    case 'review-received':
      return '/profile';
    case 'system':
      if (typeof d.tripOfferId === 'string') return `/trips/${d.tripOfferId}`;
      if (typeof d.requestId === 'string') return '/requests';
      return null;
    default:
      return null;
  }
}

export function NotificationsPanel() {
  const list = trpc.notifications.list.useQuery(undefined, { retry: false });
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => void list.refetch(),
  });
  const markAll = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => void list.refetch(),
  });

  if (list.isLoading) {
    return <p className="text-ash mt-8">Loading…</p>;
  }
  if (list.error) {
    return (
      <div className="border-ink/10 bg-porcelain mt-8 rounded-3xl border p-12 text-center">
        <p className="text-ink font-serif text-2xl">Sign in to view notifications</p>
        <Button asChild variant="primary" className="mt-4">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  const rows = list.data ?? [];
  const unread = rows.filter((r) => !r.readAt).length;

  return (
    <div className="mt-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink/70 text-sm" aria-live="polite">
          {unread > 0 ? (
            <span>
              <span className="text-ink font-medium">{unread}</span> unread
            </span>
          ) : (
            <span>All caught up.</span>
          )}
        </p>
        {unread > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            Mark all read
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="border-ink/10 bg-porcelain rounded-3xl border p-12 text-center">
          <p className="text-ink/80 text-sm">
            No notifications yet — matches and messages show up here.
          </p>
        </div>
      ) : (
        <ul className="border-ink/10 divide-ink/10 divide-y rounded-3xl border bg-white">
          {rows.map((n) => {
            const href = hrefForNotification(n);
            const isUnread = !n.readAt;
            return (
              <li key={n.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {isUnread ? (
                      <span className="bg-saffron-500 h-2 w-2 shrink-0 rounded-full" aria-hidden />
                    ) : null}
                    <p className="text-ink font-medium">{n.title}</p>
                  </div>
                  <p className="text-ink/70 mt-1 text-sm">{n.body}</p>
                  <p className="text-ash mt-2 text-xs">
                    {new Date(n.createdAt).toLocaleString()} · {n.kind}
                  </p>
                  {href ? (
                    <Link
                      href={href}
                      className="text-saffron-700 mt-2 inline-block text-xs underline"
                    >
                      Open related →
                    </Link>
                  ) : null}
                </div>
                {isUnread ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={markRead.isPending}
                    onClick={() => markRead.mutate({ id: n.id })}
                  >
                    Mark read
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
