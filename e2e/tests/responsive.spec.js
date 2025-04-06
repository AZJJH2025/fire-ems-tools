const { test, expect } = require('@playwright/test');

// Define device configurations
const devices = [
  {
    name: 'Mobile (iPhone SE)',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  },
  {
    name: 'Tablet (iPad)',
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  },
  {
    name: 'Small Desktop',
    viewport: { width: 1024, height: 768 }
  },
  {
    name: 'Large Desktop',
    viewport: { width: 1920, height: 1080 }
  }
];

test.describe('Responsive Design Testing', () => {
  for (const device of devices) {
    test.describe(`Device: ${device.name}`, () => {
      test.use({
        viewport: device.viewport,
        userAgent: device.userAgent,
        deviceScaleFactor: device.deviceScaleFactor,
        isMobile: device.isMobile,
        hasTouch: device.hasTouch
      });

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

      test('Home page should be responsive', async ({ page }) => {
        await page.goto('/');
        
        // Check if the page loaded
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        
        // Verify the navigation is appropriate for device size
        if (device.viewport.width < 768) {
          // On mobile, navigation should either be collapsed or adapted
          // Test for a mobile menu button
          const hasMobileMenu = await page.locator('.mobile-menu-button, .navbar-toggler, .hamburger-menu').isVisible();
          
          if (hasMobileMenu) {
            // Click the mobile menu button if it exists
            await page.locator('.mobile-menu-button, .navbar-toggler, .hamburger-menu').first().click();
            // Check that menu items are now visible
            await expect(page.locator('.nav-links a, .navbar-nav a').first()).toBeVisible();
          } else {
            // If no mobile menu button, the navigation should still be usable - verify it fits
            const navElement = page.locator('.navbar, nav').first();
            const navBounds = await navElement.boundingBox();
            expect(navBounds.width).toBeLessThanOrEqual(device.viewport.width);
          }
        } else {
          // On desktop, navigation should be expanded
          await expect(page.locator('.nav-links a, .navbar-nav a').first()).toBeVisible();
        }
        
        // Take a screenshot for visual verification
        await page.screenshot({ path: `responsive-home-${device.name.replace(/\s+/g, '-').toLowerCase()}.png` });
      });

      test('Incident Logger should adapt to screen size', async ({ page }) => {
        await page.goto('/incident-logger');
        
        // Check if the page loaded
        await expect(page.getByText(/Incident Logger|Recent Incidents/i)).toBeVisible();
        
        // Test responsive behavior of incident list
        const incidentList = page.locator('.incident-list, .incidents-container, table');
        if (await incidentList.isVisible()) {
          const listBounds = await incidentList.boundingBox();
          expect(listBounds.width).toBeLessThanOrEqual(device.viewport.width);
        }
        
        // Check the Add Incident button
        const addButton = page.getByRole('button', { name: /Add|Create|New/ });
        await expect(addButton).toBeVisible();
        
        // Open the form and check responsiveness
        await addButton.click();
        
        // Wait for form to be visible
        await expect(page.locator('form')).toBeVisible();
        
        // Make sure form fits within viewport
        const form = page.locator('form').first();
        const formBounds = await form.boundingBox();
        expect(formBounds.width).toBeLessThanOrEqual(device.viewport.width);
        
        // Take a screenshot for visual verification
        await page.screenshot({ path: `responsive-incident-logger-${device.name.replace(/\s+/g, '-').toLowerCase()}.png` });
      });

      test('Call Density Heatmap should be responsive', async ({ page }) => {
        await page.goto('/call-density-heatmap');
        
        // Check if the page loaded
        await expect(page.getByText(/Call Density|Heatmap|Density Map/i)).toBeVisible();
        
        // Check map container is responsive
        const mapContainer = page.locator('#map-container, .map-container, .leaflet-container').first();
        await expect(mapContainer).toBeVisible();
        
        const mapBounds = await mapContainer.boundingBox();
        expect(mapBounds.width).toBeLessThanOrEqual(device.viewport.width);
        
        // Check controls are accessible on mobile
        if (device.viewport.width < 768) {
          // Controls should either be stacked or in a collapsible panel
          const controls = page.locator('.controls, .control-panel, .filter-controls').first();
          if (await controls.isVisible()) {
            const controlBounds = await controls.boundingBox();
            expect(controlBounds.width).toBeLessThanOrEqual(device.viewport.width);
          }
        }
        
        // Take a screenshot for visual verification
        await page.screenshot({ path: `responsive-call-density-${device.name.replace(/\s+/g, '-').toLowerCase()}.png` });
      });

      test('Station Overview should adapt to screen size', async ({ page }) => {
        await page.goto('/station-overview');
        
        // Check if the page loaded
        await expect(page.getByText(/Station Overview|Dashboard/i)).toBeVisible();
        
        // Check KPI cards layout
        const kpiContainer = page.locator('.kpi-container, .dashboard-cards, .metrics-cards').first();
        if (await kpiContainer.isVisible()) {
          const kpiCards = page.locator('.kpi-card, .metric-card, .dashboard-card');
          const cardCount = await kpiCards.count();
          
          // Check arrangement of cards based on screen size
          if (device.viewport.width < 768) {
            // On mobile, cards should be stacked or in a grid with fewer columns
            for (let i = 0; i < Math.min(cardCount, 2); i++) {
              const card = kpiCards.nth(i);
              const cardBounds = await card.boundingBox();
              expect(cardBounds.width).toBeLessThanOrEqual(device.viewport.width);
            }
          }
        }
        
        // Take a screenshot for visual verification
        await page.screenshot({ path: `responsive-station-overview-${device.name.replace(/\s+/g, '-').toLowerCase()}.png` });
      });

      test('Fire Map Pro should be responsive', async ({ page }) => {
        await page.goto('/fire-map-pro');
        
        // Check if the page loaded
        await expect(page.getByText(/Fire Map Pro|Map|FireMapPro/i)).toBeVisible();
        
        // Check map container is responsive
        const mapContainer = page.locator('.leaflet-container, #map-container, .map-view').first();
        await expect(mapContainer).toBeVisible();
        
        // Check if tools panel adapts to screen size
        const toolsPanel = page.locator('.tools-panel, .sidebar, .control-panel').first();
        if (await toolsPanel.isVisible()) {
          // On mobile, panel should be collapsible or moved
          if (device.viewport.width < 768) {
            const collapsedPanel = page.locator('.collapsed-panel, .mobile-controls, .tools-toggle').first();
            if (await collapsedPanel.isVisible()) {
              // Click to expand
              await collapsedPanel.click();
              // Check that expanded panel appears
              await expect(page.locator('.expanded-panel, .tools-expanded, .sidebar-expanded').first()).toBeVisible();
            }
          }
        }
        
        // Take a screenshot for visual verification
        await page.screenshot({ path: `responsive-fire-map-pro-${device.name.replace(/\s+/g, '-').toLowerCase()}.png` });
      });

      test('Data Formatter should be usable on mobile', async ({ page }) => {
        await page.goto('/data-formatter');
        
        // Check if the page loaded
        await expect(page.getByText(/Data Formatter|Format Data/i)).toBeVisible();
        
        // Check file upload component is accessible
        const fileInput = page.locator('input[type="file"]');
        await expect(fileInput).toBeVisible();
        
        // Check tool selector is usable on mobile
        const toolSelector = page.locator('#tool-selector, select');
        if (await toolSelector.isVisible()) {
          await toolSelector.selectOption({ index: 0 });
          // Selects should be fully accessible on mobile
          const selectorBounds = await toolSelector.boundingBox();
          expect(selectorBounds.width).toBeLessThanOrEqual(device.viewport.width);
        }
        
        // Take a screenshot for visual verification
        await page.screenshot({ path: `responsive-data-formatter-${device.name.replace(/\s+/g, '-').toLowerCase()}.png` });
      });

      test('Response Time Analyzer should be responsive', async ({ page }) => {
        await page.goto('/fire-ems-dashboard');
        
        // Check if the page loaded
        await expect(page.getByText(/Response Time|Analyzer|Dashboard/i)).toBeVisible();
        
        // Verify upload component is accessible
        const uploadComponent = page.locator('.file-upload-container, .upload-section');
        await expect(uploadComponent).toBeVisible();
        
        const uploadBounds = await uploadComponent.boundingBox();
        expect(uploadBounds.width).toBeLessThanOrEqual(device.viewport.width);
        
        // Take a screenshot for visual verification
        await page.screenshot({ path: `responsive-response-time-${device.name.replace(/\s+/g, '-').toLowerCase()}.png` });
      });
      
      // Test responsive behavior when resizing window
      if (device.name === 'Small Desktop') {
        test('UI should adapt when resizing window', async ({ page }) => {
          await page.goto('/');
          
          // Initial state
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          await page.screenshot({ path: `responsive-resize-before.png` });
          
          // Resize to mobile dimensions
          await page.setViewportSize({ width: 375, height: 667 });
          
          // Wait for layout to adjust
          await page.waitForTimeout(500);
          
          // Check mobile layout
          const hasMobileMenu = await page.locator('.mobile-menu-button, .navbar-toggler, .hamburger-menu').isVisible();
          expect(hasMobileMenu).toBeTruthy();
          
          await page.screenshot({ path: `responsive-resize-after.png` });
        });
      }
    });
  }
});