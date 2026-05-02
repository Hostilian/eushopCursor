'use client';

import { COUNTRIES } from '@eushop/catalog-data';
import { SUPPORTED_LOCALES, localeMeta } from '@eushop/i18n';
import { Download, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function ProfilePanel() {
  const t = useTranslations('profilePanel');
  const deleteWord = t('deletePhrase').trim().toLowerCase();
  const me = trpc.profile.me.useQuery(undefined, { retry: false });
  const myBlocks = trpc.profile.myBlocks.useQuery(undefined, { enabled: !!me.data, retry: false });
  const upsert = trpc.profile.upsert.useMutation({ onSuccess: () => me.refetch() });
  const unblockUser = trpc.profile.unblockUser.useMutation({
    onSuccess: () => {
      void myBlocks.refetch();
    },
  });
  const exportData = trpc.profile.exportMyData.useQuery(undefined, { enabled: false });
  const deleteAcct = trpc.profile.deleteMyAccount.useMutation();
  const [name, setName] = useState('');
  const [home, setHome] = useState('');
  const [current, setCurrent] = useState('');
  const [city, setCity] = useState('');
  const [locale, setLocale] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);

  if (me.isLoading) {
    return (
      <p className="text-ash mt-12" role="status">
        {t('loading')}
      </p>
    );
  }
  if (me.error || !me.data) {
    return (
      <div className="border-ink/10 bg-porcelain mt-12 rounded-3xl border p-12 text-center">
        <p className="text-ink font-serif text-2xl">{t('gateTitle')}</p>
        <Button asChild className="mt-6">
          <Link href="/sign-in">{t('gateCta')}</Link>
        </Button>
      </div>
    );
  }
  const profile = me.data.profile;
  const saveDisabled = upsert.isPending;

  const onExport = async () => {
    setExportError(null);
    try {
      const data = await exportData.refetch();
      if (data.error) throw data.error;
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eushop-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : t('exportFailed'));
    }
  };

  const onDelete = () => {
    if (deletePhrase.trim().toLowerCase() !== deleteWord) return;
    deleteAcct.mutate(undefined, {
      onSuccess: () => {
        globalThis.location?.assign('/');
      },
    });
  };

  return (
    <div className="mt-12 grid gap-12 md:grid-cols-3">
      <section className="border-ink/10 bg-porcelain space-y-8 rounded-3xl border p-8 md:col-span-2">
        <h2 className="text-ink font-serif text-2xl">{t('identityTitle')}</h2>
        <Field label={t('displayName')}>
          <input
            defaultValue={profile?.displayName ?? ''}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder={t('displayNamePlaceholder')}
            aria-label={t('displayName')}
          />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t('homeCountry')}>
            <select
              defaultValue={profile?.homeCountry ?? ''}
              onChange={(e) => setHome(e.target.value)}
              className="form-input"
              aria-label={t('homeCountry')}
            >
              <option value="">—</option>
              {COUNTRIES.map((c) => (
                <option key={c.iso2} value={c.iso2}>
                  {c.flagEmoji} {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('currentCountry')}>
            <select
              defaultValue={profile?.currentCountry ?? ''}
              onChange={(e) => setCurrent(e.target.value)}
              className="form-input"
              aria-label={t('currentCountry')}
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
        <Field label={t('approxCity')} hint={t('approxCityHint')}>
          <input
            defaultValue={profile?.currentCity ?? ''}
            onChange={(e) => setCity(e.target.value)}
            className="form-input"
            placeholder={t('approxCityPlaceholder')}
            aria-label={t('approxCity')}
          />
        </Field>
        <Field label={t('preferredLanguage')} hint={t('preferredLanguageHint')}>
          <select
            defaultValue={profile?.preferredLocale ?? ''}
            onChange={(e) => setLocale(e.target.value)}
            className="form-input"
            aria-label={t('preferredLanguage')}
          >
            <option value="">—</option>
            {SUPPORTED_LOCALES.map((code) => (
              <option key={code} value={code}>
                {localeMeta[code].native} ({code.toUpperCase()})
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-center gap-3">
          <Button
            disabled={saveDisabled}
            onClick={() =>
              upsert.mutate({
                displayName: name || undefined,
                homeCountry: home || undefined,
                currentCountry: current || undefined,
                currentCity: city || undefined,
                preferredLocale: locale || undefined,
              })
            }
          >
            {saveDisabled ? t('saving') : t('saveProfile')}
          </Button>
          {upsert.isSuccess ? (
            <span className="text-ash text-sm" role="status">
              {t('saved')}
            </span>
          ) : null}
          {upsert.error ? (
            <span className="text-danger text-sm" role="alert">
              {upsert.error.message}
            </span>
          ) : null}
        </div>

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
        <div className="border-ink/10 bg-porcelain rounded-3xl border p-6">
          <p className="text-ash text-xs tracking-widest uppercase">{t('inboxEyebrow')}</p>
          <p className="text-ink/80 mt-2 text-sm">{t('inboxBody')}</p>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link href="/notifications">{t('openNotifications')}</Link>
          </Button>
        </div>

        <div className="border-ink/10 bg-porcelain rounded-3xl border p-6">
          <p className="text-ash text-xs tracking-widest uppercase">{t('trustEyebrow')}</p>
          <p className="text-ink mt-3 font-serif text-2xl">
            {t('exchanges', { count: profile?.successfulExchanges ?? 0 })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(profile?.badges ?? []).map((b) => (
              <Badge key={b} variant="accent">
                {b}
              </Badge>
            ))}
            <Badge variant="soft">{t('verifiedEmail')}</Badge>
          </div>
        </div>

        <div className="border-ink/10 bg-porcelain rounded-3xl border p-6">
          <p className="text-ash text-xs tracking-widest uppercase">{t('blockedEyebrow')}</p>
          <p className="text-ink/80 mt-3 text-sm">{t('blockedBody')}</p>
          {myBlocks.isLoading ? (
            <p className="text-ash mt-3 text-sm">{t('blockedLoading')}</p>
          ) : (myBlocks.data?.length ?? 0) === 0 ? (
            <p className="text-ash mt-3 text-sm">{t('blockedNone')}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {myBlocks.data!.map((row) => (
                <li
                  key={row.id}
                  className="border-ink/10 bg-paper flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-sm"
                >
                  <span className="text-ash font-mono text-xs">
                    User {row.blockedId.slice(0, 8)}…
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={unblockUser.isPending}
                    onClick={() => unblockUser.mutate({ userId: row.blockedId })}
                  >
                    {t('unblock')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-ink/10 bg-porcelain rounded-3xl border p-6">
          <p className="text-ash text-xs tracking-widest uppercase">{t('gdprEyebrow')}</p>
          <p className="text-ink/80 mt-3 text-sm">{t('gdprBody')}</p>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={exportData.isFetching}
              onClick={() => void onExport()}
            >
              <Download className="mr-1 h-4 w-4" />
              {exportData.isFetching ? t('exportPreparing') : t('exportData')}
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/data-export">{t('exportDetails')}</Link>
            </Button>
            {exportError ? (
              <p className="text-danger text-xs" role="alert">
                {exportError}
              </p>
            ) : null}

            {confirmingDelete ? (
              <div className="border-danger/30 bg-danger/5 mt-2 space-y-2 rounded-2xl border p-3">
                <label className="text-ink/80 block text-xs">
                  {t('deleteIntro', { phrase: t('deletePhrase') })}
                  <input
                    value={deletePhrase}
                    onChange={(e) => setDeletePhrase(e.target.value)}
                    className="form-input mt-2"
                    aria-label={t('deletePhraseLabel')}
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setConfirmingDelete(false);
                      setDeletePhrase('');
                    }}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-danger text-paper hover:bg-danger/90"
                    disabled={
                      deleteAcct.isPending || deletePhrase.trim().toLowerCase() !== deleteWord
                    }
                    onClick={onDelete}
                  >
                    {deleteAcct.isPending ? t('deleting') : t('deletePermanently')}
                  </Button>
                </div>
                {deleteAcct.error ? (
                  <p className="text-danger text-xs" role="alert">
                    {deleteAcct.error.message}
                  </p>
                ) : null}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger/10"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 className="mr-1 h-4 w-4" /> {t('deleteAccount')}
              </Button>
            )}
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
      <span className="text-ink block text-sm font-medium">{label}</span>
      {hint ? <span className="text-ash mt-0.5 block text-xs">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}
