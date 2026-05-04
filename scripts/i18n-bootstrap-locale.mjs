/**
 * Copy en.json → <locale>.json for each locale code (overwrites target).
 * Usage from repo root:
 *   node scripts/i18n-bootstrap-locale.mjs nl sv da
 * Or set LOCALES env: LOCALES="nl,sv,da" node scripts/i18n-bootstrap-locale.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '..', 'packages', 'i18n', 'src', 'messages');
const enPath = join(dir, 'en.json');
const en = readFileSync(enPath, 'utf8');

const fromEnv = process.env.LOCALES?.split(/[\s,]+/).filter(Boolean) ?? [];
const fromArgv = process.argv.slice(2);
const locales = (fromEnv.length ? fromEnv : fromArgv).filter((l) => l && l !== 'en');

if (!locales.length) {
  console.error('Usage: node scripts/i18n-bootstrap-locale.mjs nl sv …\n   or LOCALES="nl,sv" node …');
  process.exit(1);
}

for (const loc of locales) {
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(loc)) {
    console.warn('skip invalid code:', loc);
    continue;
  }
  writeFileSync(join(dir, `${loc}.json`), `${en.trim()}\n`, 'utf8');
  console.log('wrote', `${loc}.json`);
}
