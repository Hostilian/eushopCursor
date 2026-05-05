/**
 * Ensures docs/readiness/doctor-latest.md exists and is fresh enough.
 *
 * Freshness rule:
 * - default: generated on current UTC date
 * - configurable with --maxAgeDays=<n>
 *
 * Run from repo root: pnpm readiness:doctor:fresh
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const snapshotPath = join(root, 'docs', 'readiness', 'doctor-latest.md');

const arg = process.argv.find((a) => a.startsWith('--maxAgeDays='));
const maxAgeDays = arg ? Number.parseInt(arg.split('=')[1] ?? '0', 10) : 0;

if (Number.isNaN(maxAgeDays) || maxAgeDays < 0) {
  console.error('Invalid --maxAgeDays value');
  process.exit(1);
}

if (!existsSync(snapshotPath)) {
  console.error('readiness:doctor:fresh failed — missing docs/readiness/doctor-latest.md');
  process.exit(1);
}

const body = readFileSync(snapshotPath, 'utf8');
const match = body.match(/Generated:\s*([0-9T:\-+.Z]+)/);
if (!match) {
  console.error('readiness:doctor:fresh failed — missing "Generated:" timestamp');
  process.exit(1);
}

const generatedAt = new Date(match[1]);
if (Number.isNaN(generatedAt.getTime())) {
  console.error('readiness:doctor:fresh failed — invalid Generated timestamp');
  process.exit(1);
}

const now = new Date();
const ageMs = now.getTime() - generatedAt.getTime();
const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

if (ageMs > maxAgeMs) {
  console.error(
    `readiness:doctor:fresh failed — snapshot is too old (${Math.floor(ageMs / (1000 * 60 * 60))}h).`,
  );
  console.error('Run: pnpm readiness:doctor:write');
  process.exit(1);
}

console.log('readiness:doctor:fresh OK — snapshot freshness within policy');
