import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/We Connect/);
});

test('login navigation', async ({ page }) => {
  await page.goto('/');
  // Click on the Login link/button (assuming there is one with "Login" text)
  // await page.click('text=Login');
  // await expect(page).toHaveURL(/.*login/);
});
