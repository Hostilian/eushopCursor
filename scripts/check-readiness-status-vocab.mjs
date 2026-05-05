/**
 * Enforces canonical readiness status vocabulary in status-like contexts.
 * Canonical: done, in_progress, ready, blocked
 *
 * Run from repo root: pnpm readiness:status:check
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const readinessDir = join(root, 'docs', 'readiness');
const canonical = new Set(['done', 'in_progress', 'ready', 'blocked']);
const legacy = new Set(['open', 'pending', 'scheduled', 'complete', 'completed', 'integrated']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

function normalize(s) {
  return s.trim().toLowerCase();
}

function checkBacktickedLegacy(line, lineNo, relPath, violations) {
  const matches = [...line.matchAll(/`([a-z_]+)`/g)];
  for (const m of matches) {
    const token = normalize(m[1]);
    if (legacy.has(token)) {
      violations.push(`${relPath}:${lineNo} backticked legacy status \`${token}\``);
    }
  }
}

function checkStatusTableCell(line, lineNo, relPath, inStatusTable, violations) {
  if (!inStatusTable) return;
  if (!line.includes('|')) return;
  if (/^\|\s*-+/.test(line)) return;
  const cells = line.split('|').map((c) => normalize(c));
  for (const c of cells) {
    if (legacy.has(c)) {
      violations.push(`${relPath}:${lineNo} legacy status table value "${c}"`);
    }
    // Warn only when explicit status-like single token is not canonical.
    if (/^[a-z_]+$/.test(c) && c.length > 0 && !canonical.has(c) && !legacy.has(c)) {
      // allow common non-status one-word table values
      if (!new Set(['status', 'owner', 'week', 'risk', 'gate', 'notes']).has(c)) {
        // no-op by default; keep strict only for legacy tokens
      }
    }
  }
}

const files = walk(readinessDir);
const violations = [];

for (const file of files) {
  const relPath = file.replace(`${root}\\`, '').replaceAll('\\', '/');
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);

  let inStatusTable = false;
  for (let i = 0; i < lines.length; i += 1) {
    const lineNo = i + 1;
    const line = lines[i];
    const lower = normalize(line);

    // Enter status table when header contains a Status column.
    if (line.includes('|') && /\|\s*status\s*\|/i.test(line)) {
      inStatusTable = true;
    } else if (!line.includes('|')) {
      inStatusTable = false;
    }

    checkBacktickedLegacy(line, lineNo, relPath, violations);
    checkStatusTableCell(line, lineNo, relPath, inStatusTable, violations);

    // Catch "Status: legacy" style lines.
    const m = lower.match(/^[-*]?\s*status\s*:\s*`?([a-z_]+)`?/);
    if (m) {
      const token = m[1];
      if (legacy.has(token)) {
        violations.push(`${relPath}:${lineNo} legacy status label "${token}"`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error('readiness:status:check failed. Legacy statuses found:\n');
  for (const v of violations) console.error(`- ${v}`);
  process.exit(1);
}

console.log(`readiness:status:check OK — scanned ${files.length} markdown files`);
