/**
 * Deep-fill missing keys in each locale JSON from en.json (does not overwrite existing).
 * Run from repo root: node scripts/sync-i18n-missing-from-en.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '..', 'packages', 'i18n', 'src', 'messages');

function fillMissing(target, source) {
  if (source === null || source === undefined) return;
  if (typeof source !== 'object' || Array.isArray(source)) return;
  for (const k of Object.keys(source)) {
    if (!(k in target)) {
      target[k] = source[k];
      continue;
    }
    const sv = source[k];
    const tv = target[k];
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
      fillMissing(tv, sv);
    }
  }
}

const en = JSON.parse(readFileSync(join(dir, 'en.json'), 'utf8'));
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.json') || f === 'en.json') continue;
  const path = join(dir, f);
  const loc = JSON.parse(readFileSync(path, 'utf8'));
  fillMissing(loc, en);
  writeFileSync(path, `${JSON.stringify(loc, null, 2)}\n`, 'utf8');
  console.log('synced', f);
}
