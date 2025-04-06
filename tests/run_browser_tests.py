#!/usr/bin/env python3
"""
Run browser compatibility tests for the Fire-EMS Tools application.

This script runs browser-based tests that will catch issues like
JavaScript module loading errors that don't appear in backend tests.

Usage:
    python run_browser_tests.py [url]

Arguments:
    url  - The base URL to test against (default: http://localhost:5000)
"""

import os
import sys
import unittest
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_browser_tests(url=None):
    """Run browser compatibility tests."""
    logger.info("Starting browser compatibility tests")
    
    # Import the test module
    from integration.test_browser_compatibility import BrowserCompatibilityTests
    
    # Set the base URL if provided
    if url:
        BrowserCompatibilityTests.base_url = url
        logger.info(f"Testing against URL: {url}")
    
    # Create a test suite with browser tests
    suite = unittest.TestLoader().loadTestsFromTestCase(BrowserCompatibilityTests)
    
    # Run the tests
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    
    # Return the result
    return result.wasSuccessful()

if __name__ == "__main__":
    # Check if a URL was provided
    url = None
    if len(sys.argv) > 1:
        url = sys.argv[1]
    
    # Run the tests
    success = run_browser_tests(url)
    
    # Exit with appropriate status code
    sys.exit(0 if success else 1)