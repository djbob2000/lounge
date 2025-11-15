import { expect, test } from '@playwright/test';

test.describe('Admin Photo Upload', () => {
  test('should have upload form in admin panel', async ({ page }) => {
    // Mock authentication - in real tests you'd sign in first
    await page.goto('/admin/photos/new');

    // Check for upload form elements
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="photo"]')).toBeVisible(); // File input
    await expect(page.getByLabel('Album *')).toBeVisible(); // Album selection
    await expect(page.locator('textarea[name="description"]')).toBeVisible(); // Description
    await expect(page.locator('input[name="displayOrder"]')).toBeVisible(); // Display order
    await expect(page.getByLabel('Use as slider image')).toBeVisible(); // Slider checkbox
  });

  test('should validate file upload requirements', async ({ page }) => {
    await page.goto('/admin/photos/new');

    // Try to submit without selecting a file
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show validation error
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should show album selection dropdown', async ({ page }) => {
    await page.goto('/admin/photos/new');

    // Check if album dropdown exists and has options
    const albumSelect = page.getByLabel('Album *');
    await expect(albumSelect).toBeVisible();

    // Click to open dropdown
    await albumSelect.click();

    // Should have at least one option
    const options = page.locator('[role="option"]');
    await expect(options.first()).toBeVisible();
  });

  test('should complete photo upload workflow', async ({ page }) => {
    await page.goto('/admin/photos/new');

    // Select file
    await page.locator('input[name="photo"]').setInputFiles(['test-files/sample.jpg']);

    // Select album
    await page.getByLabel('Album *').click();
    await page.getByRole('option').first().click();

    // Fill description
    await page.locator('textarea[name="description"]').fill('Test photo description');

    // Set display order
    await page.locator('input[name="displayOrder"]').fill('1');

    // Check slider option
    await page.getByLabel('Use as slider image').click();

    // Submit form
    await page.locator('button[type="submit"]').first().click();

    // Should show success or redirect
    await expect(page.locator('text=success')).toBeVisible();
  });
});

test.describe('Admin Album Management', () => {
  test('should create new album', async ({ page }) => {
    await page.goto('/admin/albums/new');

    // Fill in album form
    await page.fill('input[name="name"]', 'Test Album'); // Name field
    await page.fill('textarea[name="description"]', 'Test Description');

    // Select category
    await page.getByLabel('Категорія *').click(); // Category dropdown
    await page.getByRole('option').first().click(); // Select first option

    // Fill slug
    await page.fill('input[name="slug"]', 'test-album');

    // Submit form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should redirect to albums list or show success message
    await expect(page.url()).toContain('/admin/albums');
  });

  test('should edit existing album', async ({ page }) => {
    await page.goto('/admin/albums');

    // Click on first album edit button
    const editButton = page.locator('a[href*="/edit"]').first();
    await editButton.click();

    // Should show edit form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible(); // Name field
    await expect(page.locator('input[name="slug"]')).toBeVisible(); // Slug field
    await expect(page.locator('textarea[name="description"]')).toBeVisible(); // Description
    await expect(page.getByLabel('Приховати альбом')).toBeVisible(); // Hidden checkbox
  });

  test('should toggle album visibility', async ({ page }) => {
    await page.goto('/admin/albums/new');

    // Fill required fields
    await page.fill('input[name="name"]', 'Test Album');
    await page.getByLabel('Категорія *').click();
    await page.getByRole('option').first().click();
    await page.fill('input[name="slug"]', 'test-album');

    // Toggle visibility
    await page.getByLabel('Приховати альбом').click();

    // Submit form
    await page.locator('button[type="submit"]').first().click();

    // Should redirect to albums list
    await expect(page.url()).toContain('/admin/albums');
  });
});

test.describe('Admin Category Management', () => {
  test('should create new category', async ({ page }) => {
    await page.goto('/admin/categories/new');

    // Fill in category form
    await page.fill('input[name="name"]', 'Test Category'); // Name field
    await page.fill('input[name="slug"]', 'test-category'); // Slug field

    // Toggle show in menu
    await page.locator('input[name="showInMenu"]').click();

    // Submit form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should redirect to categories list
    await expect(page.url()).toContain('/admin/categories');
  });

  test('should toggle category menu visibility', async ({ page }) => {
    await page.goto('/admin/categories/new');

    // Fill required fields
    await page.fill('input[name="name"]', 'Test Category');
    await page.fill('input[name="slug"]', 'test-category');

    // Check show in menu
    const showInMenuCheckbox = page.locator('input[name="showInMenu"]');
    await showInMenuCheckbox.click();

    // Verify checkbox state
    await expect(showInMenuCheckbox).toBeChecked();

    // Submit form
    await page.locator('button[type="submit"]').first().click();

    // Should redirect to categories list
    await expect(page.url()).toContain('/admin/categories');
  });
});
