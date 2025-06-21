const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Data Formatter to Response Time Analyzer Transfer', () => {
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

  test('should properly transform field names when transferring data', async ({ page }) => {
    // Navigate to Data Formatter
    await page.goto('/data-formatter');

    // Select Response Time Analyzer as target tool
    await page.selectOption('#tool-selector', 'response-time');

    // Upload a sample data file
    const filePath = path.join(__dirname, '../fixtures/source_data_sample.csv');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload' }).click();

    // Wait for column mapping UI
    await expect(page.getByText('Map Your Data Columns')).toBeVisible({ timeout: 10000 });

    // Map specific test columns with spaces in their names
    await page.selectOption('.source-column:nth-child(1) .target-field-dropdown', 'incident_id');      // Call Number
    await page.selectOption('.source-column:nth-child(3) .target-field-dropdown', 'incident_date');    // Incident Date
    await page.selectOption('.source-column:nth-child(4) .target-field-dropdown', 'incident_time');    // Incident Time
    await page.selectOption('.source-column:nth-child(2) .target-field-dropdown', 'unit_id');          // Unit Name
    
    // Generate formatted data
    await page.getByRole('button', { name: 'Generate Formatted Data' }).click();
    
    // Wait for preview
    await expect(page.getByText('Formatted Data Preview')).toBeVisible({ timeout: 5000 });
    
    // Transfer to Response Time Analyzer
    await page.getByRole('button', { name: 'Use in Response Time Analyzer' }).click();
    
    // Wait for Response Time Analyzer page to load
    await expect(page).toHaveURL(/.*\/fire-ems-dashboard/);
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify data was loaded correctly with proper field names
    // This checks the data table to ensure field names were correctly transformed
    await expect(page.locator('#data-table')).toBeVisible();
    await expect(page.locator('#data-table table thead')).toContainText('Incident ID');
    
    // Check console logs for field name transformation 
    // (this assumes there are console logs showing the field name transformation)
    const consoleLogs = await page.evaluate(() => {
      return JSON.stringify(
        window.sessionStorage.getItem('debug_fieldTransformation') || 
        window.localStorage.getItem('debug_fieldTransformation')
      );
    });
    
    // If debug storage is available, check it
    if (consoleLogs && consoleLogs !== 'null') {
      const logs = JSON.parse(JSON.parse(consoleLogs));
      expect(logs).toContain('Transformed "Incident ID" → "incidentId"');
    }
    
    // Verify report generation works with transformed data
    await page.getByRole('button', { name: 'Generate Report' }).click();
    await expect(page.locator('#report-section')).toBeVisible({ timeout: 5000 });
    
    // Verify key metrics are calculated and displayed (not "NA")
    await expect(page.locator('#avg-response-time')).not.toContainText('NA');
    await expect(page.locator('#median-response-time')).not.toContainText('NA');
  });

  test('should handle field name normalization in Response Time Analyzer', async ({ page }) => {
    // This test directly tests the Response Time Analyzer's ability to handle both formats
    
    // Navigate to Response Time Analyzer
    await page.goto('/fire-ems-dashboard');
    
    // Upload a file with space-formatted field names
    const filePath = path.join(__dirname, '../fixtures/space_formatted_fields.csv');
    await page.locator('#fileInput').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to appear
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify data was processed correctly despite space-formatted field names
    await expect(page.locator('#avg-response-time')).not.toContainText('NA');
    
    // Now test with camelCase formatted field names
    await page.goto('/fire-ems-dashboard');
    
    const camelCaseFilePath = path.join(__dirname, '../fixtures/camel_case_fields.csv');
    await page.locator('#fileInput').setInputFiles(camelCaseFilePath);
    await page.getByRole('button', { name: 'Upload & Analyze' }).click();
    
    // Wait for dashboard to appear
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verify data was processed correctly with camelCase field names
    await expect(page.locator('#avg-response-time')).not.toContainText('NA');
  });
});