#!/usr/bin/env node
/**
 * Asset existence + dimension check.
 *
 * Validates that every asset referenced by `app.json` exists in
 * `apps/mobile/assets/` and matches the expected pixel dimensions.
 * Run as part of `pnpm --filter @eushop/mobile preflight`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'assets');

const REQUIRED = [
  { file: 'icon.png', minW: 1024, minH: 1024 },
  { file: 'adaptive-icon.png', minW: 1024, minH: 1024 },
  { file: 'adaptive-monochrome.png', minW: 1024, minH: 1024 },
  { file: 'splash.png', minW: 1242, minH: 2436 },
  { file: 'notification-icon.png', minW: 96, minH: 96 },
  { file: 'feature-graphic.png', minW: 1024, minH: 500 },
];

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readPngDimensions(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 24) throw new Error(`${file}: too small to be a PNG`);
  if (!PNG_SIGNATURE.equals(buf.subarray(0, 8))) {
    throw new Error(`${file}: not a PNG (bad signature)`);
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

const errors = [];
for (const t of REQUIRED) {
  const file = path.join(assetsDir, t.file);
  if (!fs.existsSync(file)) {
    errors.push(`missing: ${t.file}`);
    continue;
  }
  try {
    const { width, height } = readPngDimensions(file);
    if (width < t.minW || height < t.minH) {
      errors.push(
        `${t.file}: ${width}×${height} smaller than required ${t.minW}×${t.minH}; rerun pnpm assets:build`,
      );
    }
  } catch (err) {
    errors.push(`${t.file}: ${err instanceof Error ? err.message : err}`);
  }
}

if (errors.length) {
  console.error('[assets:check] failed:');
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}

console.info(`[assets:check] ok (${REQUIRED.length} files)`);
