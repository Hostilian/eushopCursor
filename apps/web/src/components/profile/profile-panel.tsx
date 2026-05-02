'use client';

import { COUNTRIES } from '@eushop/catalog-data';
import { Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function ProfilePanel() {
  const me = trpc.profile.me.useQuery(undefined, { retry: false });
  const upsert = trpc.profile.upsert.useMutation({ onSuccess: () => me.refetch() });
  const exportData = trpc.profile.exportMyData.useQuery(undefined, { enabled: false });
  const deleteAcct = trpc.profile.deleteMyAccount.useMutation();
  const [name, setName] = useState('');
  const [home, setHome] = useState('');
  const [current, setCurrent] = useState('');
  const [city, setCity] = useState('');

  if (me.isLoading) return <p className="mt-12 text-ash">Loading…</p>;
  if (me.error || !me.data) {
    return (
      <div className="mt-12 rounded-3xl border border-ink/10 bg-porcelain p-12 text-center">
        <p className="font-serif text-2xl text-ink">Sign in to view your profile</p>
      </div>
    );
  }
  const profile = me.data.profile;

  return (
    <div className="mt-12 grid gap-12 md:grid-cols-3">
      <section className="md:col-span-2 space-y-8 rounded-3xl border border-ink/10 bg-porcelain p-8">
        <h2 className="font-serif text-2xl text-ink">Identity</h2>
        <Field label="Display name">
          <input
            defaultValue={profile?.displayName ?? ''}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="Anna K."
          />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Home country">
            <select
              defaultValue={profile?.homeCountry ?? ''}
              onChange={(e) => setHome(e.target.value)}
              className="form-input"
            >
              <option value="">—</option>
              {COUNTRIES.map((c) => (
                <option key={c.iso2} value={c.iso2}>
                  {c.flagEmoji} {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Current country">
            <select
              defaultValue={profile?.currentCountry ?? ''}
              onChange={(e) => setCurrent(e.target.value)}
              className="form-input"
            >
              <option value="">—</option>
              {COUNTRIES.map((c) => (
                <option key={c.iso2} value={c.iso2}>
                  {c.flagEmoji} {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Approximate city" hint="Stored as a 5km cell — never the address.">
          <input
            defaultValue={profile?.currentCity ?? ''}
            onChange={(e) => setCity(e.target.value)}
            className="form-input"
            placeholder="Munich Glockenbach"
          />
        </Field>
        <Button
          onClick={() =>
            upsert.mutate({
              displayName: name || undefined,
              homeCountry: home || undefined,
              currentCountry: current || undefined,
              currentCity: city || undefined,
            })
          }
        >
          Save profile
        </Button>

        <style jsx>{`
          :global(.form-input) {
            width: 100%;
            background: var(--color-paper);
            border: 1px solid color-mix(in oklch, var(--color-ink) 10%, transparent);
            border-radius: 1rem;
            padding: 0.875rem 1rem;
            font-size: 0.95rem;
          }
          :global(.form-input:focus) {
            outline: none;
            border-color: var(--color-saffron-500);
          }
        `}</style>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-ink/10 bg-porcelain p-6">
          <p className="text-xs uppercase tracking-widest text-ash">Trust</p>
          <p className="mt-3 font-serif text-2xl text-ink">
            {profile?.successfulExchanges ?? 0} exchanges
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(profile?.badges ?? []).map((b) => (
              <Badge key={b} variant="accent">{b}</Badge>
            ))}
            <Badge variant="soft">Verified email</Badge>
          </div>
        </div>

        <div className="rounded-3xl border border-ink/10 bg-porcelain p-6">
          <p className="text-xs uppercase tracking-widest text-ash">GDPR</p>
          <p className="mt-3 text-sm text-ink/80">
            You can export everything we hold or delete your account at any moment.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const data = await exportData.refetch();
                const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `eushop-export-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="mr-1 h-4 w-4" /> Export my data
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger hover:bg-danger/10"
              onClick={() => {
                if (confirm('Delete your Eushop account permanently?')) {
                  deleteAcct.mutate();
                }
              }}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Delete account
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-ash">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}
