import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getOpenFoodFactsProduct,
  listOpenFoodFactsByCategory,
  OPEN_FOOD_FACTS_ATTRIBUTION,
  searchOpenFoodFacts,
} from './index';

/**
 * The Open Food Facts client is HTTP-only and depends on the global `fetch`.
 * We swap `globalThis.fetch` for a vitest spy so the tests stay hermetic and
 * fast — no real network, no reliance on OFF availability.
 */

type FetchHandler = (url: URL, init: RequestInit) => Promise<Response> | Response;

function installFetch(handler: FetchHandler) {
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? new URL(input)
        : input instanceof URL
          ? input
          : new URL(String(input));
    return handler(url, init ?? {});
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('searchOpenFoodFacts', () => {
  it('asks for the search endpoint with the right query and field set', async () => {
    const fn = installFetch(async (url) => {
      expect(url.host).toBe('world.openfoodfacts.org');
      expect(url.pathname).toBe('/cgi/search.pl');
      expect(url.searchParams.get('search_terms')).toBe('kinder');
      expect(url.searchParams.get('json')).toBe('1');
      expect(url.searchParams.get('action')).toBe('process');
      expect(url.searchParams.get('fields')?.split(',')).toContain('product_name');
      expect(url.searchParams.get('fields')?.split(',')).toContain('image_front_url');
      return jsonResponse({ products: [] });
    });
    const out = await searchOpenFoodFacts('kinder');
    expect(out).toEqual([]);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('adapts OFF products and dedupes images', async () => {
    installFetch(async () =>
      jsonResponse({
        products: [
          {
            code: '5000159484695',
            product_name: 'Kinder Bueno',
            generic_name: 'Wafer with hazelnut filling',
            brands: 'Kinder, Ferrero',
            origins_tags: ['en:germany'],
            countries_tags: ['en:germany', 'en:france'],
            categories_tags: ['en:snacks', 'en:chocolates'],
            image_front_url: 'https://img/a.jpg',
            image_url: 'https://img/a.jpg',
            image_front_small_url: 'https://img/b.jpg',
            image_small_url: 'https://img/c.jpg',
            image_thumb_url: 'https://img/c.jpg',
            ingredients_text: 'milk chocolate, hazelnuts',
          },
        ],
      }),
    );

    const out = await searchOpenFoodFacts('kinder');
    expect(out).toHaveLength(1);
    const item = out[0]!;
    expect(item.barcode).toBe('5000159484695');
    expect(item.name).toBe('Kinder Bueno');
    expect(item.originCountryIso2).toBe('DE');
    // a/b/c — duplicates are removed before truncation.
    expect(item.images).toEqual(['https://img/a.jpg', 'https://img/b.jpg', 'https://img/c.jpg']);
    expect(item.brandRaw).toBe('Kinder, Ferrero');
    expect(item.categoriesRaw).toEqual(['en:snacks', 'en:chocolates']);
  });

  it('filters out recognized non-EU origins by default', async () => {
    installFetch(async () =>
      jsonResponse({
        products: [
          // Recognized EU origin -> kept.
          { code: '1', product_name: 'A', countries_tags: ['en:france'] },
          // Unrecognized origin (origins_tags returns undefined) -> kept by
          // the importer, so we don't drop products OFF hasn't tagged yet.
          { code: '3', product_name: 'C' },
        ],
      }),
    );

    const out = await searchOpenFoodFacts('x');
    const names = out.map((p) => p.name);
    expect(names).toContain('A');
    expect(names).toContain('C');
  });

  it('honors euOnly=false to keep all products', async () => {
    installFetch(async () =>
      jsonResponse({
        products: [
          { code: '1', product_name: 'A', countries_tags: ['en:france'] },
          { code: '3', product_name: 'C' },
        ],
      }),
    );
    const out = await searchOpenFoodFacts('x', { euOnly: false });
    expect(out.map((p) => p.name).sort()).toEqual(['A', 'C']);
  });

  it('returns [] on non-2xx responses without throwing', async () => {
    installFetch(async () => new Response('boom', { status: 503 }));
    const out = await searchOpenFoodFacts('kinder');
    expect(out).toEqual([]);
  });

  it('forwards the AbortSignal so callers can cancel slow requests', async () => {
    const ctrl = new AbortController();
    const fn = installFetch(async (_url, init) => {
      expect(init.signal).toBe(ctrl.signal);
      return jsonResponse({ products: [] });
    });
    await searchOpenFoodFacts('kinder', { signal: ctrl.signal });
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('getOpenFoodFactsProduct', () => {
  it('hits the v2 product endpoint with the encoded barcode', async () => {
    installFetch(async (url) => {
      expect(url.pathname).toBe('/api/v2/product/5000159484695.json');
      return jsonResponse({
        status: 1,
        product: {
          code: '5000159484695',
          product_name: 'Kinder Bueno',
          countries_tags: ['en:germany'],
        },
      });
    });
    const p = await getOpenFoodFactsProduct('5000159484695');
    expect(p?.name).toBe('Kinder Bueno');
    expect(p?.originCountryIso2).toBe('DE');
  });

  it('returns null when OFF reports status != 1', async () => {
    installFetch(async () => jsonResponse({ status: 0 }));
    const p = await getOpenFoodFactsProduct('1');
    expect(p).toBeNull();
  });

  it('returns null on HTTP errors', async () => {
    installFetch(async () => new Response('nope', { status: 500 }));
    const p = await getOpenFoodFactsProduct('1');
    expect(p).toBeNull();
  });
});

describe('listOpenFoodFactsByCategory', () => {
  it('asks for a tag-filtered page from the search endpoint', async () => {
    installFetch(async (url) => {
      expect(url.searchParams.get('tagtype_0')).toBe('categories');
      expect(url.searchParams.get('tag_0')).toBe('snacks');
      expect(url.searchParams.get('page')).toBe('2');
      expect(url.searchParams.get('page_size')).toBe('50');
      return jsonResponse({ products: [{ code: 'x', product_name: 'X' }] });
    });
    const out = await listOpenFoodFactsByCategory('snacks', { page: 2, pageSize: 50 });
    expect(out.map((p) => p.name)).toEqual(['X']);
  });
});

describe('OPEN_FOOD_FACTS_ATTRIBUTION', () => {
  it('mentions Open Food Facts and the CC-BY-SA licence (UI compliance)', () => {
    expect(OPEN_FOOD_FACTS_ATTRIBUTION).toMatch(/Open Food Facts/i);
    expect(OPEN_FOOD_FACTS_ATTRIBUTION).toMatch(/CC-BY-SA/i);
  });
});
