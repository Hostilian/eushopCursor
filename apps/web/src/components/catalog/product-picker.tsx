'use client';

import { Check, Image as ImageIcon, Link2, Plus, Search, Sparkles, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Button } from '../ui/button';

/**
 * Universal product picker. Replaces freeform "type a product name" textarea
 * with a guided flow:
 *
 *   1. Search the catalog (Meili → Postgres → curated fallback → Open Food
 *      Facts) and show up to N hits, each with up to 3 image candidates so
 *      the user can pick whichever matches their physical product.
 *   2. If they can't find their item, three escape hatches:
 *        - Upload a photo (presigned R2 PUT).
 *        - Paste an image URL (server fetches + re-hosts on R2 via
 *          `media.fetchRemoteImage`, stripping origin EXIF + hotlinking).
 *        - Propose a brand new product (creates a `food_item_candidate` row
 *          in the moderation queue).
 *
 * Selection is reported to the parent via `onSelect`. The parent owns the
 * resulting state (foodItemId, freeformName, photos) — this component is
 * purely presentational beyond the network calls it performs.
 */

export interface ProductPickerSelection {
  /** Existing canonical food item id if the user picked one. */
  foodItemId?: string;
  /** Freeform name typed in or pulled from a remote (OFF) candidate. */
  freeformName?: string;
  /** Photo URLs to attach to the listing/request/trip the user is composing. */
  photos: { url: string }[];
  /** True when the user proposed a new catalog item; the parent can show a
   *  little "Submitted for moderation" badge in the success state. */
  proposedNewItem?: boolean;
}

interface Props {
  value: ProductPickerSelection;
  onChange: (next: ProductPickerSelection) => void;
  /** Storage purpose passed to media.presign / media.fetchRemoteImage. */
  purpose?: 'listing' | 'food-item' | 'food-item-proposal';
  /** Translate a category to a slug list when the user proposes a new item. */
  proposeCategoryOptions?: { slug: string; name: string }[];
}

const CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

function debounce<TArgs extends unknown[], TR>(fn: (...a: TArgs) => TR, ms: number) {
  let h: ReturnType<typeof setTimeout> | null = null;
  return (...a: TArgs) => {
    if (h) clearTimeout(h);
    h = setTimeout(() => fn(...a), ms);
  };
}

