import type { Page } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to the home page and wait for it to load
   */
  async gotoHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to admin panel and handle authentication
   */
  async gotoAdmin() {
    await this.page.goto('/admin');

    // Handle redirect to sign-in if not authenticated
    if (this.page.url().includes('sign-in')) {
      // In a real test, you'd sign in here
      // For now, we'll just note that we need authentication
      console.log('Authentication required for admin panel');
    }
  }

  /**
   * Wait for all images to load on the page
   */
  async waitForImages() {
    await this.page.waitForFunction(() => {
      const images = Array.from(document.images);
      return images.every((img) => img.complete && img.naturalHeight !== 0);
    });
  }

  /**
   * Check if an element is visible and interactable
   */
  async isElementVisible(selector: string) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 5000 });
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get the current URL path
   */
  getCurrentPath() {
    return new URL(this.page.url()).pathname;
  }

  /**
   * Take a screenshot and save it to the test-results directory
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Mock a slow network connection
   */
  async simulateSlow3G() {
    // Note: throttle option is not available in route.continue()
    // Network throttling would need to be done at browser level
    await this.page.context().setOffline(false);
  }

  /**
   * Clear browser storage
   */
  async clearStorage() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}

/**
 * Test data generators
 */
export const TestData = {
  generateCategory() {
    return {
      title: `Test Category ${Date.now()}`,
      slug: `test-category-${Date.now()}`,
      description: 'Test category description',
      displayOrder: Math.floor(Math.random() * 100),
      showInMenu: true,
    };
  },

  generateAlbum() {
    return {
      title: `Test Album ${Date.now()}`,
      slug: `test-album-${Date.now()}`,
      description: 'Test album description',
      displayOrder: Math.floor(Math.random() * 100),
      categoryId: 'test-category-id',
    };
  },

  generatePhoto() {
    return {
      title: `Test Photo ${Date.now()}`,
      description: 'Test photo description',
      displayOrder: Math.floor(Math.random() * 100),
      isSliderImage: false,
      albumId: 'test-album-id',
    };
  },
};

/**
 * Common test selectors
 */
export const Selectors = {
  // Navigation
  NAVIGATION: 'nav',
  HOME_LINK: 'a[href="/"]',
  CATEGORY_LINK: 'a[href*="/"]',
  ALBUM_LINK: 'a[href*="/"]',

  // Gallery
  ALBUM_GRID: '[data-testid="album-grid"]',
  PHOTO_GRID: '[data-testid="photo-grid"]',
  PHOTO_ITEM: '[data-testid="photo-item"]',
  PHOTO_VIEWER: '[data-testid="photo-viewer"]',

  // Admin
  ADMIN_NAV: '[data-testid="admin-nav"]',
  ADMIN_FORM: 'form',
  SUBMIT_BUTTON: 'button[type="submit"]',
  DELETE_BUTTON: 'button:text("Delete")',
  CONFIRM_BUTTON: 'button:text("Confirm")',
  CANCEL_BUTTON: 'button:text("Cancel")',

  // Forms
  TITLE_INPUT: 'input[name="title"]',
  SLUG_INPUT: 'input[name="slug"]',
  DESCRIPTION_TEXTAREA: 'textarea[name="description"]',
  FILE_INPUT: 'input[type="file"]',
  SELECT_INPUT: 'select',
  CHECKBOX_INPUT: 'input[type="checkbox"]',

  // Messages
  SUCCESS_MESSAGE: '[data-testid="success-message"]',
  ERROR_MESSAGE: '[data-testid="error-message"]',
  LOADING_SPINNER: '[data-testid="loading-spinner"]',
};
