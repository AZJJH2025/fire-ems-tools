const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Station Overview', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test if needed
    await page.goto('/login');
    await page.getByLabel('Username').fill('rural_admin');
    await page.getByLabel('Password').fill('rural_admin');
    
    // Select department if the field exists
    const departmentSelector = page.getByLabel('Department');
    if (await departmentSelector.isVisible()) {
      await departmentSelector.selectOption('rural');
    }
    
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Navigate to Station Overview
    await page.goto('/station-overview');
  });

  test('should display Station Overview page with upload option', async ({ page }) => {
    // Verify page title and key elements
    await expect(page.getByRole('heading', { name: 'Station Overview Dashboard' })).toBeVisible();
    await expect(page.getByText('View comprehensive performance metrics and KPIs by fire station')).toBeVisible();
    
    // Verify file upload section is visible
    await expect(page.getByRole('heading', { name: 'Upload Station Data' })).toBeVisible();
    await expect(page.locator('#fileInput')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload & Analyze' })).toBeVisible();
    
    // Verify the empty state message
    await expect(page.getByText('No Data Available')).toBeVisible();
    await expect(page.getByText('Upload a data file to view station performance metrics and analytics.')).toBeVisible();
  });

  test('should show dashboard when data is uploaded', async ({ page }) => {
    // Create a mock file input event
    const filePath = path.join(__dirname, '../fixtures/station_data_sample.csv');
    
    // Upload the test file
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Verify loading indicator appears
    await expect(page.locator('#loading')).toBeVisible();
    
    // Wait for the dashboard to appear (data processed)
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify KPI cards are populated
    await expect(page.locator('#avgResponseTime')).not.toHaveText('--:--');
    await expect(page.locator('#totalCalls')).not.toHaveText('0');
    await expect(page.locator('#unitUtilization')).not.toHaveText('0%');
    
    // Verify charts are displayed
    await expect(page.locator('#responseTimeChart')).toBeVisible();
    await expect(page.locator('#callTypeChart')).toBeVisible();
    await expect(page.locator('#callHourChart')).toBeVisible();
    await expect(page.locator('#callDayChart')).toBeVisible();
    await expect(page.locator('#stationMap')).toBeVisible();
    await expect(page.locator('#unitUtilizationChart')).toBeVisible();
    
    // Verify metrics table exists and has data
    await expect(page.locator('#stationMetricsTable tbody tr')).toHaveCount(1);
  });

  test('should filter data by station', async ({ page }) => {
    // First upload data
    const filePath = path.join(__dirname, '../fixtures/station_data_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to load
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Get initial call count
    const initialCallCount = await page.locator('#totalCalls').textContent();
    
    // Select a specific station from dropdown
    await page.locator('#stationSelect').selectOption({ index: 1 }); // Select first station
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // Verify that data has been filtered (KPIs should update)
    await expect(page.locator('#totalCalls')).not.toHaveText(initialCallCount);
  });

  test('should filter data by date range', async ({ page }) => {
    // First upload data
    const filePath = path.join(__dirname, '../fixtures/station_data_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to load
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Get initial call count
    const initialCallCount = await page.locator('#totalCalls').textContent();
    
    // Set a smaller date range
    await page.locator('#dateRange').click();
    await page.locator('.daterangepicker .ranges li').nth(0).click(); // Click first range option
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // Verify that data has been filtered (KPIs should update)
    await expect(page.locator('#totalCalls')).not.toHaveText(initialCallCount);
  });

  test('should filter data by call type', async ({ page }) => {
    // First upload data
    const filePath = path.join(__dirname, '../fixtures/station_data_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to load
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Get initial call count
    const initialCallCount = await page.locator('#totalCalls').textContent();
    
    // Select a specific call type
    await page.locator('#callTypeSelect').selectOption('EMS');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // Verify that data has been filtered (KPIs should update)
    await expect(page.locator('#totalCalls')).not.toHaveText(initialCallCount);
  });

  test('should reset filters', async ({ page }) => {
    // First upload data
    const filePath = path.join(__dirname, '../fixtures/station_data_sample.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to load
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Get initial call count
    const initialCallCount = await page.locator('#totalCalls').textContent();
    
    // Apply a filter
    await page.locator('#callTypeSelect').selectOption('EMS');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // Verify filter applied
    const filteredCallCount = await page.locator('#totalCalls').textContent();
    expect(filteredCallCount).not.toEqual(initialCallCount);
    
    // Reset filters
    await page.getByRole('button', { name: 'Reset' }).click();
    
    // Verify reset
    await expect(page.locator('#totalCalls')).toHaveText(initialCallCount);
  });
});