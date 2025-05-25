
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('AdminAccessTest_2025-05-25', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:3000');

    // Take screenshot
    await page.screenshot({ path: 'homepage.png' });

    // Navigate to URL
    await page.goto('http://localhost:3000/admin');

    // Take screenshot
    await page.screenshot({ path: 'admin_page_redirect.png' });

    // Navigate to URL
    await page.goto('http://localhost:3000/sign-in');

    // Take screenshot
    await page.screenshot({ path: 'sign_in_page.png' });

    // Fill input field
    await page.fill('input[name="identifier"]', 'djbob2000@gmail.com');

    // Navigate to URL
    await page.goto('http://localhost:3000/admin/categories');

    // Take screenshot
    await page.screenshot({ path: 'admin_categories_page.png' });

    // Navigate to URL
    await page.goto('http://localhost:3000/sign-in');

    // Take screenshot
    await page.screenshot({ path: 'sign_in_page_2.png' });

    // Navigate to URL
    await page.goto('http://localhost:3000/api/debug-user');
});