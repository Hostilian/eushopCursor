'use client';

import { useState } from 'react';
import { Button } from '../ui/button';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const isLocalDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

function emailLooksValid(value: string): boolean {
  if (value.length < 5 || value.length > 254) return false;
  const at = value.indexOf('@');
  return at > 0 && at < value.length - 3 && value.includes('.', at);
}

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    const trimmed = email.trim();
    if (!emailLooksValid(trimmed)) {
      setError('Please enter a valid email address.');
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
        const message =
          res.status === 429
            ? 'Too many requests. Try again in a minute.'
            : res.status >= 500
              ? 'Our auth service is unreachable right now. Please retry.'
              : 'Could not send the magic link. Check the address and try again.';
        throw new Error(message);
      }
      setStatus('sent');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="text-center" role="status" aria-live="polite">
        <p className="text-ink font-serif text-2xl">Check your inbox.</p>
        <p className="text-ash mt-3 text-sm">
          A magic link is on its way to <span className="text-ink/80">{email}</span>.
        </p>
        {isLocalDev ? (
          <p className="text-ash mt-4 text-xs">
            Local dev: if Resend isn&rsquo;t configured, the link is logged in the API console (and
            visible in{' '}
            <a
              href="http://localhost:8025"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Mailhog at :8025
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
          Use a different email
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
        <span className="text-ink block text-sm font-medium">Email</span>
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
          placeholder="you@example.eu"
          className="border-ink/10 bg-paper focus:border-saffron-500 mt-2 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none"
        />
      </label>
      {error ? (
        <p id="sign-in-error" role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Send magic link'}
      </Button>
      <p className="text-ash text-xs">
        By continuing you agree to our{' '}
        <a href="/terms" className="underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="/privacy" className="underline">
          Privacy
        </a>
        .
      </p>
    </form>
  );
}
