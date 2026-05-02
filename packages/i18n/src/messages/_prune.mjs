// Prune i18n keys flagged as unused by the audit. Run once and delete the
// script — it's checked in only for reproducibility while the audit is fresh.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NAMESPACES_TO_DROP = ['country', 'listing', 'request', 'empty', 'lang'];
const NAV_KEYS_TO_DROP = ['listings', 'messages', 'profile', 'press'];
const CTA_KEYS_TO_DROP = ['viewAll', 'message'];

for (const file of ['en.json', 'de.json', 'fr.json', 'es.json', 'it.json', 'pl.json']) {
  const p = path.join(__dirname, file);
  const data = JSON.parse(await fs.readFile(p, 'utf8'));
  for (const ns of NAMESPACES_TO_DROP) delete data[ns];
  if (data.nav) {
    for (const k of NAV_KEYS_TO_DROP) delete data.nav[k];
  }
  if (data.cta) {
    for (const k of CTA_KEYS_TO_DROP) delete data.cta[k];
  }
  await fs.writeFile(p, JSON.stringify(data, null, 2) + '\n');
  console.log(`Pruned ${file}`);
}
