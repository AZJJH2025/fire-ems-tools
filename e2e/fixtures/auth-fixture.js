const { test: base } = require('@playwright/test');
const { login, logout } = require('../utils/auth');

/**
 * Test fixture for authenticated sessions
 */
exports.test = base.extend({
  // Define a fixture for an authenticated page
  authenticatedPage: async ({ page }, use) => {
    // Login before each test
    await login(page, 'rural_admin', 'rural_admin', 'rural');
    
    // Use the authenticated page
    await use(page);
    
    // Logout after each test
    await logout(page);
  },

  // Define a fixture for admin user
  adminPage: async ({ page }, use) => {
    // Login as admin
    await login(page, 'admin', 'admin123');
    
    // Use the admin page
    await use(page);
    
    // Logout after each test
    await logout(page);
  },

  // Define a fixture for readonly user
  readonlyPage: async ({ page }, use) => {
    // Login as readonly user
    await login(page, 'rural_readonly', 'rural_readonly', 'rural');
    
    // Use the readonly page
    await use(page);
    
    // Logout after each test
    await logout(page);
  }
});