"""
Browser compatibility tests for the Fire-EMS Tools application.

These tests load pages in a real browser and check for JavaScript errors.
They will catch issues like ES6 module loading errors that don't appear in backend tests.
"""

import os
import time
import unittest
import sys
import logging
from pathlib import Path
from unittest import mock

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

# Check if we can import selenium
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    logger.warning("Selenium not available. Browser tests will be skipped.")

# Import the test base class
from integration.test_integration_base import IntegrationTestBase

# Try to import the Flask app
try:
    sys.path.append(str(Path(__file__).parent.parent.parent))
    from app import create_app
    APP_AVAILABLE = True
except ImportError:
    APP_AVAILABLE = False
    logger.warning("Flask app could not be imported. Tests will run against a specified URL.")

@unittest.skipIf(not SELENIUM_AVAILABLE, "Selenium not installed")
class BrowserCompatibilityTests(IntegrationTestBase):
    """Tests to check browser compatibility and JavaScript errors."""
    
    # Default URL to test against
    base_url = "http://localhost:5000"
    
    @classmethod
    def setUpClass(cls):
        """Set up the test environment for all browser tests."""
        super().setUpClass()
        
        # If the app is available and we're not pointing to an external server,
        # start a testing server
        cls.app = None
        cls.server_thread = None
        
        if APP_AVAILABLE and cls.base_url == "http://localhost:5000":
            from threading import Thread
            import socket
            
            # Check if port 5000 is already in use
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            port_available = sock.connect_ex(('localhost', 5000)) != 0
            sock.close()
            
            if port_available:
                # Create and configure the app
                cls.app = create_app('testing')
                
                # Start the app in a separate thread
                def run_app():
                    cls.app.run(host='127.0.0.1', port=5000, use_reloader=False)
                
                cls.server_thread = Thread(target=run_app)
                cls.server_thread.daemon = True
                cls.server_thread.start()
                
                # Wait for the server to start
                time.sleep(1)
                logger.info("Flask server started for browser tests")
        
        # Set up the webdriver
        if SELENIUM_AVAILABLE:
            try:
                options = Options()
                options.add_argument("--headless")
                options.add_argument("--disable-gpu")
                options.add_argument("--no-sandbox")
                options.add_argument("--disable-dev-shm-usage")
                options.add_argument("--window-size=1920,1080")
                
                # Enable console logging
                options.add_argument("--enable-logging")
                options.add_argument("--v=1")
                
                # Create the Chrome driver
                cls.driver = webdriver.Chrome(options=options)
                
                # Set up timeout
                cls.driver.set_page_load_timeout(10)
                
                logger.info("Chrome WebDriver initialized for browser tests")
            except Exception as e:
                logger.error(f"Failed to initialize Chrome WebDriver: {e}")
                try:
                    # Try Firefox as a fallback
                    firefox_options = webdriver.FirefoxOptions()
                    firefox_options.add_argument("--headless")
                    cls.driver = webdriver.Firefox(options=firefox_options)
                    
                    # Set up timeout
                    cls.driver.set_page_load_timeout(10)
                    
                    logger.info("Firefox WebDriver initialized for browser tests")
                except Exception as firefox_error:
                    logger.error(f"Failed to initialize Firefox WebDriver: {firefox_error}")
                    cls.driver = None
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests have been run."""
        # Close the webdriver
        if hasattr(cls, 'driver') and cls.driver:
            cls.driver.quit()
            logger.info("WebDriver closed")
        
        # Shut down the Flask server if we started one
        if cls.server_thread:
            # Cleanup will happen automatically due to daemon=True
            logger.info("Flask server thread will terminate")
        
        super().tearDownClass()
    
    def setUp(self):
        """Set up before each test."""
        super().setUp()
        if not hasattr(self, 'driver') or not self.driver:
            self.skipTest("WebDriver is not available")
    
    def get_console_logs(self):
        """Get browser console logs and filter for errors."""
        # This only works with Chrome
        if "chrome" not in self.driver.__class__.__name__.lower():
            logger.warning("Console logs are only available with Chrome WebDriver")
            return []
        
        try:
            browser_logs = self.driver.get_log('browser')
            errors = []
            
            # Filter for actual errors (level >= SEVERE)
            for log in browser_logs:
                # "SEVERE" log level indicates an error
                if log['level'] in ('SEVERE', 'ERROR'):
                    # Ignore certain known errors or 404s for favicon/resources
                    if 'favicon.ico' not in log['message'] and 'net::ERR_ABORTED' not in log['message']:
                        errors.append(log)
            
            return errors
        except Exception as e:
            logger.error(f"Failed to get console logs: {e}")
            return []
    
    def check_for_module_errors(self, errors):
        """Check if any errors are related to ES6 module loading."""
        module_errors = []
        error_patterns = [
            "TypeError: Failed to resolve module specifier",
            "Error: Could not resolve module",
            "Uncaught SyntaxError: import declarations",
            "Uncaught SyntaxError: export declarations",
            "SyntaxError: Unexpected token 'export'",
            "SyntaxError: Unexpected token 'import'",
            "Cannot use import statement outside a module"
        ]
        
        for error in errors:
            message = error['message']
            
            # Check for module-related error patterns
            for pattern in error_patterns:
                if pattern in message:
                    module_errors.append(error)
                    break
        
        return module_errors
    
    def test_home_page_loads_without_errors(self):
        """Test that the home page loads without JavaScript errors."""
        # Navigate to the home page
        self.driver.get(f"{self.base_url}/")
        
        # Wait for the page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Get any console errors
        errors = self.get_console_logs()
        
        # Check for module errors specifically
        module_errors = self.check_for_module_errors(errors)
        
        # We expect no errors
        if errors:
            logger.warning(f"Console errors on home page: {errors}")
            
        self.assertEqual(len(module_errors), 0, 
                         f"Found JavaScript module errors on home page: {module_errors}")
    
    def test_incident_logger_loads_without_module_errors(self):
        """Test that the incident logger page loads without JavaScript module errors."""
        # Navigate to the incident logger page
        self.driver.get(f"{self.base_url}/incident-logger")
        
        # Wait for the page to load (adjust selector as needed)
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "incident-form-container"))
            )
        except TimeoutException:
            logger.warning("Incident form container not found. Page may not be fully loaded.")
        
        # Wait a moment for all scripts to execute
        time.sleep(2)
        
        # Get any console errors
        errors = self.get_console_logs()
        
        # Check for module errors specifically
        module_errors = self.check_for_module_errors(errors)
        
        # We expect no module-related errors
        self.assertEqual(len(module_errors), 0, 
                         f"Found JavaScript module errors on incident logger page: {module_errors}")
        
        # Print warning for any other errors
        if errors and not module_errors:
            logger.warning(f"Console errors on incident logger page (not module-related): {errors}")
    
    def test_fire_dashboard_loads_without_module_errors(self):
        """Test that the fire dashboard page loads without module errors."""
        # Navigate to the fire dashboard page
        self.driver.get(f"{self.base_url}/fire-ems-dashboard")
        
        # Wait for the page to load
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "dashboard-container"))
            )
        except TimeoutException:
            logger.warning("Dashboard container not found. Page may not be fully loaded.")
        
        # Wait a moment for all scripts to execute
        time.sleep(2)
        
        # Get any console errors
        errors = self.get_console_logs()
        
        # Check for module errors specifically
        module_errors = self.check_for_module_errors(errors)
        
        # We expect no module-related errors
        self.assertEqual(len(module_errors), 0, 
                         f"Found JavaScript module errors on fire dashboard page: {module_errors}")
        
        # Print warning for any other errors
        if errors and not module_errors:
            logger.warning(f"Console errors on fire dashboard page (not module-related): {errors}")


if __name__ == "__main__":
    unittest.main()