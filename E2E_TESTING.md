# End-to-End Testing for Fire-EMS Tools

This document describes the end-to-end (E2E) testing setup for the Fire-EMS Tools application.

## Overview

E2E tests validate the application from a user's perspective, ensuring all components work together correctly. Our E2E tests use Playwright, a powerful browser automation framework.

## Setup

### Prerequisites

- Node.js 14 or later
- npm (comes with Node.js)
- Python 3.10 or later (for running the Fire-EMS Tools backend)

### Installation

1. Navigate to the `e2e` directory:
   ```
   cd e2e
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install Playwright browsers:
   ```
   npx playwright install
   ```

## Running Tests

You can run E2E tests using the provided script:

```
./run_e2e_tests.sh
```

### Options

- `--browser=BROWSER`: Browser to run tests in (chromium, firefox, webkit)
- `--headed`: Run tests in headed mode (show browser)
- `--debug`: Run tests in debug mode
- `--ui`: Run tests with Playwright UI
- `--base-url=URL`: Base URL for tests (default: http://localhost:8080)
- `--help`: Show help message

Examples:
```
./run_e2e_tests.sh --browser=firefox --headed
./run_e2e_tests.sh --debug
./run_e2e_tests.sh --ui
```

## Test Structure

E2E tests are located in the `e2e/tests` directory and are organized by feature:

- `auth.spec.js`: Authentication tests
- `incident-logger.spec.js`: Incident Logger feature tests
- `call-density.spec.js`: Call Density Heatmap tests

## Fixtures and Utilities

- `fixtures/auth-fixture.js`: Authentication fixtures for different user roles
- `utils/auth.js`: Authentication utilities

## Configuration

The Playwright configuration is defined in `playwright.config.js`, which includes:

- Browser configurations
- Test timeouts
- Screenshot and video settings
- Web server setup

## CI/CD Integration

E2E tests are integrated into our CI/CD pipeline and run on every push to the main branch and on pull requests.

The GitHub Actions workflow:

1. Sets up Python and Node.js environments
2. Installs dependencies
3. Runs the simplified tests first
4. Runs E2E tests with Chromium
5. Uploads test reports as artifacts

## Debugging Failed Tests

When tests fail in CI, you can:

1. Check the GitHub Actions logs for error messages
2. Download the Playwright report artifact, which includes screenshots of failed tests
3. Run the failing tests locally with `--debug` flag for interactive debugging

## Best Practices

1. Keep tests independent - each test should not depend on other tests
2. Use data fixtures for test data
3. Make assertions specific and meaningful
4. Focus on user flows rather than implementation details
5. Keep tests fast and reliable
6. Add appropriate wait strategies (avoid fixed timeouts)
7. Use page object patterns for maintainability

## Adding New Tests

To add new tests:

1. Create a new spec file in `e2e/tests` or add to an existing one
2. Follow the existing patterns and examples
3. Run the tests locally to verify they work
4. Submit a pull request with your changes