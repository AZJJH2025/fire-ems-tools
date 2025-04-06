const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    
    // Verify login page elements
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form
    await page.getByLabel('Username').fill('rural_admin');
    await page.getByLabel('Password').fill('rural_admin');
    
    // Select department if the field exists
    const departmentSelector = page.getByLabel('Department');
    if (await departmentSelector.isVisible()) {
      await departmentSelector.selectOption('rural');
    }
    
    // Click login button
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify successful login
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByText('Welcome')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form with invalid credentials
    await page.getByLabel('Username').fill('invalid_user');
    await page.getByLabel('Password').fill('invalid_password');
    
    // Click login button
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify error message
    await expect(page.getByText('Invalid username or password')).toBeVisible();
    
    // Verify we're still on the login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect to login page for protected routes', async ({ page }) => {
    // Try to access a protected page directly
    await page.goto('/incident-logger');
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Login first
    await page.getByLabel('Username').fill('rural_admin');
    await page.getByLabel('Password').fill('rural_admin');
    
    // Select department if the field exists
    const departmentSelector = page.getByLabel('Department');
    if (await departmentSelector.isVisible()) {
      await departmentSelector.selectOption('rural');
    }
    
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify successful login
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Logout
    await page.getByRole('link', { name: 'Logout' }).click();
    
    // Verify logout - back to login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Verify can't access protected routes anymore
    await page.goto('/incident-logger');
    await expect(page).toHaveURL(/.*\/login/);
  });
});