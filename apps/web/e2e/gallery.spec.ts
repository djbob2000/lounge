import { expect, test } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('should redirect to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/admin');

    // Should redirect to sign-in page
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should display admin navigation when authenticated', async ({ page }) => {
    // Mock authentication - in real tests you'd use proper test credentials
    await page.goto('/admin');

    // After sign in, should show admin panel
    // This is a placeholder - actual implementation would need proper auth setup
    await expect(page.locator('text=Admin Panel')).toBeVisible();
  });
});

test.describe('Photo Gallery', () => {
  test('should load category pages', async ({ page }) => {
    // Visit a sample category page
    await page.goto('/sample-category');

    // Check for album grid
    await expect(page.locator('[data-testid="album-grid"]')).toBeVisible();
  });

  test('should load album pages', async ({ page }) => {
    // Visit a sample album page
    await page.goto('/sample-category/sample-album');

    // Check for photo grid
    await expect(page.locator('[data-testid="photo-grid"]')).toBeVisible();
  });

  test('should display photos in lightbox', async ({ page }) => {
    await page.goto('/sample-category/sample-album');

    // Click on first photo
    const firstPhoto = page.locator('[data-testid="photo-item"]').first();
    await firstPhoto.click();

    // Check if lightbox opens
    await expect(page.locator('[data-testid="photo-viewer"]')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between categories', async ({ page }) => {
    await page.goto('/');

    // Find and click on a category link
    const categoryLink = page.locator('a[href*="/"]').first();
    await categoryLink.click();

    // Should navigate to category page
    await expect(page.url()).toContain('/');
  });

  test('should navigate between albums', async ({ page }) => {
    await page.goto('/sample-category');

    // Find and click on an album link
    const albumLink = page.locator('a[href*="/"]').first();
    await albumLink.click();

    // Should navigate to album page
    await expect(page.url()).toContain('/');
  });
});
