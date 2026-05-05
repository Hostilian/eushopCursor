'use client';

import type { RouterOutputs } from '@eushop/api-router';
import { COUNTRIES } from '@eushop/catalog';
import {
  Check,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  Plus,
  Search,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Button } from '../ui/button';

type CatalogSearchHit = RouterOutputs['catalog']['searchWithSuggestions'][number];
type BrowseItem = RouterOutputs['catalog']['browse']['items'][number];

function browseItemToSearchHit(item: BrowseItem): CatalogSearchHit {
  const images = [item.imageVariants?.large, item.imageVariants?.small, item.defaultImageUrl]
    .filter((u): u is string => !!u)
    .slice(0, 3);
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    originCountryIso2: item.originCountryIso2,
    description: item.description,
    imageVariants: item.imageVariants,
    images,
    source: 'local',
    barcode: item.barcode ?? null,
    openFoodFactsId: item.openFoodFactsId ?? null,
  };
}

function flagEmojiForIso2(iso2: string) {
  const c = COUNTRIES.find((x) => x.iso2 === iso2.toUpperCase());
  return c?.flagEmoji ?? '🌍';
}

function countryNameForIso2(iso2: string) {
  const c = COUNTRIES.find((x) => x.iso2 === iso2.toUpperCase());
  return c?.name ?? iso2.toUpperCase();
}

