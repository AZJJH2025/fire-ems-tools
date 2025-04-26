#!/usr/bin/env python
"""
Run tests for the blueprint routes.

This script runs all the tests for the blueprint routes or a specific blueprint.

Usage:
    python tests/routes/run_blueprint_tests.py                # Run all blueprint tests
    python tests/routes/run_blueprint_tests.py main           # Run only main blueprint tests
    python tests/routes/run_blueprint_tests.py auth           # Run only auth blueprint tests
    python tests/routes/run_blueprint_tests.py api            # Run only API blueprint tests
    python tests/routes/run_blueprint_tests.py dashboards     # Run only dashboards blueprint tests
    python tests/routes/run_blueprint_tests.py tools          # Run only tools blueprint tests
"""

import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

def run_tests(blueprint=None):
    """Run tests for the specified blueprint or all blueprints."""
    # Determine which test modules to run
    if blueprint == 'main':
        from tests.routes.test_main_routes import TestMainRoutes
        suite = unittest.TestLoader().loadTestsFromTestCase(TestMainRoutes)
    elif blueprint == 'auth':
        from tests.routes.test_auth_routes import TestAuthRoutes
        suite = unittest.TestLoader().loadTestsFromTestCase(TestAuthRoutes)
    elif blueprint == 'api':
        from tests.routes.test_api_routes import TestApiRoutes
        suite = unittest.TestLoader().loadTestsFromTestCase(TestApiRoutes)
    elif blueprint == 'dashboards':
        from tests.routes.test_dashboards_routes import TestDashboardsRoutes
        suite = unittest.TestLoader().loadTestsFromTestCase(TestDashboardsRoutes)
    elif blueprint == 'tools':
        from tests.routes.test_tools_routes import TestToolsRoutes
        suite = unittest.TestLoader().loadTestsFromTestCase(TestToolsRoutes)
    else:
        # Run all blueprint tests
        suite = unittest.defaultTestLoader.discover(
            start_dir=os.path.dirname(os.path.abspath(__file__)),
            pattern='test_*.py'
        )
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return appropriate exit code
    return 0 if result.wasSuccessful() else 1

if __name__ == '__main__':
    # Get the blueprint to test from command line arguments
    blueprint = sys.argv[1] if len(sys.argv) > 1 else None
    
    # Run the tests
    exit_code = run_tests(blueprint)
    
    # Exit with the appropriate code
    sys.exit(exit_code)