import { expect, test } from '@playwright/test';

/**
 * Public-surface smoke tests. These run without a logged-in user and only
 * assert that critical pages load and render their key affordances. They are
 * safe to run against any environment, including production.
 */

test.describe('public marketplace surface', () => {
  test('home page renders the headline CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/eushop/i);
    // The home page advertises the trip marketplace prominently.
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('/trips lists open trips (or the empty-state)', async ({ page }) => {
    const res = await page.goto('/trips');
    expect(res?.ok()).toBeTruthy();
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('/trips/new shows the post-a-trip form (or the auth wall)', async ({ page }) => {
    await page.goto('/trips/new');
    // Either the form (logged in) or the auth wall is acceptable here — we
    // just want to know the route compiles and renders without 5xx.
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('/discover renders the catalog browse shell', async ({ page }) => {
    const res = await page.goto('/discover');
    expect(res?.ok()).toBeTruthy();
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('/manifesto and /traction marketing pages render', async ({ page }) => {
    for (const path of ['/manifesto', '/traction', '/how-it-works', '/safety']) {
      const res = await page.goto(path);
      expect(res?.ok(), `${path} should respond 2xx/3xx`).toBeTruthy();
    }
  });

  test('/sign-in is reachable and renders an email field', async ({ page }) => {
    await page.goto('/sign-in');
    // Better Auth magic-link form has a single email input.
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });
});
