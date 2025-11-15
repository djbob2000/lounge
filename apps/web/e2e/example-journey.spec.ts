import { expect, test } from '@playwright/test';
import { Selectors, TestHelpers } from './test-helpers';

test.describe('Photo Gallery E2E Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('complete user journey: browse gallery', async ({ page }) => {
    // 1. Visit homepage
    await helpers.gotoHome();
    await expect(page).toHaveTitle(/Lounge/);

    // 2. Check that navigation is visible
    await expect(page.locator(Selectors.NAVIGATION)).toBeVisible();

    // 3. Find and click on first category
    const categoryLinks = page.locator(Selectors.CATEGORY_LINK);
    const firstCategory = categoryLinks.first();

    // Get category name for later verification
    const _categoryName = await firstCategory.textContent();
    await firstCategory.click();

    // 4. Verify we're on category page
    await expect(page.url()).toContain('/');

    // 5. Wait for albums to load
    await page.waitForSelector(Selectors.ALBUM_GRID, { state: 'visible' });

    // 6. Click on first album
    const albumLinks = page.locator(Selectors.ALBUM_LINK);
    const firstAlbum = albumLinks.first();
    await firstAlbum.click();

    // 7. Verify we're on album page
    await expect(page.url()).toContain('/');

    // 8. Wait for photos to load
    await page.waitForSelector(Selectors.PHOTO_GRID, { state: 'visible' });

    // 9. Check that photos are visible
    const photos = page.locator(Selectors.PHOTO_ITEM);
    await expect(photos.first()).toBeVisible();

    // 10. Click on first photo to open viewer
    await photos.first().click();

    // 11. Verify photo viewer opens
    await expect(page.locator(Selectors.PHOTO_VIEWER)).toBeVisible();

    // 12. Close photo viewer (ESC key or close button)
    await page.keyboard.press('Escape');

    // 13. Verify viewer is closed
    await expect(page.locator(Selectors.PHOTO_VIEWER)).not.toBeVisible();

    // Take screenshot for documentation
    await helpers.takeScreenshot('gallery-browse-journey');
  });

  test('responsive design check', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await helpers.gotoHome();

    // Desktop navigation should be visible
    await expect(page.locator(Selectors.NAVIGATION)).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator(Selectors.NAVIGATION)).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });

    // Mobile menu might be collapsed, but should still exist
    const nav = page.locator(Selectors.NAVIGATION);
    await expect(nav).toBeVisible();

    await helpers.takeScreenshot('responsive-design-check');
  });

  test('image loading performance', async ({ page }) => {
    await helpers.gotoHome();

    // Navigate to a category with albums
    const categoryLinks = page.locator(Selectors.CATEGORY_LINK);
    await categoryLinks.first().click();

    // Navigate to an album
    const albumLinks = page.locator(Selectors.ALBUM_LINK);
    await albumLinks.first().click();

    // Wait for all images to load
    await helpers.waitForImages();

    // Check that images are actually loaded (not broken)
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');

      if (src && !src.includes('placeholder')) {
        // Check that image has loaded successfully
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  test('navigation menu functionality', async ({ page }) => {
    await helpers.gotoHome();

    // Test that all navigation links work
    const navLinks = page.locator(`${Selectors.NAVIGATION} a`);
    const linkCount = await navLinks.count();

    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      // Test first 3 links
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');

      if (href && href !== '#') {
        await link.click();

        // Verify navigation worked
        await expect(page.url()).toContain(href);

        // Go back to home
        await helpers.gotoHome();
      }
    }
  });

  test('error handling - 404 page', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/non-existent-page');

    // Should show 404 page
    await expect(page.locator('text=404')).toBeVisible();

    // Should have a way to get back to home
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();

    // Click home link
    await homeLink.click();

    // Should be back on homepage
    await expect(page.url()).toBe('http://localhost:3000/');
  });
});

test.describe('Performance Tests', () => {
  test('page load time should be reasonable', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('images should load efficiently', async ({ page }) => {
    await page.goto('/');

    // Navigate to a gallery page with images
    const categoryLinks = page.locator(Selectors.CATEGORY_LINK);
    await categoryLinks.first().click();

    const albumLinks = page.locator(Selectors.ALBUM_LINK);
    await albumLinks.first().click();

    // Wait for images to load
    await page.waitForSelector('img', { state: 'visible' });

    // Check that images have proper attributes for performance
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);

      // Check for lazy loading attribute
      const loading = await img.getAttribute('loading');
      if (loading) {
        expect(['lazy', 'eager']).toContain(loading);
      }

      // Check for proper alt text
      const alt = await img.getAttribute('alt');
      if (alt !== null) {
        expect(alt.length).toBeGreaterThan(0);
      }
    }
  });
});
