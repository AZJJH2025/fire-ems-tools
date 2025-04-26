const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Data Formatter', () => {
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
    
    // Navigate to Data Formatter
    await page.goto('/data-formatter');
  });

  test('should display Data Formatter page with initial options', async ({ page }) => {
    // Verify page title and description
    await expect(page.getByRole('heading', { name: 'Data Formatter' })).toBeVisible();
    
    // Verify key components are displayed
    await expect(page.getByText('Select Target Tool')).toBeVisible();
    await expect(page.getByText('Upload Data File')).toBeVisible();
    
    // Check for tool selection options
    await expect(page.locator('#tool-selector')).toBeVisible();
    
    // Verify the file upload component is visible
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
  });

  test('should allow selection of target tool', async ({ page }) => {
    // Verify tool selector exists
    await expect(page.locator('#tool-selector')).toBeVisible();
    
    // Select each tool option and verify selection
    await page.selectOption('#tool-selector', 'response-time');
    await expect(page.locator('#tool-selector')).toHaveValue('response-time');
    
    await page.selectOption('#tool-selector', 'call-density');
    await expect(page.locator('#tool-selector')).toHaveValue('call-density');
    
    await page.selectOption('#tool-selector', 'station-overview');
    await expect(page.locator('#tool-selector')).toHaveValue('station-overview');
    
    // Verify description changes based on selected tool
    await page.selectOption('#tool-selector', 'response-time');
    await expect(page.getByText(/Response Time Analyzer/)).toBeVisible();
  });

  test('should process uploaded file and display column mapping', async ({ page }) => {
    // Select a target tool
    await page.selectOption('#tool-selector', 'response-time');
    
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/source_data_sample.csv');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Verify loading indicator appears and disappears
    await expect(page.locator('#loading-indicator')).toBeVisible();
    await expect(page.locator('#loading-indicator')).not.toBeVisible({ timeout: 10000 });
    
    // Verify column mapping UI appears
    await expect(page.getByText('Map Your Data Columns')).toBeVisible();
    
    // Verify source columns are displayed
    await expect(page.locator('.source-column')).toHaveCount.toBeGreaterThan(0);
    
    // Verify target field dropdowns are displayed
    await expect(page.locator('.target-field-dropdown')).toHaveCount.toBeGreaterThan(0);
  });

  test('should allow column mapping and generate formatted data', async ({ page }) => {
    // Select a target tool
    await page.selectOption('#tool-selector', 'response-time');
    
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/source_data_sample.csv');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Wait for column mapping UI
    await expect(page.getByText('Map Your Data Columns')).toBeVisible({ timeout: 10000 });
    
    // Map some columns (the exact selectors depend on your UI implementation)
    await page.selectOption('.source-column:nth-child(1) .target-field-dropdown', 'incident_id');
    await page.selectOption('.source-column:nth-child(2) .target-field-dropdown', 'unit');
    await page.selectOption('.source-column:nth-child(3) .target-field-dropdown', 'reported_date');
    await page.selectOption('.source-column:nth-child(4) .target-field-dropdown', 'reported_time');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Formatted Data' }).click();
    
    // Verify formatted data preview appears
    await expect(page.getByText('Formatted Data Preview')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#formatted-data-preview')).toBeVisible();
    
    // Verify the preview has data rows
    await expect(page.locator('#formatted-data-preview tbody tr')).toHaveCount.toBeGreaterThan(0);
  });

  test('should allow export of formatted data', async ({ page }) => {
    // Select a target tool
    await page.selectOption('#tool-selector', 'response-time');
    
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/source_data_sample.csv');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Wait for column mapping UI
    await expect(page.getByText('Map Your Data Columns')).toBeVisible({ timeout: 10000 });
    
    // Map columns
    await page.selectOption('.source-column:nth-child(1) .target-field-dropdown', 'incident_id');
    await page.selectOption('.source-column:nth-child(2) .target-field-dropdown', 'unit');
    
    // Generate formatted data
    await page.getByRole('button', { name: 'Generate Formatted Data' }).click();
    
    // Wait for preview
    await expect(page.getByText('Formatted Data Preview')).toBeVisible({ timeout: 5000 });
    
    // Download the formatted data
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download CSV' }).click();
    await downloadPromise;
  });

  test('should allow direct use in target tool', async ({ page }) => {
    // Select a target tool
    await page.selectOption('#tool-selector', 'response-time');
    
    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/source_data_sample.csv');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Wait for column mapping UI
    await expect(page.getByText('Map Your Data Columns')).toBeVisible({ timeout: 10000 });
    
    // Map columns
    await page.selectOption('.source-column:nth-child(1) .target-field-dropdown', 'incident_id');
    await page.selectOption('.source-column:nth-child(2) .target-field-dropdown', 'unit');
    
    // Generate formatted data
    await page.getByRole('button', { name: 'Generate Formatted Data' }).click();
    
    // Wait for preview
    await expect(page.getByText('Formatted Data Preview')).toBeVisible({ timeout: 5000 });
    
    // Navigate directly to the target tool
    const navigationPromise = page.waitForNavigation();
    await page.getByRole('button', { name: 'Use in Response Time Analyzer' }).click();
    await navigationPromise;
    
    // Verify we're on the response time analyzer page with data loaded
    await expect(page).toHaveURL(/.*\/fire-ems-dashboard/);
    
    // Verify dashboard appears with data
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should handle invalid file uploads', async ({ page }) => {
    // Select a target tool
    await page.selectOption('#tool-selector', 'response-time');
    
    // Upload an invalid file
    const filePath = path.join(__dirname, '../fixtures/invalid_file.txt');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Verify error message appears
    await expect(page.getByText(/Error/i)).toBeVisible();
    await expect(page.getByText(/Invalid file format/i)).toBeVisible();
  });

  test('should remember column mappings for repeated uploads', async ({ page }) => {
    // Select a target tool
    await page.selectOption('#tool-selector', 'response-time');
    
    // First upload
    const filePath = path.join(__dirname, '../fixtures/source_data_sample.csv');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Wait for column mapping UI
    await expect(page.getByText('Map Your Data Columns')).toBeVisible({ timeout: 10000 });
    
    // Set mappings
    await page.selectOption('.source-column:nth-child(1) .target-field-dropdown', 'incident_id');
    await page.selectOption('.source-column:nth-child(2) .target-field-dropdown', 'unit');
    
    // Save mappings (if there's a save button)
    if (await page.getByRole('button', { name: 'Save Mappings' }).isVisible()) {
      await page.getByRole('button', { name: 'Save Mappings' }).click();
    }
    
    // Upload the same file again
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Wait for column mapping UI
    await expect(page.getByText('Map Your Data Columns')).toBeVisible({ timeout: 10000 });
    
    // Verify the previous mappings are retained
    await expect(page.locator('.source-column:nth-child(1) .target-field-dropdown')).toHaveValue('incident_id');
    await expect(page.locator('.source-column:nth-child(2) .target-field-dropdown')).toHaveValue('unit');
  });
});