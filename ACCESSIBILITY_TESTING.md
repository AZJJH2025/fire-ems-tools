# Accessibility Testing for Fire-EMS Tools

This document outlines the accessibility testing approach for the Fire-EMS Tools application, focusing on making the application usable by people with disabilities.

## Overview

Accessibility testing ensures that our application can be used by people with various disabilities, including visual, auditory, motor, and cognitive impairments. Our accessibility testing is based on the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level.

## Automated Testing with Axe

We use the Axe accessibility testing engine via Playwright to automatically detect common accessibility issues:

```javascript
const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

test('page should be accessible', async ({ page }) => {
  await page.goto('/some-page');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Installation

To run accessibility tests, you need to install the Axe integration for Playwright:

```bash
cd e2e
npm install @axe-core/playwright --save-dev
```

### Running Tests

Run accessibility tests using the E2E testing script:

```bash
./run_e2e_tests.sh --test-match="accessibility.spec.js"
```

## Accessibility Tests Coverage

Our automated accessibility tests check for several categories of issues:

1. **Perceivable Content**
   - Color contrast for text readability
   - Alt text for images
   - Text alternatives for non-text content
   - Proper heading structure

2. **Operable Interface**
   - Keyboard accessibility
   - Focus order and visibility
   - No keyboard traps
   - Skip navigation links

3. **Understandable Information**
   - Form labels and instructions
   - Error identification and suggestions
   - Consistent navigation

4. **Robust Implementation**
   - Valid ARIA attributes
   - Properly structured HTML
   - Name, role, and value for interactive elements

## Manual Testing Procedures

In addition to automated testing, we perform manual accessibility checks:

### Keyboard Navigation Testing

1. Navigate the entire application using only the keyboard
2. Verify that all interactive elements can be reached via Tab key
3. Check that the focus indicator is visible at all times
4. Ensure that modal dialogs trap focus correctly
5. Test skip navigation links

### Screen Reader Testing

1. Navigate the application using screen readers (NVDA, VoiceOver, JAWS)
2. Verify that all content is properly announced
3. Check that dynamic content changes are announced
4. Test that form controls are properly labeled

### Zoom and Magnification

1. Test the application at various zoom levels (up to 200%)
2. Verify that text is properly resized
3. Check that layouts are responsive to zoom
4. Ensure no content is clipped or obscured

## WCAG 2.1 AA Compliance Checklist

Our accessibility testing verifies compliance with these key WCAG 2.1 AA success criteria:

- **1.1.1 Non-text Content**: Provide text alternatives for non-text content
- **1.2.1 Audio-only and Video-only**: Provide alternatives for time-based media
- **1.3.1 Info and Relationships**: Information, structure, and relationships can be programmatically determined
- **1.3.2 Meaningful Sequence**: Correct reading sequence can be programmatically determined
- **1.3.3 Sensory Characteristics**: Instructions don't rely solely on sensory characteristics
- **1.4.1 Use of Color**: Color is not the only visual means of conveying information
- **1.4.3 Contrast (Minimum)**: Text has a contrast ratio of at least 4.5:1
- **1.4.4 Resize Text**: Text can be resized up to 200% without loss of content or function
- **2.1.1 Keyboard**: All functionality is available from a keyboard
- **2.1.2 No Keyboard Trap**: Keyboard focus can be moved away from any component
- **2.4.1 Bypass Blocks**: Provide a way to bypass repetitive content
- **2.4.3 Focus Order**: Focus order preserves meaning and operability
- **2.4.4 Link Purpose (In Context)**: The purpose of each link can be determined from the link text
- **2.4.7 Focus Visible**: Keyboard focus indicator is visible
- **3.1.1 Language of Page**: The default human language of the page can be programmatically determined
- **3.2.3 Consistent Navigation**: Navigation mechanisms are consistent
- **3.3.1 Error Identification**: Form errors are identified and described to the user
- **3.3.2 Labels or Instructions**: Labels or instructions are provided for user input
- **4.1.1 Parsing**: No major HTML/XHTML validation errors
- **4.1.2 Name, Role, Value**: For all UI components, the name, role, and state can be programmatically determined

## CI/CD Integration

Accessibility tests are integrated into our CI/CD pipeline:

```yaml
- name: Run accessibility tests
  working-directory: ./e2e
  run: |
    npm test -- --project=chromium --grep="Accessibility Testing"
  env:
    BASE_URL: http://localhost:8080
```

## Reporting and Remediation

When accessibility issues are found:

1. Create a detailed ticket with:
   - The specific WCAG criterion violated
   - Steps to reproduce the issue
   - Screenshots or recordings
   - Recommendations for fixing

2. Prioritize fixes based on:
   - Severity of the issue
   - Number of users affected
   - Difficulty of implementation

3. Verify fixes with:
   - Automated re-testing
   - Manual verification
   - User testing when appropriate

## Resources

- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
- [Axe-core GitHub Repository](https://github.com/dequelabs/axe-core)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Deque University](https://dequeuniversity.com/)