const { test, expect } = require('@playwright/test');

test.describe('Security Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should prevent XSS in login form', async ({ page }) => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    // Attempt XSS in username field
    await page.getByLabel('Username').fill(xssPayload);
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Check if the script was executed by checking for alert dialog
    // If properly sanitized, no dialog should appear
    const hasDialog = await Promise.race([
      page.waitForEvent('dialog', { timeout: 3000 }).then(() => true).catch(() => false),
      new Promise(resolve => setTimeout(() => resolve(false), 3000))
    ]);
    
    expect(hasDialog).toBe(false);
  });
  
  test('should prevent access to protected routes without authentication', async ({ page }) => {
    // Try to access protected routes directly
    const protectedRoutes = [
      '/incident-logger',
      '/fire-ems-dashboard',
      '/call-density-heatmap',
      '/station-overview',
      '/fire-map-pro',
      '/data-formatter'
    ];
    
    for (const route of protectedRoutes) {
      // Navigate to protected route
      await page.goto(route);
      
      // Should be redirected to login page
      await expect(page).toHaveURL(/.*\/login/);
    }
  });
  
  test('should enforce authorization restrictions by user role', async ({ page }) => {
    // Login as readonly user
    await page.getByLabel('Username').fill('rural_readonly');
    await page.getByLabel('Password').fill('rural_readonly');
    
    // Select department if the field exists
    const departmentSelector = page.getByLabel('Department');
    if (await departmentSelector.isVisible()) {
      await departmentSelector.selectOption('rural');
    }
    
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Access Incident Logger
    await page.goto('/incident-logger');
    
    // Verify read-only user cannot access write functionality
    await expect(page.getByRole('button', { name: 'Add New Incident' })).not.toBeVisible();
    
    // Verify read-only elements are visible
    await expect(page.getByRole('heading', { name: 'Recent Incidents' })).toBeVisible();
  });
  
  test('should implement CSRF protection', async ({ page }) => {
    // Login first
    await page.getByLabel('Username').fill('rural_admin');
    await page.getByLabel('Password').fill('rural_admin');
    
    // Select department if the field exists
    const departmentSelector = page.getByLabel('Department');
    if (await departmentSelector.isVisible()) {
      await departmentSelector.selectOption('rural');
    }
    
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Go to a form page
    await page.goto('/incident-logger');
    await page.getByRole('button', { name: 'Add New Incident' }).click();
    
    // Check if form has CSRF token
    const csrfToken = await page.locator('input[name="csrf_token"]').isVisible();
    expect(csrfToken).toBe(true);
    
    // Verify form submission fails without valid CSRF token
    const csrfInput = await page.locator('input[name="csrf_token"]');
    await csrfInput.evaluate(node => node.value = 'invalid-token');
    
    // Fill required fields
    await page.getByLabel('Incident Type').selectOption('EMS');
    await page.getByLabel('Location').fill('123 Test St');
    
    // Try to submit form
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Should show error message about invalid CSRF token
    await expect(page.getByText(/CSRF token/i)).toBeVisible();
  });
  
  test('should implement rate limiting on login attempts', async ({ page }) => {
    // Try multiple failed login attempts
    for (let i = 0; i < 10; i++) {
      await page.getByLabel('Username').fill(`wrong_user_${i}`);
      await page.getByLabel('Password').fill('wrong_password');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait a bit between attempts
      await page.waitForTimeout(300);
    }
    
    // After multiple attempts, should see rate limiting message
    await expect(page.getByText(/too many login attempts/i)).toBeVisible();
  });
  
  test('should sanitize user input in incident logger', async ({ page }) => {
    // Login as admin
    await page.getByLabel('Username').fill('rural_admin');
    await page.getByLabel('Password').fill('rural_admin');
    
    // Select department if the field exists
    const departmentSelector = page.getByLabel('Department');
    if (await departmentSelector.isVisible()) {
      await departmentSelector.selectOption('rural');
    }
    
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Go to incident logger
    await page.goto('/incident-logger');
    await page.getByRole('button', { name: 'Add New Incident' }).click();
    
    // Try XSS in text fields
    const xssPayload = '<script>alert("XSS")</script>';
    await page.getByLabel('Location').fill(xssPayload);
    await page.getByLabel('Incident Type').selectOption('EMS');
    
    // Fill other required fields
    await page.getByLabel('Description').fill('Test incident');
    
    // Submit form
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Wait for incident to be added
    await expect(page.getByText('Incident added successfully')).toBeVisible();
    
    // Check if the XSS payload is properly escaped in the incident list
    const incidentElement = page.getByText(xssPayload);
    const innerHTML = await incidentElement.evaluate(node => node.innerHTML);
    
    // Should contain escaped HTML rather than executable script
    expect(innerHTML).not.toContain('<script>');
    expect(innerHTML).toContain('&lt;script&gt;');
  });
  
  test('should enforce secure password requirements', async ({ page }) => {
    // Go to change password page (if available)
    await page.goto('/login');
    
    // Click on forgot password or similar link
    await page.getByText(/forgot password/i).click();
    
    // Try setting a weak password
    await page.getByLabel('Username').fill('rural_admin');
    await page.getByLabel('New Password').fill('123');
    await page.getByLabel('Confirm Password').fill('123');
    await page.getByRole('button', { name: 'Reset Password' }).click();
    
    // Should see error about password strength
    await expect(page.getByText(/password.*too weak/i)).toBeVisible();
    
    // Try more secure password
    await page.getByLabel('New Password').fill('SecureP@ssw0rd123');
    await page.getByLabel('Confirm Password').fill('SecureP@ssw0rd123');
    await page.getByRole('button', { name: 'Reset Password' }).click();
    
    // Should see success message
    await expect(page.getByText(/password.*reset/i)).toBeVisible();
  });
  
  test('should secure session cookies', async ({ page, context }) => {
    // Login
    await page.getByLabel('Username').fill('rural_admin');
    await page.getByLabel('Password').fill('rural_admin');
    
    // Select department if the field exists
    const departmentSelector = page.getByLabel('Department');
    if (await departmentSelector.isVisible()) {
      await departmentSelector.selectOption('rural');
    }
    
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Get cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session');
    
    // Verify session cookie properties
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie.secure).toBe(true);
    expect(sessionCookie.httpOnly).toBe(true);
    expect(sessionCookie.sameSite).toBe('Lax');
  });
  
  test('should prevent directory traversal in file paths', async ({ page }) => {
    // Login as admin
    await page.getByLabel('Username').fill('rural_admin');
    await page.getByLabel('Password').fill('rural_admin');
    
    // Select department if the field exists
    const departmentSelector = page.getByLabel('Department');
    if (await departmentSelector.isVisible()) {
      await departmentSelector.selectOption('rural');
    }
    
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Try to access a file with directory traversal
    await page.goto('/static/../../../etc/passwd');
    
    // Should not reveal sensitive files
    await expect(page.getByText(/root:x:/)).not.toBeVisible();
    
    // Should show error or not found page
    await expect(page.getByText(/not found|forbidden|error/i)).toBeVisible();
  });
  
  test('should prevent SQL injection in search fields', async ({ page }) => {
    // Login as admin
    await page.getByLabel('Username').fill('rural_admin');
    await page.getByLabel('Password').fill('rural_admin');
    
    // Select department if the field exists
    const departmentSelector = page.getByLabel('Department');
    if (await departmentSelector.isVisible()) {
      await departmentSelector.selectOption('rural');
    }
    
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Go to incident logger or search page
    await page.goto('/incident-logger');
    
    // Try SQL injection in search field
    const sqlInjectionPayload = "' OR '1'='1";
    await page.getByPlaceholder('Search incidents...').fill(sqlInjectionPayload);
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Should not show all records (which would happen if injection succeeded)
    // This is a basic check - we can't fully validate this without knowing
    // how many records should be shown
    const resultsCount = await page.locator('.incident-item').count();
    expect(resultsCount).toBeLessThan(100); // Arbitrary high number
  });
});