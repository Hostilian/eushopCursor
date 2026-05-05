/**
 * Readiness doctor:
 * - Summarizes artifact status counts from artifact-status-board.md
 * - Summarizes action status counts from owner-action-register.md
 * - Prints top in-progress actions
 *
 * Run from repo root: pnpm readiness:doctor
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const readinessDir = join(root, 'docs', 'readiness');

const artifactBoardPath = join(readinessDir, 'artifact-status-board.md');
const actionRegisterPath = join(readinessDir, 'owner-action-register.md');
const doctorSnapshotPath = join(readinessDir, 'doctor-latest.md');

const canonicalStatuses = ['done', 'in_progress', 'ready', 'blocked'];

function parseMarkdownTableRows(markdown) {
  const lines = markdown.split(/\r?\n/);
  return lines
    .filter((line) => line.trim().startsWith('|') && !line.includes('| ---'))
    .map((line) => line.split('|').map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.length > 0);
}

function countStatuses(rows, statusIndex) {
  const counts = Object.fromEntries(canonicalStatuses.map((s) => [s, 0]));
  for (const row of rows) {
    if (row.length <= statusIndex) continue;
    const status = row[statusIndex];
    if (counts[status] !== undefined) counts[status] += 1;
  }
  return counts;
}

function printCounts(title, counts) {
  console.log(`\n${title}`);
  for (const status of canonicalStatuses) {
    console.log(`- ${status}: ${counts[status]}`);
  }
}

function formatCounts(counts) {
  return canonicalStatuses.map((s) => `- ${s}: ${counts[s]}`).join('\n');
}

const artifactBoard = readFileSync(artifactBoardPath, 'utf8');
const actionRegister = readFileSync(actionRegisterPath, 'utf8');

const artifactRows = parseMarkdownTableRows(artifactBoard).filter((r) => r[0] !== 'Artifact');
const actionRows = parseMarkdownTableRows(actionRegister).filter((r) => r[0] !== 'Action ID');

// artifact-status-board: | Artifact | Owner role | Week target | Status |
const artifactCounts = countStatuses(artifactRows, 3);
// owner-action-register: | Action ID | ... | Status | Blockers |
const actionCounts = countStatuses(actionRows, 5);

printCounts('Artifact status summary', artifactCounts);
printCounts('Action status summary', actionCounts);

const inProgressActions = actionRows
  .filter((r) => r[5] === 'in_progress')
  .slice(0, 5)
  .map((r) => `- ${r[0]}: ${r[2]} (owner: ${r[3]}, due: ${r[4]})`);

if (inProgressActions.length > 0) {
  console.log('\nTop in_progress actions');
  for (const item of inProgressActions) console.log(item);
}

const blockedActions = actionRows.filter((r) => r[5] === 'blocked');
if (blockedActions.length > 0) {
  console.log('\nBlocked actions detected');
  for (const row of blockedActions) {
    console.log(`- ${row[0]}: ${row[2]} (blocker: ${row[6] || 'unspecified'})`);
  }
}

console.log('\nRecommended next command');
if (blockedActions.length > 0) {
  console.log('- pnpm readiness:triage');
} else {
  console.log('- pnpm readiness:verify');
}

const shouldWriteSnapshot = process.argv.includes('--write');
if (shouldWriteSnapshot) {
  const now = new Date().toISOString();
  const recommended = blockedActions.length > 0 ? 'pnpm readiness:triage' : 'pnpm readiness:verify';
  const snapshot = [
    '# Readiness Doctor Snapshot',
    '',
    `Generated: ${now}`,
    '',
    '## Artifact status summary',
    '',
    formatCounts(artifactCounts),
    '',
    '## Action status summary',
    '',
    formatCounts(actionCounts),
    '',
    '## Top in_progress actions',
    '',
    ...(inProgressActions.length > 0 ? inProgressActions : ['- none']),
    '',
    '## Blocked actions',
    '',
    ...(blockedActions.length > 0
      ? blockedActions.map((r) => `- ${r[0]}: ${r[2]} (blocker: ${r[6] || 'unspecified'})`)
      : ['- none']),
    '',
    '## Recommended next command',
    '',
    `- ${recommended}`,
    '',
  ].join('\n');
  writeFileSync(doctorSnapshotPath, snapshot, 'utf8');
  console.log(`\nWrote snapshot: ${doctorSnapshotPath.replaceAll('\\', '/')}`);
}

console.log('\nreadiness:doctor OK');
