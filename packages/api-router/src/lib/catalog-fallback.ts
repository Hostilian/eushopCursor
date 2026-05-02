/**
 * Curated catalog fallbacks when the database is empty (e.g. before migrate + seed).
 *
 * Data comes from `@eushop/catalog-data` only. User-generated rows (listings, requests,
 * trips, messages) never use synthetic fallbacks — callers get `[]` or errors.
 */

import { BRANDS, CATEGORIES, COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';

/** Run a DB query; on throw OR empty array, return the static fallback. */
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
    imageVariants: {} as {
      thumb?: string;
      small?: string;
      large?: string;
      source?: 'off' | 'r2' | 'user';
    },
    barcode: null as string | null,
    openFoodFactsId: null as string | null,
    verifiedAt: null as Date | null,
    submittedById: null as string | null,
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
