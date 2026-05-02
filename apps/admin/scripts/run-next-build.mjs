/**
 * `next build` runs with NODE_ENV=production and loads Better Auth, which requires
 * BETTER_AUTH_SECRET (32+ chars, not the dev fallback). Local `pnpm verify` often has
 * no env file — inject a throwaway build-only value when unset so static analysis can finish.
 * Real deployments must set BETTER_AUTH_SECRET in the runtime environment.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const adminRoot = join(here, '..');
const repoRoot = join(adminRoot, '../..');
const nextBin = join(repoRoot, 'node_modules/next/dist/bin/next');

if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET =
    'local-build-placeholder-not-for-production-use-32minxxxxxxxx';
}

const result = spawnSync(process.execPath, [nextBin, 'build'], {
  cwd: adminRoot,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
