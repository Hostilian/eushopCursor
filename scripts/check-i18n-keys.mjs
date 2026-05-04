/**
 * Ensures every locale JSON has the same key paths as `en.json`.
 * Run from repo root: `pnpm i18n:check`
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dir = join(root, 'packages', 'i18n', 'src', 'messages');

function flattenKeys(obj, prefix = '') {
  const keys = [];
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const k of Object.keys(obj).sort()) {
      const p = prefix ? `${prefix}.${k}` : k;
      keys.push(p);
      keys.push(...flattenKeys(obj[k], p));
    }
  }
  return keys;
}

function leafPaths(obj, prefix = '') {
  const paths = [];
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const k of Object.keys(obj).sort()) {
      const p = prefix ? `${prefix}.${k}` : k;
      const v = obj[k];
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        paths.push(...leafPaths(v, p));
      } else {
        paths.push(p);
      }
    }
  }
  return paths;
}

const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const enPath = join(dir, 'en.json');
if (!files.includes('en.json')) {
  console.error('Missing en.json');
  process.exit(1);
}
const en = JSON.parse(readFileSync(enPath, 'utf8'));
const enLeaves = new Set(leafPaths(en));

let failed = false;
for (const f of files) {
  if (f === 'en.json') continue;
  const loc = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  const leaves = new Set(leafPaths(loc));
  const missing = [...enLeaves].filter((k) => !leaves.has(k));
  const extra = [...leaves].filter((k) => !enLeaves.has(k));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`\nLocale ${f}:`);
    if (missing.length) console.error(`  Missing ${missing.length} keys (vs en), e.g.:`, missing.slice(0, 8).join(', '));
    if (extra.length) console.error(`  Extra ${extra.length} keys (vs en), e.g.:`, extra.slice(0, 8).join(', '));
  }
}

if (failed) {
  console.error('\ni18n:check failed — align message keys with en.json');
  process.exit(1);
}
console.log('i18n:check OK —', files.length, 'locales match en.json leaf keys');
