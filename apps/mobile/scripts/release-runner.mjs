#!/usr/bin/env node
/**
 * Mobile publish runner (deferred execution helper).
 *
 * Purpose:
 * - run the remaining release commands in a deterministic order
 * - stop early with a clear reminder when EAS auth is missing
 * - let a human resume quickly later without remembering the sequence
 *
 * Usage:
 *   pnpm --filter @eushop/mobile release:runner
 *
 * Notes:
 * - This script does NOT call `eas login` interactively.
 * - It expects either an existing session (`eas whoami`) or EXPO_TOKEN.
 */
import { spawnSync } from 'node:child_process';

const STEPS = [
  ['npx', ['eas-cli', 'whoami'], 'Check EAS auth'],
  ['pnpm', ['--filter', '@eushop/mobile', 'preflight'], 'Run mobile preflight'],
  ['npx', ['eas-cli', 'build', '--profile', 'preview', '--platform', 'all'], 'Build preview (all)'],
  [
    'npx',
    ['eas-cli', 'submit', '--profile', 'internal', '--platform', 'android'],
    'Submit Android internal',
  ],
  ['npx', ['eas-cli', 'submit', '--profile', 'preview', '--platform', 'ios'], 'Submit iOS TestFlight'],
  [
    'npx',
    ['eas-cli', 'build', '--profile', 'production', '--platform', 'all'],
    'Build production (all)',
  ],
  [
    'npx',
    ['eas-cli', 'submit', '--profile', 'production', '--platform', 'android'],
    'Submit Android production',
  ],
  ['npx', ['eas-cli', 'submit', '--profile', 'production', '--platform', 'ios'], 'Submit iOS production'],
];

function run(cmd, args, label) {
  console.info(`\n=== ${label} ===`);
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  if (res.status !== 0) {
    throw new Error(`${label} failed (exit ${res.status ?? 'unknown'})`);
  }
}

function remindLogin() {
  console.error('\nEAS auth is missing. Reminder for later:');
  console.error('1) npx eas-cli login');
  console.error('2) pnpm --filter @eushop/mobile release:runner');
  console.error('\nIf you cannot do interactive login, set EXPO_TOKEN then rerun.');
}

try {
  // auth guard
  const whoami = spawnSync('npx', ['eas-cli', 'whoami'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: process.env,
  });
  if (whoami.status !== 0) {
    remindLogin();
    process.exit(2);
  }
  console.info(`Authenticated as: ${whoami.stdout.trim()}`);

  // skip the initial whoami step since guard already passed
  for (const [cmd, args, label] of STEPS.slice(1)) {
    run(cmd, args, label);
  }
  console.info('\nMobile release runner completed.');
} catch (err) {
  console.error(`\nRelease runner stopped: ${err instanceof Error ? err.message : String(err)}`);
  console.error('Fix the issue, then rerun the same command to resume from the start.');
  process.exit(1);
}
