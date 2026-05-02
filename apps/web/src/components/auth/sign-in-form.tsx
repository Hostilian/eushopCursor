'use client';

import { useState } from 'react';
import { Button } from '../ui/button';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/auth/magic-link/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, callbackURL: '/profile' }),
      });
      if (!res.ok) throw new Error('Could not send link');
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <p className="font-serif text-2xl text-ink">Check your inbox.</p>
        <p className="mt-3 text-sm text-ash">A magic link is on its way to {email}.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-6"
    >
      <label className="block">
        <span className="block text-sm font-medium text-ink">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.eu"
          className="mt-2 w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm focus:border-saffron-500 focus:outline-none"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Send magic link'}
      </Button>
      <p className="text-xs text-ash">
        By continuing you agree to our <a href="/terms" className="underline">Terms</a> and
        <a href="/privacy" className="ml-1 underline">Privacy</a>.
      </p>
    </form>
  );
}
