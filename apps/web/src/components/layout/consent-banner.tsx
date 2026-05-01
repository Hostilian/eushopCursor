'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const STORAGE_KEY = 'eushop.consent.v1';

interface Consent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
}

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) setShow(true);
  }, []);

  const save = (consent: Consent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-3xl border border-ink/10 bg-porcelain p-6 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-ink/80">
          Eushop uses only the cookies required to keep you signed in and to remember your
          language. Analytics and marketing are off by default. EU rules; honour them.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => save({ necessary: true, analytics: false, marketing: false, ts: Date.now() })}
          >
            Reject all
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => save({ necessary: true, analytics: true, marketing: false, ts: Date.now() })}
          >
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
