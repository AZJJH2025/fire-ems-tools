/**
 * Authentication utilities for end-to-end tests
 */

/**
 * Login to the application
 * @param {import('@playwright/test').Page} page 
 * @param {string} username 
 * @param {string} password 
 * @param {string} departmentCode 
 */
async function login(page, username, password, departmentCode) {
  await page.goto('/login');
  
  // Fill in login form
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  
  // Select department if it exists
  const departmentSelector = page.getByLabel('Department');
  if (await departmentSelector.isVisible() && departmentCode) {
    await departmentSelector.selectOption(departmentCode);
  }
  
  // Click login button
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Wait for login to complete
  await page.waitForURL('**/dashboard');
}

/**
 * Logout from the application
 * @param {import('@playwright/test').Page} page 
 */
async function logout(page) {
  // Click user menu if it exists
  const userMenu = page.getByRole('button', { name: 'User Menu' });
  if (await userMenu.isVisible()) {
    await userMenu.click();
    await page.getByRole('link', { name: 'Logout' }).click();
  } else {
    // Fallback to direct logout URL
    await page.goto('/logout');
  }
  
  // Wait for logout to complete
  await page.waitForURL('**/login');
}

/**
 * Navigate to a feature
 * @param {import('@playwright/test').Page} page 
 * @param {string} featureName 
 */
async function navigateToFeature(page, featureName) {
  // Map of feature names to URLs
  const featureUrls = {
    'incident-logger': '/incident-logger',
    'call-density': '/call-density-heatmap',
    'isochrone-map': '/isochrone-map',
    'response-time': '/fire-ems-dashboard',
    'station-overview': '/station-overview',
    'fire-map-pro': '/fire-map-pro',
    'data-formatter': '/data-formatter'
  };
  
  // Navigate to feature
  const url = featureUrls[featureName.toLowerCase()];
  if (!url) {
    throw new Error(`Unknown feature: ${featureName}`);
  }
  
  await page.goto(url);
  
  // Verify we landed on the right page
  await page.waitForURL(`**${url}`);
}

module.exports = {
  login,
  logout,
  navigateToFeature
};