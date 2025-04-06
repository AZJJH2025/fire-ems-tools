const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Fire Map Pro', () => {
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
    
    // Navigate to Fire Map Pro
    await page.goto('/fire-map-pro');
  });

  test('should display Fire Map Pro with interactive map', async ({ page }) => {
    // Verify the title and page components
    await expect(page.getByRole('heading', { name: /FireMapPro/i })).toBeVisible();
    
    // Verify the map is loaded
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.locator('.leaflet-control-zoom')).toBeVisible();
    
    // Verify sidebar components
    await expect(page.getByText('Layers')).toBeVisible();
    await expect(page.getByText('Map Features')).toBeVisible();
  });

  test('should toggle basemap layers', async ({ page }) => {
    // Wait for map to be fully loaded
    await expect(page.locator('.leaflet-container')).toBeVisible();
    
    // Find and click the basemap selector
    await page.locator('.basemap-selector').click();
    
    // Choose a different basemap (satellite)
    await page.getByText('Satellite').click();
    
    // Verify the basemap has changed (this will be an attribute or class change)
    // Since we can't directly check the map tiles, we'll verify the selector shows the new selection
    await expect(page.locator('.basemap-selector')).toContainText('Satellite');
  });

  test('should add and remove map features', async ({ page }) => {
    // Wait for map to be fully loaded
    await expect(page.locator('.leaflet-container')).toBeVisible();
    
    // Expand the map features section if it's collapsed
    const featuresSection = page.getByText('Map Features');
    await featuresSection.click();
    
    // Find and click the marker tool
    await page.getByRole('button', { name: 'Add Marker' }).click();
    
    // Click on the map to add a marker
    await page.locator('.leaflet-container').click();
    
    // Verify a marker was added (check for leaflet marker)
    await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
    
    // Delete the marker
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Click on the marker to delete it
    await page.locator('.leaflet-marker-icon').click();
    
    // Verify marker was removed
    await expect(page.locator('.leaflet-marker-icon')).not.toBeVisible();
  });

  test('should draw and edit polygon', async ({ page }) => {
    // Wait for map to be fully loaded
    await expect(page.locator('.leaflet-container')).toBeVisible();
    
    // Click the polygon draw button
    await page.getByRole('button', { name: 'Draw Polygon' }).click();
    
    // Draw a polygon by clicking multiple points on the map
    const map = page.locator('.leaflet-container');
    
    // Click in 4 places to create a polygon
    await map.click({ position: { x: 100, y: 100 } });
    await map.click({ position: { x: 200, y: 100 } });
    await map.click({ position: { x: 200, y: 200 } });
    await map.click({ position: { x: 100, y: 100 } }); // Close the polygon
    
    // Verify polygon exists
    await expect(page.locator('.leaflet-interactive')).toBeVisible();
  });

  test('should upload and display data on the map', async ({ page }) => {
    // Wait for map to be fully loaded
    await expect(page.locator('.leaflet-container')).toBeVisible();
    
    // Expand data upload section if needed
    await page.getByText('Upload Data').click();
    
    // Upload the test file
    const filePath = path.join(__dirname, '../fixtures/fire_incidents_sample.csv');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    
    // Click upload button
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Wait for data to be processed
    await expect(page.getByText('Data uploaded successfully')).toBeVisible({ timeout: 10000 });
    
    // Verify incidents are displayed on map
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(5);
  });

  test('should filter data by incident type', async ({ page }) => {
    // First upload data
    await expect(page.locator('.leaflet-container')).toBeVisible();
    
    // Expand data upload section
    await page.getByText('Upload Data').click();
    
    // Upload the test file
    const filePath = path.join(__dirname, '../fixtures/fire_incidents_sample.csv');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Wait for data to be processed
    await expect(page.getByText('Data uploaded successfully')).toBeVisible({ timeout: 10000 });
    
    // Get initial marker count
    const initialMarkerCount = await page.locator('.leaflet-marker-icon').count();
    
    // Expand filters section
    await page.getByText('Filters').click();
    
    // Select only "Fire" type incidents
    await page.getByLabel('Fire').check();
    await page.getByLabel('EMS').uncheck();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // Verify fewer markers are displayed
    const filteredMarkerCount = await page.locator('.leaflet-marker-icon').count();
    expect(filteredMarkerCount).toBeLessThan(initialMarkerCount);
  });

  test('should export map as image', async ({ page }) => {
    // Wait for map to be fully loaded
    await expect(page.locator('.leaflet-container')).toBeVisible();
    
    // Expand export section
    await page.getByText('Export').click();
    
    // Click export as image button
    await page.getByRole('button', { name: 'Export as Image' }).click();
    
    // Check for download dialog or notification
    await expect(page.getByText('Export Successful')).toBeVisible({ timeout: 10000 });
  });
});