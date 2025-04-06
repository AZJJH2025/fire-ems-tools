const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Response Time Analysis', () => {
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
    
    // Navigate to Response Time Analyzer
    await page.goto('/fire-ems-dashboard');
  });

  test('should display Response Time Analyzer page with upload option', async ({ page }) => {
    // Verify page title and description
    await expect(page.getByRole('heading', { name: 'Response Time Analyzer' })).toBeVisible();
    await expect(page.getByText('Upload your Fire/EMS data files for interactive visualization and analysis')).toBeVisible();
    
    // Verify file upload section
    await expect(page.getByText('Upload Data File')).toBeVisible();
    await expect(page.locator('#fileInput')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload & Analyze' })).toBeVisible();
    
    // Verify initial state shows instructions
    await expect(page.getByText('Upload a file to view analytics and visualizations')).toBeVisible();
    await expect(page.locator('#dashboard')).toHaveCSS('display', 'none');
  });

  test('should process uploaded data and display dashboard', async ({ page }) => {
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/response_time_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Verify loading indicator appears
    await expect(page.locator('#loading')).toBeVisible();
    
    // Wait for dashboard to appear
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify key dashboard elements are displayed
    await expect(page.getByRole('heading', { name: 'Data Analysis Dashboard' })).toBeVisible();
    await expect(page.locator('#incident-map')).toBeVisible();
    await expect(page.locator('#time-chart')).toBeVisible();
    await expect(page.locator('#unit-chart')).toBeVisible();
    await expect(page.locator('#location-chart')).toBeVisible();
    await expect(page.locator('#data-table')).toBeVisible();
  });

  test('should display incident map with markers', async ({ page }) => {
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/response_time_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to appear
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify map is displayed
    await expect(page.locator('#incident-map')).toBeVisible();
    
    // Verify map markers are created
    await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
    
    // Check that multiple markers exist on the map
    const markerCount = await page.locator('.leaflet-marker-icon').count();
    expect(markerCount).toBeGreaterThan(0);
  });

  test('should display time patterns heatmap', async ({ page }) => {
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/response_time_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to appear
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify time chart is displayed
    await expect(page.locator('#time-chart')).toBeVisible();
    
    // Verify chart elements
    await expect(page.locator('#time-chart .time-heatmap-cell')).toBeVisible();
  });

  test('should display unit activity chart', async ({ page }) => {
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/response_time_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to appear
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify unit chart is displayed
    await expect(page.locator('#unit-chart')).toBeVisible();
    
    // Verify chart has data (Chart.js renders canvas)
    const canvas = page.locator('.chart-container canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should display incidents by location chart', async ({ page }) => {
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/response_time_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to appear
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify location chart is displayed
    await expect(page.locator('#location-chart')).toBeVisible();
    
    // Verify chart has data (Chart.js renders canvas)
    const canvas = page.locator('.chart-container canvas').nth(1);
    await expect(canvas).toBeVisible();
  });

  test('should display incidents data table with pagination', async ({ page }) => {
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/response_time_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to appear
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify data table is displayed
    await expect(page.locator('#data-table')).toBeVisible();
    
    // Verify table has headers and data rows
    await expect(page.locator('#data-table table thead tr')).toBeVisible();
    await expect(page.locator('#data-table table tbody tr')).toHaveCount.toBeGreaterThan(0);
    
    // Check pagination if present
    const paginationExists = await page.locator('.pagination-controls').isVisible();
    if (paginationExists) {
      await page.locator('.pagination-controls .next-page').click();
      // Verify page changed (could be by checking row content or page indicator)
      await expect(page.locator('.pagination-controls .current-page')).not.toHaveText('1');
    }
  });

  test('should be able to interact with incident map', async ({ page }) => {
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/response_time_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to appear
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify map is displayed
    await expect(page.locator('#incident-map')).toBeVisible();
    
    // Click on a marker to view incident details
    await page.locator('.leaflet-marker-icon').first().click();
    
    // Verify popup appears with incident information
    await expect(page.locator('.leaflet-popup')).toBeVisible();
    await expect(page.locator('.leaflet-popup-content')).toContainText('Incident');
    
    // Close popup
    await page.locator('.leaflet-popup-close-button').click();
    await expect(page.locator('.leaflet-popup')).not.toBeVisible();
  });

  test('should handle invalid file upload', async ({ page }) => {
    // Upload an invalid file (wrong format)
    const filePath = path.join(__dirname, '../fixtures/invalid_file.txt');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Verify error message is displayed
    await expect(page.locator('#result')).toContainText('Error');
    
    // Ensure dashboard remains hidden
    await expect(page.locator('#dashboard')).toHaveCSS('display', 'none');
  });
});