import { conversations, db, deviceTokens, messages, notifications } from '@eushop/db';
import { eq } from 'drizzle-orm';
import { inngest } from '../client.js';

export const notifyMessage = inngest.createFunction(
  { id: 'notify-on-new-message' },
  { event: 'message.sent' },
  async ({ event, step }) => {
    const msg = await step.run('load-message', () =>
      db.query.messages.findFirst({ where: eq(messages.id, event.data.messageId) }),
    );
    if (!msg) return { skipped: true };
    const conv = await step.run('load-conv', () =>
      db.query.conversations.findFirst({ where: eq(conversations.id, msg.conversationId) }),
    );
    if (!conv) return { skipped: true };
    const recipientId = conv.initiatorId === msg.senderId ? conv.recipientId : conv.initiatorId;

    await step.run('write-in-app-notification', () =>
      db.insert(notifications).values({
        userId: recipientId,
        kind: 'new-message',
        title: 'New message',
        body: msg.body.slice(0, 120),
        data: { conversationId: conv.id, messageId: msg.id },
      }),
    );

    const tokens = await step.run('load-device-tokens', () =>
      db.select().from(deviceTokens).where(eq(deviceTokens.userId, recipientId)),
    );
    if (!tokens.length) return { delivered: 0 };

    await step.run('expo-push', async () => {
      const accessToken = process.env.EXPO_PUSH_ACCESS_TOKEN;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const payload = tokens.map((t) => ({
        to: t.expoPushToken,
        sound: 'default',
        title: 'Eushop',
        body: msg.body.slice(0, 120),
        data: { conversationId: conv.id, kind: 'new-message' },
      }));

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      }).catch((err) => console.warn('expo push failed', err));
    });

    return { delivered: tokens.length };
  },
);
