/**
 * Open Food Facts client.
 *
 * Open Food Facts (https://world.openfoodfacts.org) is a community database
 * licensed CC-BY-SA 4.0. We use it as a *seed* and *fallback* when our
 * curated catalog or user submissions don't yet cover a product.
 *
 * The client is intentionally read-only and HTTP-only — no auth, no SDK
 * dependency. It runs from any environment that supports `fetch`.
 *
 * Attribution is mandatory. Every page that renders an OFF-sourced image
 * must surface "Product info via Open Food Facts contributors" — handled by
 * the `apps/web/src/app/(product)/items/[slug]/page.tsx` template.
 */

const SEARCH_ENDPOINT = 'https://world.openfoodfacts.org/cgi/search.pl';
const PRODUCT_ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product';
const USER_AGENT = 'Eushop/0.2 (+https://eushop.eu; contact@eushop.eu)';

export interface OpenFoodFactsCandidate {
  /** OFF `code` (GTIN-13 or shorter). Stable identity across snapshots. */
  barcode: string | null;
  name: string;
  description?: string;
  /** Two-letter origin guess: `origins_tags` first, then `countries_tags`. */
  originCountryIso2?: string;
  /** Up to three image URLs (`display_url`, `image_small_url`, `image_url`). */
  images: string[];
  /** Brand string as OFF reports it; we normalize on import, not on read. */
  brandRaw?: string;
  categoriesRaw?: string[];
}

export interface SearchOptions {
  limit?: number;
  /** Restrict to EU origin codes. We default-on this for the diaspora niche. */
  euOnly?: boolean;
  signal?: AbortSignal;
}

const EU_ISO2 = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'GB',
  'CH',
  'NO',
  'IS',
]);

interface OffApiProduct {
  code?: string;
  product_name?: string;
  generic_name?: string;
  brands?: string;
  origins_tags?: string[];
  countries_tags?: string[];
  categories_tags?: string[];
  image_url?: string;
  image_small_url?: string;
  image_thumb_url?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  ingredients_text?: string;
}

/** Map an OFF country tag (`en:france`) to ISO 3166-1 alpha-2. Best-effort. */
function tagToIso2(tag: string): string | undefined {
  const code = tag.replace(/^en:/, '').trim().toLowerCase();
  const map: Record<string, string> = {
    austria: 'AT',
    belgium: 'BE',
    bulgaria: 'BG',
    croatia: 'HR',
    cyprus: 'CY',
    czechia: 'CZ',
    'czech-republic': 'CZ',
    denmark: 'DK',
    estonia: 'EE',
    finland: 'FI',
    france: 'FR',
    germany: 'DE',
    greece: 'GR',
    hungary: 'HU',
    ireland: 'IE',
    italy: 'IT',
    latvia: 'LV',
    lithuania: 'LT',
    luxembourg: 'LU',
    malta: 'MT',
    netherlands: 'NL',
    poland: 'PL',
    portugal: 'PT',
    romania: 'RO',
    slovakia: 'SK',
    slovenia: 'SI',
    spain: 'ES',
    sweden: 'SE',
    'united-kingdom': 'GB',
    switzerland: 'CH',
    norway: 'NO',
    iceland: 'IS',
  };
  return map[code];
}

function adapt(p: OffApiProduct): OpenFoodFactsCandidate {
  const origin =
    p.origins_tags?.map((t) => tagToIso2(t)).find((c): c is string => !!c) ??
    p.countries_tags?.map((t) => tagToIso2(t)).find((c): c is string => !!c);
  const images = [
    p.image_front_url,
    p.image_url,
    p.image_front_small_url,
    p.image_small_url,
    p.image_thumb_url,
  ].filter((u): u is string => typeof u === 'string' && u.length > 0);
  return {
    barcode: p.code ?? null,
    name: p.product_name ?? p.generic_name ?? 'Untitled product',
    description: p.ingredients_text,
    originCountryIso2: origin,
    images: Array.from(new Set(images)).slice(0, 3),
    brandRaw: p.brands,
    categoriesRaw: p.categories_tags,
  };
}

/** Free-text search; returns up to `limit` candidates. */
export async function searchOpenFoodFacts(
  query: string,
  opts: SearchOptions = {},
): Promise<OpenFoodFactsCandidate[]> {
  const limit = opts.limit ?? 8;
  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set('search_terms', query);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', String(Math.min(limit * 2, 40)));
  url.searchParams.set(
    'fields',
    [
      'code',
      'product_name',
      'generic_name',
      'brands',
      'origins_tags',
      'countries_tags',
      'categories_tags',
      'image_url',
      'image_small_url',
      'image_thumb_url',
      'image_front_url',
      'image_front_small_url',
      'ingredients_text',
    ].join(','),
  );

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: opts.signal,
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { products?: OffApiProduct[] };
  const all = (data.products ?? []).map(adapt);
  const filtered =
    opts.euOnly === false
      ? all
      : all.filter((c) => !c.originCountryIso2 || EU_ISO2.has(c.originCountryIso2));
  return filtered.slice(0, limit);
}

/** Look up a single product by barcode for the importer. */
export async function getOpenFoodFactsProduct(
  barcode: string,
  opts: { signal?: AbortSignal } = {},
): Promise<OpenFoodFactsCandidate | null> {
  const url = `${PRODUCT_ENDPOINT}/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: opts.signal,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { status?: number; product?: OffApiProduct };
  if (data.status !== 1 || !data.product) return null;
  return adapt(data.product);
}

/** Pull a paginated batch by category for the cron-driven importer. */
export async function listOpenFoodFactsByCategory(
  categoryTag: string,
  opts: { page?: number; pageSize?: number; euOnly?: boolean; signal?: AbortSignal } = {},
): Promise<OpenFoodFactsCandidate[]> {
  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('tagtype_0', 'categories');
  url.searchParams.set('tag_contains_0', 'contains');
  url.searchParams.set('tag_0', categoryTag);
  url.searchParams.set('page', String(opts.page ?? 1));
  url.searchParams.set('page_size', String(opts.pageSize ?? 100));
  url.searchParams.set(
    'fields',
    [
      'code',
      'product_name',
      'brands',
      'origins_tags',
      'countries_tags',
      'categories_tags',
      'image_url',
      'image_small_url',
      'image_thumb_url',
      'image_front_url',
      'image_front_small_url',
    ].join(','),
  );
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: opts.signal,
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { products?: OffApiProduct[] };
  const all = (data.products ?? []).map(adapt);
  return opts.euOnly === false
    ? all
    : all.filter((c) => !c.originCountryIso2 || EU_ISO2.has(c.originCountryIso2));
}

export const OPEN_FOOD_FACTS_ATTRIBUTION =
  'Product info via Open Food Facts contributors (CC-BY-SA 4.0)';
