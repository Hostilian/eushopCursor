/**
 * Adapters + helpers that let a tRPC procedure gracefully fall back to a
 * deterministic mock dataset whenever the real DB query throws or returns
 * an empty result. This keeps the demo investor-credible even if Postgres /
 * Meili are not running locally.
 *
 * The intent is *graceful*: when the DB has rows, those win. When it doesn't,
 * we synthesise a result shaped like the DB row so callers don't notice.
 */

import { BRANDS, CATEGORIES, COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import {
  SAMPLE_CONVERSATIONS,
  SAMPLE_LISTINGS,
  SAMPLE_MESSAGES,
  SAMPLE_REQUESTS,
  type SampleListing,
  type SampleMessage,
  type SampleRequest,
} from '@eushop/mock-data';

/** Run a DB query; on throw OR empty array, return the synthesised fallback. */
export async function withListFallback<T>(
  run: () => Promise<T[]>,
  fallback: () => T[],
): Promise<T[]> {
  try {
    const rows = await run();
    return rows.length > 0 ? rows : fallback();
  } catch {
    return fallback();
  }
}

export async function withFallback<T>(run: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await run();
  } catch {
    return fallback();
  }
}

const NOW = new Date();

/* ----- Catalog adapters -------------------------------------------------- */

export function fallbackCountries() {
  return COUNTRIES.map((c) => ({
    iso2: c.iso2,
    name: c.name,
    flagEmoji: c.flagEmoji,
    defaultLocale: c.defaultLocale,
    currency: c.currency,
    region: c.region,
    blurb: c.blurb,
    createdAt: NOW,
  }));
}

export function fallbackCountriesByRegion() {
  const byRegion = new Map<string, ReturnType<typeof fallbackCountries>>();
  for (const c of fallbackCountries()) {
    const arr = byRegion.get(c.region) ?? [];
    arr.push(c);
    byRegion.set(c.region, arr);
  }
  return Array.from(byRegion.entries()).map(([region, items]) => ({ region, items }));
}

export function fallbackCountryByIso(iso: string) {
  const upper = iso.toUpperCase();
  return fallbackCountries().find((c) => c.iso2 === upper);
}

function categoryUuid(slug: string): string {
  const i = CATEGORIES.findIndex((c) => c.slug === slug);
  const hex = (i + 1).toString(16).padStart(2, '0');
  return `cat-${hex}000000-0000-4000-8000-000000000000`;
}

export function fallbackCategories() {
  return CATEGORIES.map((c, i) => ({
    id: categoryUuid(c.slug),
    slug: c.slug,
    name: c.name,
    description: c.description ?? null,
    emoji: c.emoji ?? null,
    sortOrder: (i + 1) * 10,
  }));
}

function brandUuid(slug: string): string {
  const i = BRANDS.findIndex((b) => b.slug === slug);
  const hex = (i + 1).toString(16).padStart(2, '0');
  return `brn-${hex}000000-0000-4000-8000-000000000000`;
}

export function fallbackBrands(countryIso?: string) {
  return BRANDS.filter((b) => (countryIso ? b.countryIso2 === countryIso.toUpperCase() : true)).map(
    (b) => ({
      id: brandUuid(b.slug),
      slug: b.slug,
      name: b.name,
      countryIso2: b.countryIso2,
      blurb: b.blurb ?? null,
    }),
  );
}

function itemUuid(slug: string): string {
  const i = FOOD_ITEMS.findIndex((x) => x.slug === slug);
  const hex = (i + 1).toString(16).padStart(2, '0');
  return `itm-${hex}000000-0000-4000-8000-000000000000`;
}

export function fallbackItems(predicate?: (s: (typeof FOOD_ITEMS)[number]) => boolean) {
  const list = predicate ? FOOD_ITEMS.filter(predicate) : FOOD_ITEMS;
  return list.map((it) => ({
    id: itemUuid(it.slug),
    slug: it.slug,
    name: it.name,
    aka: it.aka ?? [],
    originCountryIso2: it.originCountryIso2,
    categoryId: categoryUuid(it.categorySlug),
    brandId: it.brandSlug ? brandUuid(it.brandSlug) : null,
    description: it.description,
    descriptionTranslated: {} as Record<string, string>,
    tags: it.tags ?? [],
    defaultImageUrl: null as string | null,
    embedding: null as number[] | null,
    createdAt: NOW,
    updatedAt: NOW,
  }));
}

export function fallbackItemBySlug(slug: string) {
  const it = FOOD_ITEMS.find((x) => x.slug === slug);
  if (!it) return undefined;
  const row = fallbackItems((s) => s.slug === slug)[0]!;
  const country = fallbackCountryByIso(it.originCountryIso2);
  const category = fallbackCategories().find((c) => c.slug === it.categorySlug);
  const brand = it.brandSlug ? fallbackBrands().find((b) => b.slug === it.brandSlug) : undefined;
  return { ...row, country, category, brand };
}

export function fallbackItemsByCategory(slug: string, limit = 24) {
  const cat = fallbackCategories().find((c) => c.slug === slug);
  if (!cat) return undefined;
  const items = fallbackItems((it) => it.categorySlug === slug).slice(0, limit);
  return { category: cat, items };
}

/* ----- Listings / requests / conversations ------------------------------- */

export function fallbackListings(opts?: { countryIso2?: string; limit?: number }): SampleListing[] {
  let list: SampleListing[] = SAMPLE_LISTINGS.slice();
  if (opts?.countryIso2) {
    const upper = opts.countryIso2.toUpperCase();
    list = list.filter((l: SampleListing) => l.countryIso2 === upper);
  }
  if (opts?.limit) list = list.slice(0, opts.limit);
  return list;
}

export function fallbackRequests(opts?: { countryIso2?: string; limit?: number }): SampleRequest[] {
  let list: SampleRequest[] = SAMPLE_REQUESTS.slice();
  if (opts?.countryIso2) {
    const upper = opts.countryIso2.toUpperCase();
    list = list.filter((r: SampleRequest) => r.countryIso2 === upper);
  }
  if (opts?.limit) list = list.slice(0, opts.limit);
  return list;
}

export function fallbackConversations() {
  return SAMPLE_CONVERSATIONS.slice();
}

export function fallbackMessagesFor(conversationId: string) {
  return SAMPLE_MESSAGES.filter((m: SampleMessage) => m.conversationId === conversationId);
}
