import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the eushop web app smoke suite.
 *
 * The full marketplace flow (post a trip → reserve → propose a product) is
 * gated behind `EUSHOP_E2E_AUTH=1` because it needs a seeded database and a
 * working session cookie. The unauth-only smoke specs are always on, and they
 * are what runs in CI to keep us honest about the public surface area.
 *
 * Run locally:
 *   pnpm --filter @eushop/web exec playwright install --with-deps
 *   pnpm --filter @eushop/web e2e
 */

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Boot the production build during CI so we exercise the same code path
  // shipped to users. Local devs can pre-start `pnpm dev` and skip this.
  webServer: process.env.E2E_NO_WEB_SERVER
    ? undefined
    : {
        command: process.env.E2E_WEB_SERVER_CMD ?? 'pnpm --filter @eushop/web start',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
