import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads successfully
    await expect(page).toHaveTitle(/Lounge/);

    // Check for main navigation elements
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    // Check for main content area
    await expect(page.locator('main')).toBeVisible();

    // Check for footer
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for navigation links
    const navLinks = page.locator('nav a');
    await expect(navLinks.first()).toBeVisible();

    // Check for home link
    const homeLink = page.locator('nav a[href="/"]');
    await expect(homeLink).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('header')).toBeVisible();

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('header')).toBeVisible();
  });
});
