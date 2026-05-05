/**
 * Smoke checks for ProductPicker picture flow.
 *
 * Validates:
 * 1) Required i18n keys exist for productPicker.* in en.json
 * 2) Web + mobile pickers keep fallback-image and paginated Pics logic
 * 3) Catalog router still exposes browse with cursor pagination
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const mustExist = [
  'apps/web/src/components/catalog/product-picker.tsx',
  'apps/mobile/src/components/ProductPicker.tsx',
  'packages/api-router/src/routers/catalog.ts',
  'packages/i18n/src/messages/en.json',
];

const missingFiles = mustExist.filter((p) => !existsSync(join(root, p)));
if (missingFiles.length) {
  console.error('pictures:check missing files:\n' + missingFiles.map((p) => `- ${p}`).join('\n'));
  process.exit(1);
}

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

const en = JSON.parse(read('packages/i18n/src/messages/en.json'));
const requiredKeys = [
  'pics',
  'picsHint',
  'picsModalTitle',
  'picsModalBody',
  'picsEmpty',
  'picsClose',
  'picsLoadMore',
  'picsLoadMoreAria',
  'picsUseFor',
  'proposePhotosStrip',
  'proposeOpenPics',
];

const missingKeys = requiredKeys.filter((k) => !(k in (en.productPicker ?? {})));
if (missingKeys.length) {
  console.error(
    'pictures:check missing productPicker i18n keys:\n' +
      missingKeys.map((k) => `- productPicker.${k}`).join('\n'),
  );
  process.exit(1);
}

const web = read('apps/web/src/components/catalog/product-picker.tsx');
const mobile = read('apps/mobile/src/components/ProductPicker.tsx');
const router = read('packages/api-router/src/routers/catalog.ts');

const checks = [
  { ok: web.includes('fallbackImageForItem('), msg: 'web picker fallback image helper missing' },
  {
    ok: web.includes('catalog.browse.useInfiniteQuery'),
    msg: 'web picker gallery must use infinite pagination',
  },
  { ok: web.includes('fetchNextPage'), msg: 'web picker gallery missing page fetching' },
  {
    ok: web.includes('new Map<string, BrowseItem>'),
    msg: 'web picker must dedupe browseItems by id (regression guard for duplicate React keys)',
  },
  {
    ok: web.includes('MAX_AUTO_PAGES'),
    msg: 'web picker must cap auto-fetch pages (regression guard for runaway useInfiniteQuery)',
  },
  {
    ok: mobile.includes('catalog.browse.useInfiniteQuery'),
    msg: 'mobile picker gallery must use infinite pagination',
  },
  { ok: mobile.includes('fallbackImageForItem('), msg: 'mobile picker fallback image helper missing' },
  { ok: mobile.includes('fetchNextPage'), msg: 'mobile picker gallery missing page fetching' },
  {
    ok: mobile.includes('new Map<string, BrowseItem>'),
    msg: 'mobile picker must dedupe browseItems by id (regression guard for duplicate React keys)',
  },
  {
    ok: mobile.includes('MAX_AUTO_PAGES'),
    msg: 'mobile picker must cap auto-fetch pages (regression guard for runaway useInfiniteQuery)',
  },
  { ok: router.includes('browse: publicProcedure'), msg: 'catalog.browse procedure missing' },
  { ok: router.includes('nextCursor'), msg: 'catalog.browse nextCursor missing' },
  {
    ok: router.includes('input.cursor') && router.includes('static|'),
    msg: 'catalog.browse fallback must honor input.cursor and emit a static| sentinel (regression guard for infinite useInfiniteQuery loop)',
  },
];

const failed = checks.filter((c) => !c.ok);
if (failed.length) {
  console.error('pictures:check failed:\n' + failed.map((c) => `- ${c.msg}`).join('\n'));
  process.exit(1);
}

console.log('pictures:check OK');
