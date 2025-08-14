import { test, expect } from '@playwright/test';

test('Landing loads and hero present', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Change the way you create & get paid.')).toBeVisible();
});

test('Pricing route navigates', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Pricing' }).click();
  await expect(page.getByRole('heading', { name: 'Pricing' })).toBeVisible();
});

test('Dashboard renders stats', async ({ page }) => {
  await page.goto('/app');
  await expect(page.getByText('Total Earnings')).toBeVisible();
});


