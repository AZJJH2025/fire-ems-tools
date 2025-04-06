const { test, expect } = require('../fixtures/auth-fixture');
const { navigateToFeature } = require('../utils/auth');

test.describe('Call Density Heatmap', () => {
  test('should display call density page', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'call-density');
    
    // Verify call density elements
    await expect(page.getByRole('heading', { name: 'Call Density Heatmap' })).toBeVisible();
    
    // Map should be visible
    await expect(page.locator('#map-container')).toBeVisible();
    
    // Controls should be visible
    await expect(page.locator('.map-controls')).toBeVisible();
  });

  test('should filter incidents by date range', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'call-density');
    
    // Set date range filters
    await page.getByLabel('Start Date').fill('2023-01-01');
    await page.getByLabel('End Date').fill('2023-01-31');
    
    // Apply filters
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // Wait for map to update
    await page.waitForResponse(response => 
      response.url().includes('/api/incidents') && 
      response.status() === 200
    );
    
    // Verify filter info is displayed
    await expect(page.getByText(/Showing incidents from/)).toBeVisible();
  });

  test('should filter incidents by type', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'call-density');
    
    // Select incident type from dropdown
    await page.getByLabel('Incident Type').selectOption('STRUCTURE_FIRE');
    
    // Apply filters
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // Wait for map to update
    await page.waitForResponse(response => 
      response.url().includes('/api/incidents') && 
      response.status() === 200
    );
    
    // Verify filter info is displayed
    await expect(page.getByText(/Type: STRUCTURE_FIRE/)).toBeVisible();
  });

  test('should change heatmap intensity', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'call-density');
    
    // Find the intensity slider
    const intensitySlider = page.locator('#heatmap-intensity');
    
    // Set intensity to maximum
    await intensitySlider.fill('100');
    
    // Apply the change (either by changing the value or clicking a button)
    await page.getByRole('button', { name: 'Update Map' }).click();
    
    // Wait for map to update
    await page.waitForTimeout(1000); // Allow time for map to visually update
    
    // It's hard to verify visual changes, but we can check that the slider value changed
    await expect(intensitySlider).toHaveValue('100');
  });

  test('should export heatmap data', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'call-density');
    
    // Click export button
    await page.getByRole('button', { name: 'Export Data' }).click();
    
    // Verify export options are shown
    await expect(page.getByText('Export Format')).toBeVisible();
    
    // Select CSV format
    await page.getByLabel('Export Format').selectOption('csv');
    
    // Download the file
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    const download = await downloadPromise;
    
    // Verify download started
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should toggle map layers', async ({ authenticatedPage: page }) => {
    await navigateToFeature(page, 'call-density');
    
    // Toggle station locations
    await page.getByLabel('Show Station Locations').check();
    
    // Wait for map to update
    await page.waitForTimeout(500);
    
    // Verify the layer is checked
    await expect(page.getByLabel('Show Station Locations')).toBeChecked();
    
    // Toggle district boundaries if available
    const boundariesCheckbox = page.getByLabel('Show District Boundaries');
    if (await boundariesCheckbox.isVisible()) {
      await boundariesCheckbox.check();
      await page.waitForTimeout(500);
      await expect(boundariesCheckbox).toBeChecked();
    }
  });
});