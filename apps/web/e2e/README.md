# E2E Testing with Playwright

This directory contains end-to-end tests for the Lounge application using Playwright.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
pnpm test:e2e
```

### Run tests in UI mode (interactive)
```bash
pnpm test:e2e:ui
```

### Run tests in debug mode
```bash
pnpm test:e2e:debug
```

### View test report
```bash
pnpm test:e2e:report
```

## Test Structure

- `homepage.spec.ts` - Tests for the homepage and basic navigation
- `gallery.spec.ts` - Tests for photo gallery functionality
- `admin.spec.ts` - Tests for admin panel features
- `example-journey.spec.ts` - Complete user journey tests
- `test-helpers.ts` - Utility functions and helpers

## Test Categories

### 1. Homepage Tests (`homepage.spec.ts`)
- Page loading and basic structure
- Navigation menu visibility
- Responsive design across devices

### 2. Gallery Tests (`gallery.spec.ts`)
- Category page loading
- Album page functionality
- Photo viewer and lightbox
- Navigation between categories and albums

### 3. Admin Tests (`admin.spec.ts`)
- Authentication and access control
- Photo upload functionality
- Album management (create, edit, delete)
- Category management (create, edit, delete)
- Form validation and error handling

### 4. User Journey Tests (`example-journey.spec.ts`)
- Complete browsing experience
- Responsive design verification
- Image loading performance
- Navigation flow testing
- Error handling scenarios

## Test Utilities

### TestHelpers Class
- `gotoHome()` - Navigate to homepage and wait for load
- `gotoAdmin()` - Navigate to admin panel with auth handling
- `waitForImages()` - Wait for all images to load
- `isElementVisible()` - Check element visibility with timeout
- `takeScreenshot()` - Capture screenshots for debugging
- `throttleNetwork()` - Simulate slow network conditions
- `clearStorage()` - Clear browser storage

### TestData Generator
- `generateCategory()` - Create test category data
- `generateAlbum()` - Create test album data
- `generatePhoto()` - Create test photo data

### Selectors
Common CSS selectors used across tests for consistency.

## Best Practices

1. **Use data-testid attributes** - Add `data-testid` attributes to elements for reliable selection
2. **Wait for elements** - Always wait for elements before interacting with them
3. **Use helpers** - Utilize TestHelpers for common operations
4. **Take screenshots** - Capture screenshots when tests fail for debugging
5. **Test responsive design** - Verify functionality across different viewport sizes
6. **Mock authentication** - Use proper test credentials or mock auth for admin tests

## Adding New Tests

1. Create a new `.spec.ts` file in the `e2e/` directory
2. Import necessary modules from `@playwright/test`
3. Use the TestHelpers and Selectors for consistency
4. Follow the existing test structure and naming conventions
5. Add appropriate test categories and descriptions

## CI/CD Integration

Tests run automatically on:
- Push to main/master branch
- Pull requests to main/master branch

The GitHub Actions workflow will:
1. Install dependencies
2. Setup test environment
3. Run database migrations
4. Build applications
5. Execute E2E tests
6. Upload test reports and screenshots

## Troubleshooting

### Common Issues

1. **Tests failing due to slow loading**
   - Increase timeouts in `playwright.config.ts`
   - Use `waitForLoadState('networkidle')`

2. **Authentication issues**
   - Ensure proper test credentials are set up
   - Check Clerk integration in test environment

3. **Database connection issues**
   - Verify database is running and accessible
   - Check connection strings in test environment

4. **Browser compatibility issues**
   - Run tests on specific browsers only
   - Check browser versions in CI environment

### Debug Tips

1. Use `test:e2e:debug` mode for step-by-step debugging
2. Check screenshots in `test-results/` directory
3. Use `test.slow()` for tests that need more time
4. Add `console.log()` statements in test code
5. Use Playwright's trace viewer for detailed debugging