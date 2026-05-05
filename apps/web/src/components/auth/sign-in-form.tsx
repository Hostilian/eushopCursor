'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '../ui/button';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function isLocalDevHostname(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

function emailLooksValid(value: string): boolean {
  if (value.length < 5 || value.length > 254) return false;
  const at = value.indexOf('@');
  return at > 0 && at < value.length - 3 && value.includes('.', at);
}

export function SignInForm() {
  const t = useTranslations('signInForm');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    const trimmed = email.trim();
    if (!emailLooksValid(trimmed)) {
      setError(t('invalidEmail'));
      setStatus('error');
      return;
    }

    setStatus('sending');
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/auth/magic-link/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: trimmed, callbackURL: '/profile' }),
      });
      if (!res.ok) {
        let message: string;
        if (res.status === 429) {
          message = t('errorTooMany');
        } else if (res.status >= 500) {
          message = t('errorServer');
        } else {
          message = t('errorSend');
        }
        throw new Error(message);
      }
      setStatus('sent');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorGeneric'));
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="text-center" role="status" aria-live="polite">
        <p className="text-ink font-serif text-2xl">{t('checkInbox')}</p>
        <p className="text-ash mt-3 text-sm">{t('linkOnWay', { email })}</p>
        {isLocalDevHostname() ? (
          <p className="text-ash mt-4 text-xs">
            {t('localDevHint')}{' '}
            <a
              href="http://localhost:8025"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {t('mailhogLink')}
            </a>
            ).
          </p>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-6"
          onClick={() => setStatus('idle')}
        >
          {t('useDifferentEmail')}
        </Button>
      </div>
    );
  }

  const pending = status === 'sending';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-6"
      noValidate
    >
      <label className="block">
        <span className="text-ink block text-sm font-medium">{t('emailLabel')}</span>
        <input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          aria-invalid={status === 'error' ? true : undefined}
          aria-describedby={status === 'error' ? 'sign-in-error' : undefined}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') {
              setStatus('idle');
              setError(null);
            }
          }}
          placeholder={t('emailPlaceholder')}
          className="border-ink/10 bg-paper focus:border-saffron-500 mt-2 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none"
        />
      </label>
      {error ? (
        <p id="sign-in-error" role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t('sending') : t('sendMagicLink')}
      </Button>
      <p className="text-ash text-xs">
        {t('termsLead')}{' '}
        <a href="/terms" className="underline">
          {t('terms')}
        </a>{' '}
        {t('and')}{' '}
        <a href="/privacy" className="underline">
          {t('privacy')}
        </a>
        .
      </p>
    </form>
  );
}
