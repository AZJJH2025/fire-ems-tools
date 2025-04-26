const { test, expect } = require('../fixtures/auth-fixture');
const { navigateToFeature } = require('../utils/auth');

test.describe('Incident Logger', () => {
  test('should display incident logger page', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'incident-logger');
    
    // Verify incident logger elements
    await expect(page.getByRole('heading', { name: 'Incident Logger' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Incident' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent Incidents' })).toBeVisible();
  });

  test('should create a new incident', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'incident-logger');
    
    // Click new incident button
    await page.getByRole('button', { name: 'New Incident' }).click();
    
    // Wait for the new incident form
    await expect(page.getByRole('heading', { name: 'New Incident' })).toBeVisible();
    
    // Generate a unique incident number
    const incidentNumber = `TEST-${Date.now()}`;
    
    // Fill the incident form
    await page.getByLabel('Incident Number').fill(incidentNumber);
    await page.getByLabel('Incident Date').fill('2023-01-01');
    await page.getByLabel('Incident Time').fill('10:00');
    await page.getByLabel('Incident Type').selectOption('STRUCTURE_FIRE');
    await page.getByLabel('Latitude').fill('33.4484');
    await page.getByLabel('Longitude').fill('-112.0740');
    await page.getByLabel('Address').fill('123 Test St');
    await page.getByLabel('Description').fill('Test incident created by E2E test');
    
    // Submit the form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify success message
    await expect(page.getByText('Incident created successfully')).toBeVisible();
    
    // Verify incident appears in the list
    await expect(page.getByText(incidentNumber)).toBeVisible();
  });

  test('should view incident details', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'incident-logger');
    
    // Click first incident in the list
    await page.getByRole('link', { name: /^[A-Z0-9-]+$/ }).first().click();
    
    // Verify incident details page
    await expect(page.getByRole('heading', { name: /Incident Details/ })).toBeVisible();
    await expect(page.getByText('Date:')).toBeVisible();
    await expect(page.getByText('Type:')).toBeVisible();
    await expect(page.getByText('Location:')).toBeVisible();
  });

  test('should search for incidents', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'incident-logger');
    
    // Enter search term
    await page.getByPlaceholder('Search incidents...').fill('FIRE');
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Verify search results
    await expect(page.getByText('Search Results')).toBeVisible();
    
    // Check that at least one result contains FIRE
    const resultCount = await page.getByText(/FIRE/).count();
    expect(resultCount).toBeGreaterThan(0);
  });

  test('should handle validation errors', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'incident-logger');
    
    // Click new incident button
    await page.getByRole('button', { name: 'New Incident' }).click();
    
    // Submit without filling required fields
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify validation errors
    await expect(page.getByText('Incident Number is required')).toBeVisible();
    await expect(page.getByText('Incident Date is required')).toBeVisible();
  });

  test('readonly user cannot create incidents', async ({ readonlyPage: page }) => {
    await navigateToFeature(page, 'incident-logger');
    
    // Verify that the New Incident button is not visible or disabled
    const newIncidentButton = page.getByRole('button', { name: 'New Incident' });
    
    if (await newIncidentButton.isVisible()) {
      // If visible, it should be disabled
      await expect(newIncidentButton).toBeDisabled();
    } else {
      // If not visible, we're good - readonly users shouldn't see it
      expect(await newIncidentButton.count()).toBe(0);
    }
  });
});