function fallbackImageForItem(name: string, originCountryIso2: string) {
  const flag = flagEmojiForIso2(originCountryIso2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#f4efe7"/>
<stop offset="100%" stop-color="#e8dfd2"/>
</linearGradient>
</defs>
<rect width="800" height="800" fill="url(#bg)"/>
<circle cx="680" cy="120" r="140" fill="#c9770020"/>
<circle cx="120" cy="700" r="170" fill="#9a908120"/>
<text x="72" y="170" font-size="88" font-family="ui-serif, Georgia, serif">${flag}</text>
<foreignObject x="72" y="240" width="656" height="450">
<div xmlns="http://www.w3.org/1999/xhtml" style="font-family: ui-serif, Georgia, serif; color: #2e271f; font-size: 44px; line-height: 1.2; font-weight: 600;">
${name.replaceAll(/[<&>]/g, '')}
</div>
</foreignObject>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

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
}: Readonly<Props>) {
  const t = useTranslations('productPicker');
  const [query, setQuery] = useState(value.freeformName ?? '');
  const [debouncedQ, setDebouncedQ] = useState(query);
  const [pasteUrl, setPasteUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showCatalogPics, setShowCatalogPics] = useState(false);
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

  const selectHit = (hit: CatalogSearchHit, imageUrl?: string) => {
    const pickedImage =
      imageUrl ?? hit.images[0] ?? fallbackImageForItem(hit.name, hit.originCountryIso2);
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

      {debouncedQ.length >= 2 && search.data?.length === 0 ? (
        <p className="text-ash text-xs">{t('emptyCatalogHint')}</p>
      ) : null}

      <div className="border-ink/10 bg-bone/40 grid gap-3 rounded-2xl border p-4 sm:grid-cols-2 xl:grid-cols-4">
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
          onClick={() => setShowCatalogPics(true)}
          className="border-ink/15 bg-paper hover:border-saffron-400 hover:bg-saffron-50/50 text-ink flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-4 text-center text-xs transition-colors"
        >
          <LayoutGrid className="text-saffron-700 h-4 w-4" />
          <span className="font-medium">{t('pics')}</span>
          <span className="text-ash text-[10px]">{t('picsHint')}</span>
        </button>
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
              <Image
                src={p.url}
                alt={value.freeformName ?? ''}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
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

      {showCatalogPics ? (
        <CatalogPicsGallery
          onClose={() => setShowCatalogPics(false)}
          onPick={(hit, url) => {
            selectHit(hit, url);
            setShowCatalogPics(false);
          }}
        />
      ) : null}

      {showProposeModal ? (
        <ProposeItemModal
          initialName={query}
          categoryOptions={proposeCategoryOptions}
          attachedPhotos={value.photos}
          onOpenPics={() => setShowCatalogPics(true)}
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

function CatalogPicsGallery({
  onClose,
  onPick,
}: Readonly<{
  onClose: () => void;
  onPick: (hit: CatalogSearchHit, imageUrl?: string) => void;
}>) {
  const t = useTranslations('productPicker');
  const categories = trpc.catalog.categories.useQuery(undefined, { staleTime: 300_000 });
  const browse = trpc.catalog.browse.useInfiniteQuery(
    { limit: 60 },
    {
      staleTime: 60_000,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const skeletonKeys = [
    'sk1',
    'sk2',
    'sk3',
    'sk4',
    'sk5',
    'sk6',
    'sk7',
    'sk8',
    'sk9',
    'sk10',
    'sk11',
    'sk12',
  ];
  const [countryFilter, setCountryFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortMode, setSortMode] = useState<'name-asc' | 'name-desc'>('name-asc');
  const browseItems = useMemo(() => {
    // Dedupe by id even if the API ever sends overlapping pages (defence in
    // depth: the server fallback now honors `cursor` and terminates, but a
    // single bug there used to flood React with duplicate `<li key={item.id}>`
    // and stack hundreds of dev warnings within seconds).
    const pages = browse.data?.pages ?? [];
    const byId = new Map<string, BrowseItem>();
    for (const page of pages) {
      for (const item of page.items) {
        if (!byId.has(item.id)) byId.set(item.id, item);
      }
    }
    return Array.from(byId.values());
  }, [browse.data]);
  const availableCountryIso2 = useMemo(
    () =>
      Array.from(new Set(browseItems.map((item) => item.originCountryIso2))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [browseItems],
  );
  const filteredItems = useMemo(() => {
    const byCountry =
      countryFilter === 'all'
        ? browseItems
        : browseItems.filter((item) => item.originCountryIso2 === countryFilter);
    const byCategory =
      categoryFilter === 'all'
        ? byCountry
        : byCountry.filter((item) => item.categoryId === categoryFilter);
    return [...byCategory].sort((a, b) =>
      sortMode === 'name-asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
  }, [browseItems, countryFilter, categoryFilter, sortMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Auto-fetch up to MAX_AUTO_PAGES so the gallery feels infinite without
  // us cooking the network on a runaway server (the previous unconditional
  // version was the trigger for the duplicate-key flood). Past the cap, the
  // user taps the "Load more" button below the grid.
  const MAX_AUTO_PAGES = 3;
  useEffect(() => {
    if (!browse.hasNextPage || browse.isFetchingNextPage) return;
    const pagesLoaded = browse.data?.pages.length ?? 0;
    if (pagesLoaded >= MAX_AUTO_PAGES) return;
    void browse.fetchNextPage();
  }, [
    browse.hasNextPage,
    browse.isFetchingNextPage,
    browse.fetchNextPage,
    browse.data?.pages.length,
  ]);

  const content = (() => {
    if (browse.isLoading) {
      return (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {skeletonKeys.map((key) => (
            <li
              key={key}
              className="bg-bone border-ink/8 aspect-square animate-pulse rounded-2xl border"
            />
          ))}
        </ul>
      );
    }
    if (!filteredItems.length) return <p className="text-ash text-sm">{t('picsEmpty')}</p>;
    return (
      <>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filteredItems.map((item) => {
            const hit = browseItemToSearchHit(item);
            const src = hit.images[0] ?? fallbackImageForItem(item.name, item.originCountryIso2);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onPick(hit, src)}
                  className="border-ink/10 group bg-bone hover:border-saffron-400 relative aspect-square w-full overflow-hidden rounded-2xl border text-left transition-colors"
                  aria-label={t('picsUseFor', { name: item.name })}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 45vw, 200px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    unoptimized
                  />
                  <span className="bg-ink/75 text-paper pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 px-2 py-1.5 font-serif text-[11px] leading-snug opacity-0 transition-opacity group-hover:opacity-100">
                    {item.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {browse.hasNextPage ? (
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void browse.fetchNextPage()}
              disabled={browse.isFetchingNextPage}
              aria-label={t('picsLoadMoreAria')}
            >
              {browse.isFetchingNextPage ? t('uploading') : t('picsLoadMore')}
            </Button>
          </div>
        ) : null}
      </>
    );
  })();

  return (
    <div className="bg-ink/40 fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t('picsClose')}
        className="absolute inset-0"
        onClick={onClose}
      />
      <dialog
        open
        aria-modal="true"
        aria-labelledby="catalog-pics-title"
        className="bg-paper border-ink/10 relative flex max-h-[min(720px,85vh)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border p-0 shadow-2xl"
      >
        <div className="border-ink/10 flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 id="catalog-pics-title" className="text-ink font-serif text-2xl">
              {t('picsModalTitle')}
            </h2>
            <p className="text-ash mt-1 max-w-prose text-xs leading-relaxed">
              {t('picsModalBody')}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="shrink-0">
            {t('picsClose')}
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="form-input w-full rounded-xl py-2 text-xs"
            >
              <option value="all">All countries</option>
              {availableCountryIso2.map((iso2) => (
                <option key={iso2} value={iso2}>
                  {flagEmojiForIso2(iso2)} {countryNameForIso2(iso2)}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input w-full rounded-xl py-2 text-xs"
            >
              <option value="all">All categories</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as 'name-asc' | 'name-desc')}
              className="form-input w-full rounded-xl py-2 text-xs"
            >
              <option value="name-asc">Sort: Name A-Z</option>
              <option value="name-desc">Sort: Name Z-A</option>
            </select>
          </div>
          {content}
        </div>
      </dialog>
    </div>
  );
}

function ProposeItemModal({
  initialName,
  categoryOptions,
  attachedPhotos,
  onOpenPics,
  onCancel,
  onSubmit,
}: Readonly<{
  initialName: string;
  categoryOptions: { slug: string; name: string }[];
  attachedPhotos: { url: string }[];
  onOpenPics: () => void;
  onCancel: () => void;
  onSubmit: (input: {
    name: string;
    categorySlug: string;
    originCountryIso2: string;
    description?: string;
  }) => Promise<void>;
}>) {
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
        <div className="grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <label className="min-w-0">
            <span className="text-ink text-sm font-medium">{t('proposeCategory')}</span>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="form-input mt-1 w-full min-w-0 rounded-2xl py-2.5"
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
          <label className="min-w-0">
            <span className="text-ink text-sm font-medium">{t('proposeOriginIso2')}</span>
            <input
              value={iso}
              onChange={(e) =>
                setIso(
                  e.target.value
                    .replaceAll(/[^A-Za-z]/g, '')
                    .toUpperCase()
                    .slice(0, 2),
                )
              }
              className="form-input border-saffron-300/60 focus:border-saffron-500 mt-1 w-full min-w-0 rounded-2xl py-2.5 font-mono text-sm tracking-[0.35em]"
              placeholder={t('proposeOriginPlaceholder')}
              maxLength={2}
              spellCheck={false}
              autoCapitalize="characters"
              inputMode="text"
              autoComplete="off"
            />
          </label>
        </div>
        <div className="border-ink/10 bg-bone/40 rounded-2xl border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-ink text-xs font-medium">{t('proposePhotosStrip')}</span>
            <Button type="button" variant="outline" size="sm" onClick={onOpenPics}>
              <LayoutGrid className="mr-1 h-3.5 w-3.5" />
              {t('proposeOpenPics')}
            </Button>
          </div>
          {attachedPhotos.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachedPhotos.map((p, idx) => (
                <div
                  key={p.url + idx}
                  className="border-ink/10 relative h-14 w-14 overflow-hidden rounded-xl border"
                >
                  <Image
                    src={p.url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ash mt-2 text-[11px] leading-relaxed">{t('picsHint')}</p>
          )}
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
