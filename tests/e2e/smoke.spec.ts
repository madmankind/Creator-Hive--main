import { test, expect } from '@playwright/test';

test('Landing loads and hero present', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Change the way you create & get paid.')).toBeVisible();
});

test('Creators grid shows cards', async ({ page }) => {
  await page.goto('/creators');
  await expect(page.getByText('Top Creators')).toBeVisible();
});

test('Billing page loads', async ({ page }) => {
  await page.goto('/billing');
  await expect(page.getByText('Stripe Connect')).toBeVisible();
});

