import { expect, test } from '@playwright/test';

test.describe('Basic Setup Test', () => {
  test('should have working Playwright setup', async ({ page }) => {
    // This is a basic test to verify Playwright is working
    await page.goto('https://playwright.dev');
    await expect(page.locator('h1')).toContainText('Playwright');
  });
});
