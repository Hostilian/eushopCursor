import { escapeHtmlAttr } from './escape-html';

export async function sendMagicLinkEmail(to: string, url: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[magic-link] ${to} → ${url}`);
    return;
  }
  const from = process.env.EMAIL_FROM ?? 'Eushop <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Sign in to Eushop',
      html: `<p><a href="${escapeHtmlAttr(url)}">Sign in to Eushop</a></p><p>If you did not request this, you can ignore this email.</p>`,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('[magic-link] Resend error', res.status, body);
    throw new Error(`Magic link email failed (${res.status})`);
  }
}
