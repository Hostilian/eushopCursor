#!/usr/bin/env node
/**
 * One-shot repair: replace mojibake single-byte non-ASCII characters in SVG
 * files with proper XML numeric entities. Idempotent — running twice does
 * nothing on the second pass.
 *
 * Targets the mobile asset SVGs. Re-run after editing any SVG that has
 * special characters (arrows, currency, middle dots, em dashes) on Windows
 * where some editors silently downgrade to CP1252.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'assets');

// Mapping of CP1252 single bytes to the entity we want.
// Using the lone byte hex (0x80–0xFF) keyed back to its intended Unicode.
const REPLACEMENTS = [
  ['\u00B7', '&#183;'],
  ['\u2192', '&#x2192;'],
  ['\u2194', '&#x2194;'],
  ['\u2022', '&#x2022;'],
  ['\u2014', '&#x2014;'],
  ['\u2013', '&#x2013;'],
  ['\u2018', '&#x2018;'],
  ['\u2019', '&#x2019;'],
  ['\u201C', '&#x201C;'],
  ['\u201D', '&#x201D;'],
  ['\u20AC', '&#x20AC;'],
  ['\u00A9', '&#xA9;'],
  ['\u00AE', '&#xAE;'],
];

// Latin-1 / mojibake bytes that the Write tool produced when encoding
// failed. The replacement character `\uFFFD` (U+FFFD) shows up as `?`
// on read — but we may also see raw 0xB7, 0xE2 0x86 0x92 etc. We treat
// the file as latin1 to recover the original byte values.
const BYTE_REPLACEMENTS = [
  [0xb7, '&#183;'], // middle dot
  [0xa9, '&#xA9;'],
];

function fixFile(file) {
  const original = fs.readFileSync(file);
  // Detect mojibake: if reading as utf-8 contains U+FFFD, treat raw bytes
  // as CP1252 and remap.
  const utf8 = original.toString('utf8');
  let next = utf8;

  // Phase A: replace already-correct unicode chars with entities (so future
  // edits never break sharp/libxml).
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }

  // Phase B: mojibake recovery. If U+FFFD survived, decode original bytes
  // as CP1252 and map known bytes to entities.
  if (next.includes('\uFFFD')) {
    const latin1 = original.toString('latin1');
    let recovered = latin1;
    for (const [byte, entity] of BYTE_REPLACEMENTS) {
      recovered = recovered.split(String.fromCharCode(byte)).join(entity);
    }
    // Strip any remaining high bytes; replace with XML numeric entity.
    recovered = recovered.replace(/[\u0080-\u00FF]/g, (m) => `&#${m.charCodeAt(0)};`);
    next = recovered;
  }

  if (next === utf8) return false;
  fs.writeFileSync(file, next, 'utf8');
  return true;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let touched = 0;
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      touched += walk(p);
    } else if (e.isFile() && p.endsWith('.svg')) {
      if (fixFile(p)) {
        touched++;
        console.info(`[fix-svg] repaired ${path.relative(root, p)}`);
      }
    }
  }
  return touched;
}

const total = walk(root);
console.info(`[fix-svg] done (${total} files repaired)`);
