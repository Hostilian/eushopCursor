import { expect, test } from '@playwright/test';

/**
 * The three flagship marketplace flows. These need a seeded database, a real
 * Better Auth session cookie, and (for `propose`) an existing food item slug.
 * They are gated behind `EUSHOP_E2E_AUTH=1` so CI can keep its smoke green
 * while developers can opt in once they have the fixtures wired locally.
 *
 * To run:
 *   pnpm db:up && pnpm db:migrate && pnpm db:seed
 *   EUSHOP_E2E_AUTH=1 \
 *     EUSHOP_E2E_BUYER_EMAIL=buyer@example.com \
 *     EUSHOP_E2E_SELLER_EMAIL=seller@example.com \
 *     pnpm --filter @eushop/web e2e -- --grep marketplace
 */

const AUTH_ENABLED = process.env.EUSHOP_E2E_AUTH === '1';

test.describe('marketplace flows (auth required)', () => {
  test.skip(!AUTH_ENABLED, 'Set EUSHOP_E2E_AUTH=1 with seeded fixtures to run.');

  test('seller can post a new trip', async ({ page }) => {
    await page.goto('/trips/new');
    // Form fields the post-a-trip page mounts. We only assert presence so the
    // suite remains stable as copy evolves.
    await expect(page.getByLabel(/origin city/i).first()).toBeVisible();
    await expect(page.getByLabel(/destination city/i).first()).toBeVisible();
    await page
      .getByLabel(/origin city/i)
      .first()
      .fill('Berlin');
    await page
      .getByLabel(/destination city/i)
      .first()
      .fill('Warsaw');
    await page.getByRole('button', { name: /post the trip/i }).click();
    await expect(page).toHaveURL(/\/trips\/[0-9a-f-]{36}/i);
  });

  test('buyer can reserve a slot on an open trip', async ({ page }) => {
    await page.goto('/trips');
    // Click into the first open trip — fragile by design, since the seeded
    // fixture is expected to expose a deterministic top result.
    const firstTrip = page.locator('a[href^="/trips/"]').first();
    await expect(firstTrip).toBeVisible();
    await firstTrip.click();
    await page.getByRole('textbox').first().fill('1kg of Wedel chocolate');
    await page
      .getByRole('button', { name: /reserve/i })
      .first()
      .click();
    await expect(page.getByText(/reservation/i).first()).toBeVisible();
  });

  test('user can propose a missing product to the catalog', async ({ page }) => {
    await page.goto('/discover');
    // The product picker exposes a "propose new" affordance; copy may vary.
    const proposeBtn = page.getByRole('button', { name: /propose|add a product|missing/i }).first();
    await proposeBtn.click();
    await page.getByLabel(/name/i).fill('Test Cookie');
    await page.getByRole('button', { name: /submit|propose/i }).click();
    await expect(page.getByText(/thanks|submitted|in review/i).first()).toBeVisible();
  });
});
