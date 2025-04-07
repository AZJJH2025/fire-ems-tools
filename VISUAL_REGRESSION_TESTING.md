# Visual Regression Testing Guide

This guide covers visual regression testing for the Fire-EMS Tools application, which helps detect unintended visual changes in the UI.

## Overview

Visual regression testing captures screenshots of UI components and pages, then compares them with baseline images to identify visual differences. This helps catch unintended visual changes such as:

- Layout shifts
- CSS styling changes
- Missing UI elements
- Text rendering issues
- Responsive design breakages

Our visual regression framework uses Playwright for browser automation and OpenCV for image comparison.

## Setup

### Prerequisites

- Python 3.10+
- Playwright
- OpenCV

### Installation

```bash
# Install dependencies
pip install playwright opencv-python numpy

# Install Playwright browsers
playwright install
```

## Running Tests

### Basic Usage

Run visual regression tests against the development server:

```bash
python visual_regression_test.py
```

### Update Baseline Images

When UI changes are intentional, update the baseline images:

```bash
python visual_regression_test.py --update-baseline
```

### Test Specific Pages

Test only certain pages:

```bash
python visual_regression_test.py --pages home dashboard incident-logger
```

### Test Specific Viewports

Test only certain device viewports:

```bash
python visual_regression_test.py --viewports desktop tablet
```

### Custom Threshold

Adjust the threshold for pixel differences (0.0-1.0):

```bash
python visual_regression_test.py --threshold 0.05
```

### Custom Configuration

Use a custom configuration file:

```bash
python visual_regression_test.py --config ./my_config.json
```

## Configuration File

The configuration file (`visual_regression/config.json`) defines:

- Viewport sizes to test
- Pages to test
- Regions to ignore during comparison (dynamic content)
- Login credentials for authenticated pages

Example:

```json
{
  "viewport_sizes": [
    {
      "width": 1920,
      "height": 1080,
      "name": "desktop"
    },
    {
      "width": 768,
      "height": 1024,
      "name": "tablet"
    },
    {
      "width": 375,
      "height": 812,
      "name": "mobile"
    }
  ],
  "pages_to_test": [
    {
      "route": "/",
      "name": "home"
    },
    {
      "route": "/fire-ems-dashboard",
      "name": "dashboard",
      "auth": "user"
    }
  ],
  "ignore_regions": {
    "dashboard_desktop": [
      {
        "x": 800,
        "y": 100,
        "width": 400,
        "height": 100
      }
    ]
  }
}
```

## Ignoring Dynamic Content

To ignore dynamic content areas that change between test runs:

1. Add regions to the `ignore_regions` section in the config file
2. Use the format `page_name_viewport_name` as the key
3. Define regions with `x`, `y`, `width`, and `height` properties

Example:

```json
"ignore_regions": {
  "dashboard_desktop": [
    {
      "x": 800,
      "y": 100,
      "width": 400,
      "height": 100
    }
  ]
}
```

## Handling Authentication

For pages that require authentication:

1. Add the `auth` property to the page definition in the config
2. Specify the role (`admin` or `user`)
3. Add credentials to the config file

Example:

```json
"pages_to_test": [
  {
    "route": "/fire-ems-dashboard",
    "name": "dashboard",
    "auth": "user"
  }
]
```

## Test Reports

After running tests, HTML reports are generated in the `visual_regression/reports` directory. The report includes:

- Summary metrics
- Side-by-side comparisons of baseline and current screenshots
- Visual diff highlighting areas of change
- Test results for each page and viewport

## Folder Structure

```
visual_regression/
├── baseline/       # Baseline screenshots
├── screenshots/    # Current screenshots
├── diff/           # Difference visualizations
├── reports/        # HTML reports
└── config.json     # Test configuration
```

## Continuous Integration

Add visual regression tests to your CI pipeline:

```yaml
visual-regression:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install playwright opencv-python numpy
        playwright install --with-deps chromium
    - name: Start server
      run: |
        python app.py &
        sleep 5
    - name: Run visual regression tests
      run: |
        python visual_regression_test.py
    - name: Upload reports
      uses: actions/upload-artifact@v3
      with:
        name: visual-regression-reports
        path: visual_regression/reports/
```

## Best Practices

1. **Update baselines** when UI changes are intentional
2. **Ignore dynamic content** like timestamps, user-specific data, and random elements
3. **Test all device viewports** to catch responsive design issues
4. **Add visual tests** for critical UI components and important pages
5. **Keep thresholds low** (0.01-0.1) for precise detection of changes
6. **Regularly review and clean up** baseline images to remove outdated references

## Troubleshooting

### False Positives

If you get false positives (differences when there should be none):

1. Check for dynamic content that should be ignored
2. Adjust the threshold to be more tolerant
3. Ensure the test environment is consistent

### Authentication Issues

If tests fail due to authentication:

1. Verify credentials in the config file
2. Check that the login route is correct
3. Ensure the auth flow works (may need to handle 2FA or CSRF tokens)

### Inconsistent Screenshots

If screenshots vary between runs:

1. Disable animations in the application for testing
2. Add appropriate wait conditions
3. Use consistent seed data