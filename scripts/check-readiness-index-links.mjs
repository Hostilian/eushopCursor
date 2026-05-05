/**
 * Verifies that readiness index docs only reference existing markdown files.
 *
 * Run from repo root: pnpm readiness:index:check
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const readinessDir = join(root, 'docs', 'readiness');

const indexFiles = [
  join(readinessDir, 'README.md'),
  join(readinessDir, 'master-toc.md'),
];

const missing = [];

for (const indexPath of indexFiles) {
  const body = readFileSync(indexPath, 'utf8');
  const relIndex = indexPath.replace(`${root}\\`, '').replaceAll('\\', '/');
  const matches = [...body.matchAll(/`([^`]+\.md)`/g)];

  for (const m of matches) {
    const rel = m[1];
    const target = rel.startsWith('docs/readiness/')
      ? join(root, ...rel.split('/'))
      : join(readinessDir, rel);

    if (!existsSync(target)) {
      missing.push(`${relIndex} -> missing ${rel}`);
    }
  }
}

if (missing.length > 0) {
  console.error('readiness:index:check failed. Missing references:\n');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log('readiness:index:check OK — readiness index references resolve');
