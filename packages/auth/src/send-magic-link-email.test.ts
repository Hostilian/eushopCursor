import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendMagicLinkEmail } from './send-magic-link-email';

describe('sendMagicLinkEmail', () => {
  const originalFetch = globalThis.fetch;
  const originalResend = process.env.RESEND_API_KEY;
  const originalFrom = process.env.EMAIL_FROM;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.RESEND_API_KEY = originalResend;
    process.env.EMAIL_FROM = originalFrom;
    vi.restoreAllMocks();
  });

  it('logs when RESEND_API_KEY is unset', async () => {
    delete process.env.RESEND_API_KEY;
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    await sendMagicLinkEmail('a@b.eu', 'https://x/?token=1');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('[magic-link]'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('a@b.eu'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('https://x/?token=1'));
  });

  it('calls Resend when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.EMAIL_FROM = 'Eushop <test@example.com>';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '{}',
    }) as unknown as typeof fetch;

    await sendMagicLinkEmail('a@b.eu', 'https://x/?a=1&b=2');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer re_test',
        }) as Record<string, string>,
      }),
    );
    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(call[1].body as string) as { html: string };
    expect(body.html).toContain('href="https://x/?a=1&amp;b=2"');
  });
});
