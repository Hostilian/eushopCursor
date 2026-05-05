#!/usr/bin/env node
/**
 * Seed translation-needed copies of the EN fastlane metadata.
 *
 * Idempotent — only writes if the target file is missing OR already
 * contains the `[needs translation]` marker. Won't overwrite a polished
 * translation once a human has saved it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'fastlane', 'metadata');

const LOCALES = [
  { apple: 'de-DE', play: 'de-DE', label: 'Deutsch' },
  { apple: 'fr-FR', play: 'fr-FR', label: 'Français' },
  { apple: 'pl-PL', play: 'pl-PL', label: 'Polski' },
  { apple: 'es-ES', play: 'es-ES', label: 'Español' },
  { apple: 'it-IT', play: 'it-IT', label: 'Italiano' },
];

const APPLE_FILES = [
  'name.txt',
  'subtitle.txt',
  'keywords.txt',
  'promotional_text.txt',
  'description.txt',
  'release_notes.txt',
  'support_url.txt',
  'marketing_url.txt',
  'privacy_url.txt',
];

const PLAY_FILES = ['title.txt', 'short_description.txt', 'full_description.txt', 'video.txt'];

const URL_FILES = new Set(['support_url.txt', 'marketing_url.txt', 'privacy_url.txt', 'video.txt']);

function readEn(scope, file) {
  const dir = scope === 'apple' ? path.join(root, 'en-US') : path.join(root, 'android', 'en-US');
  const p = path.join(dir, file);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function shouldOverwrite(target) {
  if (!fs.existsSync(target)) return true;
  const cur = fs.readFileSync(target, 'utf8');
  if (!cur.trim()) return true;
  return cur.includes('[needs translation');
}

function writeStub(target, source, locale, label) {
  const fileName = path.basename(target);
  if (URL_FILES.has(fileName)) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, source, 'utf8');
    return;
  }
  const stub = `[needs translation: ${label} (${locale})]\n\n# Source (en-US):\n${source
    .split('\n')
    .map((l) => `# ${l}`)
    .join('\n')}\n`;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, stub, 'utf8');
}

let written = 0;
for (const loc of LOCALES) {
  for (const f of APPLE_FILES) {
    const target = path.join(root, loc.apple, f);
    if (!shouldOverwrite(target)) continue;
    writeStub(target, readEn('apple', f), loc.apple, loc.label);
    written++;
  }
  for (const f of PLAY_FILES) {
    const target = path.join(root, 'android', loc.play, f);
    if (!shouldOverwrite(target)) continue;
    writeStub(target, readEn('play', f), loc.play, loc.label);
    written++;
  }
  // Per-locale Play screenshots dir
  const imgDir = path.join(root, 'android', loc.play, 'images');
  fs.mkdirSync(imgDir, { recursive: true });
  const keep = path.join(imgDir, '.gitkeep');
  if (!fs.existsSync(keep)) {
    fs.writeFileSync(keep, '# screenshots populated by `pnpm screenshots`\n');
    written++;
  }
}

console.info(`[fastlane] bootstrapped ${written} files across ${LOCALES.length} locales`);
