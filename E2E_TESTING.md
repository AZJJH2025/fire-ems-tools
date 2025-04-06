# End-to-End Testing for Fire-EMS Tools

This document describes how to use the end-to-end testing framework for Fire-EMS Tools.

## Overview

The Fire-EMS Tools end-to-end testing framework uses Playwright to simulate real user interactions with the application in a browser. This allows us to test the application from a user's perspective, ensuring that all components work together correctly.

## Requirements

- Node.js (v14 or higher)
- npm
- Docker and Docker Compose (optional, for containerized testing)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/AZJJH2025/fire-ems-tools.git
   cd fire-ems-tools
   ```

2. Install dependencies:
   ```bash
   cd e2e
   npm install
   ```

3. Install browsers:
   ```bash
   npx playwright install
   ```

4. Run tests:
   ```bash
   ./run_e2e_tests.sh
   ```

## Test Structure

The end-to-end tests are organized as follows:

- `e2e/tests/`: Test files
- `e2e/fixtures/`: Test fixtures
- `e2e/utils/`: Utility functions
- `e2e/playwright.config.js`: Playwright configuration

## Running Tests

### Using the Script

The `run_e2e_tests.sh` script provides a convenient way to run the end-to-end tests:

```bash
# Run tests with Chromium (default)
./run_e2e_tests.sh

# Run tests with Firefox
./run_e2e_tests.sh --browser firefox

# Run tests with Safari (WebKit)
./run_e2e_tests.sh --browser webkit

# Run tests with browser visible
./run_e2e_tests.sh --headed

# Run tests in debug mode
./run_e2e_tests.sh --debug

# Run tests with Playwright UI
./run_e2e_tests.sh --ui
```

### Using Docker

If you have Docker and Docker Compose installed, the script will automatically use them to run the tests in a containerized environment:

```bash
./run_e2e_tests.sh
```

This will:
1. Build and start the Fire-EMS Tools application
2. Build and run the end-to-end tests
3. Stop the application when tests are complete

### Using npm Directly

You can also run the tests directly using npm:

```bash
cd e2e
npm test
```

For more options:

```bash
cd e2e
npx playwright test --help
```

## Test Categories

The end-to-end tests cover the following categories:

- **Authentication**: Tests for login, logout, and access control
- **Incident Logger**: Tests for creating, viewing, and searching incidents
- **Call Density**: Tests for viewing and filtering the call density heatmap

## Creating New Tests

To create a new test, follow these steps:

1. Create a new test file in `e2e/tests/`
2. Import the necessary fixtures and utilities
3. Create tests using the Playwright API

Example:

```javascript
const { test, expect } = require('../fixtures/auth-fixture');
const { navigateToFeature } = require('../utils/auth');

test.describe('Feature Name', () => {
  test('should do something', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'feature-name');
    
    // Perform actions and assertions
    await page.getByRole('button', { name: 'Click Me' }).click();
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## Test Results

Test results are saved in the `e2e/test-results` directory:

- HTML report: `e2e/test-results/html-report/`
- JSON report: `e2e/test-results/test-results.json`
- Screenshots: `e2e/test-results/screenshots/`
- Videos: `e2e/test-results/videos/`

To view the HTML report:

```bash
cd e2e
npx playwright show-report test-results/html-report
```

## Continuous Integration

The end-to-end tests are designed to run in a CI/CD environment. The GitHub Actions workflow includes a job to run the end-to-end tests:

```yaml
e2e-tests:
  runs-on: ubuntu-latest
  steps:
  - uses: actions/checkout@v3
  
  - name: Set up Docker
    uses: docker/setup-buildx-action@v2
  
  - name: Run E2E tests
    run: ./run_e2e_tests.sh
  
  - name: Upload test results
    uses: actions/upload-artifact@v3
    with:
      name: e2e-test-results
      path: e2e/test-results
    if: always()
```

## Best Practices

1. **Use page objects**: Create reusable page objects for common pages
2. **Use fixtures**: Create fixtures for common setup and teardown
3. **Make tests independent**: Each test should run independently
4. **Use descriptive names**: Test names should describe what they're testing
5. **Verify visually**: Use screenshots to verify visual elements
6. **Avoid fragile selectors**: Use role, label, and text selectors instead of CSS selectors
7. **Test real user flows**: Test complete user journeys
8. **Keep tests fast**: Avoid unnecessary waiting

## Troubleshooting

### Tests Not Finding Elements

If tests can't find elements, try:

1. Use the `--headed` option to see what's happening
2. Use the `--debug` option to pause tests
3. Check that selectors are correct
4. Add waits for dynamic content

### Tests Failing in CI but Not Locally

Common issues:

1. Timing issues: Add explicit waits
2. Environment differences: Use Docker locally
3. Screen size differences: Set consistent viewport size
4. Network issues: Mock external services

## Support

For issues with the end-to-end testing framework, please create an issue in the GitHub repository.