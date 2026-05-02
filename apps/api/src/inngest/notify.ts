import { db, deviceTokens, users } from '@eushop/db';
import { eq } from 'drizzle-orm';

/**
 * Multi-channel notification helper used by trip and request workflows.
 *
 * Always writes the in-app row (already done by the calling step in most
 * places); this helper layers email (Resend) and Expo push on top, gated on
 * the matching env keys. Failures here never throw — push and email are
 * best-effort; missing keys log a single line per send.
 */
export async function notifyExternalChannels(opts: {
  userId: string;
  emailSubject: string;
  emailHtml: string;
  pushTitle: string;
  pushBody: string;
  pushData?: Record<string, unknown>;
}): Promise<{ emailed: boolean; pushed: number }> {
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, opts.userId))
    .limit(1);

  let emailed = false;
  if (user?.email && process.env.RESEND_API_KEY) {
    const from = process.env.EMAIL_FROM ?? 'Eushop <noreply@eushop.eu>';
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [user.email],
          subject: opts.emailSubject,
          html: opts.emailHtml,
        }),
      });
      emailed = res.ok;
      if (!res.ok) {
        console.error('[notify] resend failed', res.status, await res.text().catch(() => ''));
      }
    } catch (e) {
      console.error('[notify] resend threw', e);
    }
  } else if (user?.email) {
    // Dev: surface the message in the API console so the flow is debuggable
    // without an email provider configured.
    console.info(`[notify:email] ${user.email}: ${opts.emailSubject}`);
  }

  const tokens = await db
    .select({ token: deviceTokens.expoPushToken })
    .from(deviceTokens)
    .where(eq(deviceTokens.userId, opts.userId));

  let pushed = 0;
  if (tokens.length) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.EXPO_PUSH_ACCESS_TOKEN) {
      headers.Authorization = `Bearer ${process.env.EXPO_PUSH_ACCESS_TOKEN}`;
    }
    const payload = tokens.map((t) => ({
      to: t.token,
      sound: 'default' as const,
      title: opts.pushTitle,
      body: opts.pushBody,
      data: opts.pushData ?? {},
    }));
    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      pushed = res.ok ? tokens.length : 0;
      if (!res.ok) {
        console.error('[notify] expo push failed', res.status, await res.text().catch(() => ''));
      }
    } catch (e) {
      console.error('[notify] expo push threw', e);
    }
  }

  return { emailed, pushed };
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