export function ProductPicker({
  value,
  onChange,
  purpose = 'listing',
  proposeCategoryOptions = [],
}: Props) {
  const t = useTranslations('productPicker');
  const [query, setQuery] = useState(value.freeformName ?? '');
  const [debouncedQ, setDebouncedQ] = useState(query);
  const [pasteUrl, setPasteUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setDebouncedQDeb = useMemo(() => debounce((s: string) => setDebouncedQ(s), 300), []);
  useEffect(() => {
    setDebouncedQDeb(query);
  }, [query, setDebouncedQDeb]);

  const search = trpc.catalog.searchWithSuggestions.useQuery(
    { q: debouncedQ, limit: 8, includeRemote: true },
    { enabled: debouncedQ.length >= 2, staleTime: 30_000 },
  );
  const presign = trpc.media.presign.useMutation();
  const fetchRemote = trpc.media.fetchRemoteImage.useMutation();
  const proposeItem = trpc.catalog.proposeItem.useMutation();

  const selectHit = (hit: NonNullable<typeof search.data>[number], imageUrl?: string) => {
    const pickedImage = imageUrl ?? hit.images[0];
    onChange({
      foodItemId: hit.source === 'local' ? hit.id : undefined,
      freeformName: hit.name,
      photos: pickedImage ? [{ url: pickedImage }] : value.photos,
    });
  };

  const onUpload = async (file: File) => {
    setError(null);
    if (!CONTENT_TYPES.includes(file.type as ContentType)) {
      setError(t('errorFileType'));
      return;
    }
    setUploading(true);
    try {
      const presigned = await presign.mutateAsync({
        filename: file.name,
        contentType: file.type as ContentType,
        byteLength: file.size,
        purpose: purpose === 'listing' ? 'listing' : 'food-item',
      });
      if (!presigned.uploadUrl.startsWith('data:')) {
        await fetch(presigned.uploadUrl, {
          method: 'PUT',
          headers: presigned.headers,
          body: file,
        });
      }
      onChange({
        ...value,
        freeformName: value.freeformName?.trim().length ? value.freeformName : query.trim(),
        photos: [...value.photos, { url: presigned.publicUrl }],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorUploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const onPaste = async () => {
    setError(null);
    if (!pasteUrl) return;
    try {
      const { publicUrl } = await fetchRemote.mutateAsync({
        url: pasteUrl,
        purpose: purpose === 'listing' ? 'listing' : 'food-item-proposal',
      });
      onChange({
        ...value,
        freeformName: value.freeformName?.trim().length ? value.freeformName : query.trim(),
        photos: [...value.photos, { url: publicUrl }],
      });
      setPasteUrl('');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorFetchImage'));
    }
  };

  const removePhoto = (idx: number) =>
    onChange({ ...value, photos: value.photos.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <div className="border-ink/15 bg-paper flex items-center gap-2 rounded-2xl border px-4 py-3">
        <Search className="text-ash h-4 w-4" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Stop tying selection to whatever was last picked when the user
            // rewrites the search; the parent learns about a fresh choice
            // only when they tap a hit again.
            if (value.foodItemId)
              onChange({ ...value, foodItemId: undefined, freeformName: e.target.value });
            else onChange({ ...value, freeformName: e.target.value });
          }}
          placeholder={t('searchPlaceholder')}
          className="form-input border-0 bg-transparent px-0"
        />
        {value.foodItemId ? (
          <span className="border-saffron-300 bg-saffron-50 text-saffron-800 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
            <Check className="h-3 w-3" /> {t('catalogMatch')}
          </span>
        ) : null}
      </div>

      {search.data && search.data.length > 0 ? (
        <ul className="space-y-2">
          {search.data.map((hit) => (
            <li
              key={hit.id}
              className={`border-ink/10 group rounded-2xl border p-3 transition-colors ${
                value.foodItemId === hit.id ? 'border-saffron-400 bg-saffron-50/40' : 'bg-paper'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex shrink-0 gap-1">
                  {hit.images.slice(0, 3).map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => selectHit(hit, src)}
                      className="border-ink/10 hover:border-ink/30 relative h-14 w-14 overflow-hidden rounded-xl border"
                      aria-label={t('useImageForAria', { n: i + 1, name: hit.name })}
                    >
                      <Image
                        src={src}
                        alt={hit.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                  {hit.images.length === 0 ? (
                    <div className="bg-bone text-ash grid h-14 w-14 place-items-center rounded-xl">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-ink truncate font-medium">{hit.name}</p>
                    {hit.source === 'remote' ? (
                      <span className="text-ash inline-flex items-center gap-1 text-[10px] tracking-widest uppercase">
                        <Sparkles className="h-3 w-3" /> {t('openFoodFactsShort')}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-ash mt-0.5 line-clamp-2 text-xs">{hit.description}</p>
                </div>
                <Button
                  type="button"
                  variant={value.foodItemId === hit.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => selectHit(hit)}
                >
                  {value.foodItemId === hit.id ? t('selected') : t('useThis')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {debouncedQ.length >= 2 && search.data && search.data.length === 0 ? (
        <p className="text-ash text-xs">{t('emptyCatalogHint')}</p>
      ) : null}

      <div className="border-ink/10 bg-bone/40 grid gap-3 rounded-2xl border p-4 sm:grid-cols-3">
        <label className="border-ink/15 hover:border-ink/30 bg-paper flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-4 text-center text-xs">
          <Upload className="text-ash h-4 w-4" />
          <span className="text-ink font-medium">
            {uploading ? t('uploading') : t('uploadPhoto')}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onUpload(f);
              e.currentTarget.value = '';
            }}
          />
        </label>
        <div className="border-ink/15 bg-paper rounded-xl border p-3">
          <div className="text-ash flex items-center gap-1 text-xs">
            <Link2 className="h-3.5 w-3.5" /> {t('pasteUrlLabel')}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              placeholder={t('pasteUrlPlaceholder')}
              className="form-input flex-1 px-3 py-1.5 text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void onPaste()}
              disabled={!pasteUrl || fetchRemote.isPending}
            >
              {fetchRemote.isPending ? t('pasteUrlPending') : t('pasteUrlAdd')}
            </Button>
          </div>
          <p className="text-ash mt-1 text-[10px]">{t('pasteUrlFootnote')}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowProposeModal(true)}
          className="border-saffron-300 bg-saffron-50 hover:border-saffron-500 text-saffron-900 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-4 text-center text-xs"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">{t('proposeProduct')}</span>
          <span className="text-saffron-700/80 text-[10px]">{t('proposeProductHint')}</span>
        </button>
      </div>

      {value.photos.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.photos.map((p, idx) => (
            <div
              key={p.url + idx}
              className="group bg-bone relative h-20 w-20 overflow-hidden rounded-xl"
            >
              <Image src={p.url} alt="" fill sizes="80px" className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="bg-ink/80 text-paper absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="text-danger text-xs">{error}</p> : null}

      {showProposeModal ? (
        <ProposeItemModal
          initialName={query}
          categoryOptions={proposeCategoryOptions}
          onCancel={() => setShowProposeModal(false)}
          onSubmit={async (input) => {
            try {
              await proposeItem.mutateAsync({
                name: input.name,
                categorySlug: input.categorySlug,
                originCountryIso2: input.originCountryIso2,
                description: input.description,
                proposedImages: value.photos.map((p) => ({ url: p.url, source: 'r2' })),
              });
              setShowProposeModal(false);
              onChange({ ...value, freeformName: input.name, proposedNewItem: true });
            } catch (e) {
              setError(e instanceof Error ? e.message : t('errorSubmitProposal'));
            }
          }}
        />
      ) : null}
    </div>
  );
}

function ProposeItemModal({
  initialName,
  categoryOptions,
  onCancel,
  onSubmit,
}: {
  initialName: string;
  categoryOptions: { slug: string; name: string }[];
  onCancel: () => void;
  onSubmit: (input: {
    name: string;
    categorySlug: string;
    originCountryIso2: string;
    description?: string;
  }) => Promise<void>;
}) {
  const t = useTranslations('productPicker');
  const [name, setName] = useState(initialName);
  const [categorySlug, setCategorySlug] = useState(categoryOptions[0]?.slug ?? 'snacks');
  const [iso, setIso] = useState('PL');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="bg-ink/30 fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-paper w-full max-w-lg space-y-4 rounded-3xl p-6">
        <div>
          <h3 className="text-ink font-serif text-2xl">{t('proposeModalTitle')}</h3>
          <p className="text-ash mt-1 text-xs">{t('proposeModalBody')}</p>
        </div>
        <label className="block">
          <span className="text-ink text-sm font-medium">{t('proposeName')}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input mt-1 w-full"
            placeholder={t('proposeNamePlaceholder')}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-ink text-sm font-medium">{t('proposeCategory')}</span>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="form-input mt-1 w-full"
            >
              {(categoryOptions.length
                ? categoryOptions
                : [{ slug: 'snacks', name: 'Snacks' }]
              ).map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-ink text-sm font-medium">{t('proposeOriginIso2')}</span>
            <input
              value={iso}
              onChange={(e) => setIso(e.target.value.toUpperCase().slice(0, 2))}
              className="form-input mt-1 w-full"
              placeholder={t('proposeOriginPlaceholder')}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-ink text-sm font-medium">{t('proposeDescription')}</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="form-input mt-1 w-full"
            placeholder={t('proposeDescriptionPlaceholder')}
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            {t('proposeCancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!name || !categorySlug || iso.length !== 2 || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onSubmit({ name, categorySlug, originCountryIso2: iso, description });
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? t('proposeSubmitting') : t('proposeSubmit')}
          </Button>
        </div>
      </div>
    </div>
  );
}
