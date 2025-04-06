const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

test.describe('Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel('Username').fill('rural_admin');
    await page.getByLabel('Password').fill('rural_admin');
    
    // Select department if the field exists
    const departmentSelector = page.getByLabel('Department');
    if (await departmentSelector.isVisible()) {
      await departmentSelector.selectOption('rural');
    }
    
    await page.getByRole('button', { name: 'Login' }).click();
  });

  test('Home page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Incident Logger should be accessible', async ({ page }) => {
    await page.goto('/incident-logger');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Log violations for debugging (helpful in CI environments)
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Call Density Heatmap should be accessible', async ({ page }) => {
    await page.goto('/call-density-heatmap');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Response Time Analyzer should be accessible', async ({ page }) => {
    await page.goto('/fire-ems-dashboard');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Station Overview should be accessible', async ({ page }) => {
    await page.goto('/station-overview');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Fire Map Pro should be accessible', async ({ page }) => {
    await page.goto('/fire-map-pro');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Data Formatter should be accessible', async ({ page }) => {
    await page.goto('/data-formatter');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Login form should be keyboard navigable', async ({ page }) => {
    // Start from a logged out state
    await page.goto('/logout');
    await page.goto('/login');
    
    // Test keyboard navigation - Tab to username field
    await page.keyboard.press('Tab');
    const activeElement1 = await page.evaluate(() => document.activeElement.getAttribute('name') || document.activeElement.getAttribute('id'));
    expect(activeElement1).toBe('username');
    
    // Tab to password field
    await page.keyboard.press('Tab');
    const activeElement2 = await page.evaluate(() => document.activeElement.getAttribute('name') || document.activeElement.getAttribute('id'));
    expect(activeElement2).toBe('password');
    
    // Tab to department selector if it exists
    const hasDepartmentSelector = await page.getByLabel('Department').isVisible();
    if (hasDepartmentSelector) {
      await page.keyboard.press('Tab');
      const activeElement3 = await page.evaluate(() => document.activeElement.tagName.toLowerCase());
      expect(activeElement3).toBe('select');
    }
    
    // Tab to login button
    await page.keyboard.press('Tab');
    const activeElement4 = await page.evaluate(() => document.activeElement.textContent.trim());
    expect(activeElement4).toBe('Login');
    
    // Press Enter to submit the form
    await page.keyboard.press('Enter');
    
    // Should see login error (since fields are empty)
    await expect(page.getByText(/invalid username or password/i)).toBeVisible();
  });

  test('Incident Logger should support keyboard navigation', async ({ page }) => {
    await page.goto('/incident-logger');
    
    // Test keyboard access to add incident button
    await page.keyboard.press('Tab');
    
    // Keep tabbing until we reach the Add New Incident button
    let buttonFound = false;
    for (let i = 0; i < 10; i++) {
      const activeElementText = await page.evaluate(() => document.activeElement.textContent.trim());
      if (activeElementText === 'Add New Incident') {
        buttonFound = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    
    expect(buttonFound).toBe(true);
    
    // Press Enter to click the button
    await page.keyboard.press('Enter');
    
    // Incident form should be visible
    await expect(page.getByText(/new incident/i)).toBeVisible();
  });

  test('Color contrast should meet WCAG standards', async ({ page }) => {
    await page.goto('/');
    
    // Run axe with specific rules for color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    // Assert no contrast violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page should have proper heading structure', async ({ page }) => {
    await page.goto('/incident-logger');
    
    // Run axe with specific rules for headings
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();
    
    // Assert no heading structure violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Form elements should have associated labels', async ({ page }) => {
    await page.goto('/incident-logger');
    
    // Click add new incident to open the form
    await page.getByRole('button', { name: 'Add New Incident' }).click();
    
    // Run axe with specific rules for form labels
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();
    
    // Assert no label violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Image elements should have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Run axe with specific rules for image alt text
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();
    
    // Assert no alt text violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Active elements should be reachable by keyboard', async ({ page }) => {
    await page.goto('/');
    
    // Run axe with specific rules for keyboard access
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['button-name', 'aria-allowed-attr', 'aria-required-attr', 'focus-order-semantics'])
      .analyze();
    
    // Assert no keyboard accessibility violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Should have aria-labels for interactive elements', async ({ page }) => {
    await page.goto('/fire-map-pro');
    
    // Run axe with specific rules for ARIA
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-roles', 'aria-valid-attr-value', 'aria-valid-attr'])
      .analyze();
    
    // Assert no ARIA violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});