/**
 * Smoke-check nonce wiring for JSON-LD scripts under strict CSP.
 *
 * This is intentionally static (source-level) rather than booting a Next
 * server in CI. It guards the exact regression that broke production rich
 * results: JSON-LD scripts missing `nonce={nonce}` while middleware enforces
 * `script-src 'nonce-...'`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const itemPage = 'apps/web/src/app/(product)/items/[slug]/page.tsx';
const countryPage = 'apps/web/src/app/(product)/countries/[iso2]/page.tsx';
const middleware = 'apps/web/src/middleware.ts';

const mustExist = [itemPage, countryPage, middleware];
const missing = mustExist.filter((p) => !existsSync(join(root, p)));
if (missing.length) {
  console.error('csp-jsonld: missing files:\n' + missing.map((p) => `- ${p}`).join('\n'));
  process.exit(1);
}

const itemSrc = readFileSync(join(root, itemPage), 'utf8');
const countrySrc = readFileSync(join(root, countryPage), 'utf8');
const mwSrc = readFileSync(join(root, middleware), 'utf8');

const checks = [
  {
    ok: mwSrc.includes("script-src 'self' 'nonce-"),
    msg: 'middleware must emit CSP script-src nonce directive',
  },
  { ok: mwSrc.includes("reqHeaders.set('x-nonce', nonce)"), msg: 'middleware must inject x-nonce' },
  {
    ok: itemSrc.includes("headers()).get('x-nonce')") && itemSrc.includes('nonce={nonce}'),
    msg: 'items/[slug] JSON-LD script must read + apply nonce',
  },
  {
    ok: countrySrc.includes("headers()).get('x-nonce')") && countrySrc.includes('nonce={nonce}'),
    msg: 'countries/[iso2] JSON-LD script must read + apply nonce',
  },
  {
    ok: itemSrc.includes('type="application/ld+json"'),
    msg: 'items/[slug] must keep JSON-LD script block',
  },
  {
    ok: countrySrc.includes('type="application/ld+json"'),
    msg: 'countries/[iso2] must keep JSON-LD script block',
  },
];

const failed = checks.filter((c) => !c.ok);
if (failed.length) {
  console.error('csp-jsonld: failed:\n' + failed.map((c) => `- ${c.msg}`).join('\n'));
  process.exit(1);
}

console.log('csp-jsonld: OK');
