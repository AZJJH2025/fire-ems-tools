#!/usr/bin/env python
"""
Test runner for the Fire-EMS Tools application.

This script discovers and runs all test cases for the application,
with options to filter by department type or feature.

Usage:
    python run_all_tests.py                       # Run all tests
    python run_all_tests.py --department=rural    # Run tests for rural department only
    python run_all_tests.py --feature=incident_logger  # Run tests for the Incident Logger feature only
    python run_all_tests.py --verbose             # Run with verbose output
    python run_all_tests.py --failfast            # Stop on first failure
    python run_all_tests.py --performance         # Run performance tests
    python run_all_tests.py --error-tests         # Run error condition tests
    python run_all_tests.py --boundary-tests      # Run boundary condition tests
    python run_all_tests.py --mock                # Use mock services for tests
    python run_all_tests.py --report=html         # Generate HTML test report
"""

import unittest
import argparse
import sys
import logging
import os
import importlib
import datetime
from io import BytesIO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Feature to test file mapping
FEATURE_TEST_FILES = {
    # Original test files (may have issues with current environment)
    'incident_logger': 'test_incident_logger',
    'call_density': 'test_call_density',
    'isochrone_map': 'test_isochrone_map',
    'response_time': 'test_response_time',
    'station_overview': 'test_station_overview',
    'fire_map_pro': 'test_fire_map_pro',
    'data_formatter': 'test_data_formatter',
    'performance': 'test_performance',
    'mocks': 'test_mocks',
    
    # Error and boundary test files (working)
    'error_conditions': 'test_error_conditions',
    'api_errors': 'test_api_errors',
    'boundary_conditions': 'test_boundary_conditions',
    
    # Simplified test files (working)
    'departments_simplified': 'test_departments_simplified',
    'incident_logger_simplified': 'test_incident_logger_simplified',
    'call_density_simplified': 'test_call_density_simplified',
    'isochrone_map_simplified': 'test_isochrone_map_simplified',
    'response_time_simplified': 'test_response_time_simplified',
    'station_overview_simplified': 'test_station_overview_simplified',
    'fire_map_pro_simplified': 'test_fire_map_pro_simplified',
    'data_formatter_simplified': 'test_data_formatter_simplified',
    
    # Blueprint route tests (new)
    'routes': 'tests.routes',
    'main_routes': 'tests.routes.test_main_routes',
    'auth_routes': 'tests.routes.test_auth_routes',
    'api_routes': 'tests.routes.test_api_routes',
    'dashboards_routes': 'tests.routes.test_dashboards_routes',
    'tools_routes': 'tests.routes.test_tools_routes'
}

def discover_tests(department=None, feature=None, verbose=False, failfast=False):
    """
    Discover and load test cases based on filters.
    
    Args:
        department (str, optional): Department code to filter tests by.
        feature (str, optional): Feature name to filter tests by.
        verbose (bool, optional): Whether to run tests in verbose mode.
        failfast (bool, optional): Whether to stop on first failure.
        
    Returns:
        unittest.TestSuite: Suite of tests to run.
    """
    if feature and feature in FEATURE_TEST_FILES:
        # Load specific feature tests
        test_module_name = FEATURE_TEST_FILES[feature]
        logger.info(f"Loading tests for {feature} feature from {test_module_name}")
        
        try:
            # Import the module dynamically
            logger.info(f"Attempting to import {test_module_name}")
            module = importlib.import_module(test_module_name)
            logger.info(f"Successfully imported {test_module_name}")
            
            loader = unittest.TestLoader()
            suite = loader.loadTestsFromModule(module)
            logger.info(f"Loaded {suite.countTestCases()} tests from {test_module_name}")
            
            # Filter by department if specified
            if department:
                filtered_suite = unittest.TestSuite()
                for test in suite:
                    for test_case in test:
                        # Set the department filter on the test case instance
                        test_case.setDepartmentFilter(department)
                        filtered_suite.addTest(test_case)
                return filtered_suite
            return suite
        except ImportError as e:
            logger.error(f"Error importing module for feature {feature}: {str(e)}")
            return unittest.TestSuite()
        except Exception as e:
            logger.error(f"Error loading tests for feature {feature}: {str(e)}")
            return unittest.TestSuite()
    else:
        # Load all test modules
        logger.info("Discovering all tests...")
        start_dir = os.path.dirname(os.path.abspath(__file__))
        loader = unittest.TestLoader()
        suite = loader.discover(start_dir, pattern='test_*.py')
        
        # Filter by department if specified
        if department:
            filtered_suite = unittest.TestSuite()
            for test in suite:
                for test_case in test:
                    # Set the department filter if the test case supports it
                    if hasattr(test_case, 'setDepartmentFilter'):
                        test_case.setDepartmentFilter(department)
                    filtered_suite.addTest(test_case)
            return filtered_suite
        return suite

def run_tests(suite, verbose=False, failfast=False):
    """
    Run the test suite with specified options.
    
    Args:
        suite (unittest.TestSuite): The test suite to run.
        verbose (bool, optional): Whether to run tests in verbose mode.
        failfast (bool, optional): Whether to stop on first failure.
        
    Returns:
        unittest.TestResult: Results of the test run.
    """
    # Create a test runner
    runner = unittest.TextTestRunner(
        verbosity=2 if verbose else 1,
        failfast=failfast
    )
    
    # Run the tests
    logger.info("Starting test run...")
    result = runner.run(suite)
    logger.info(f"Test run complete. Ran {result.testsRun} tests.")
    logger.info(f"Results: {result.errors} errors, {result.failures} failures, {result.skipped} skipped")
    
    return result

def main():
    """Main entry point for the test runner."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Run tests for Fire-EMS Tools')
    parser.add_argument('--department', help='Department code to test (rural, suburban, urban, combined)')
    parser.add_argument('--feature', help='Specific feature to test (e.g., incident_logger, call_density)')
    parser.add_argument('--verbose', action='store_true', help='Run tests with verbose output')
    parser.add_argument('--failfast', action='store_true', help='Stop on first failure')
    parser.add_argument('--performance', action='store_true', help='Run performance tests')
    parser.add_argument('--mock', action='store_true', help='Use mock services for all tests')
    parser.add_argument('--error-tests', action='store_true', help='Run error condition tests')
    parser.add_argument('--boundary-tests', action='store_true', help='Run boundary condition tests')
    parser.add_argument('--simplified', action='store_true', help='Run simplified tests that work with the current environment')
    parser.add_argument('--report', help='Generate a test report in specified format (html, xml, json)')
    args = parser.parse_args()
    
    # Log the test configuration
    logger.info("Starting the Fire-EMS Tools test runner")
    if args.department:
        logger.info(f"Filtering tests for department: {args.department}")
    if args.feature:
        logger.info(f"Filtering tests for feature: {args.feature}")
    if args.performance:
        logger.info("Running performance tests")
        args.feature = 'performance'
    if args.error_tests:
        logger.info("Running error condition tests")
        args.feature = 'error_conditions'
    if args.boundary_tests:
        logger.info("Running boundary condition tests")
        args.feature = 'boundary_conditions'
    if args.simplified:
        logger.info("Running simplified tests")
        features = [
            'departments_simplified',
            'incident_logger_simplified',
            'call_density_simplified',
            'isochrone_map_simplified',
            'response_time_simplified',
            'station_overview_simplified',
            'fire_map_pro_simplified',
            'data_formatter_simplified'
        ]
        # Run each simplified test module 
        if not args.feature:
            # Create a combined TestSuite for all simplified tests
            combined_suite = unittest.TestSuite()
            for feature in features:
                logger.info(f"Loading simplified tests for {feature}")
                try:
                    test_module_name = FEATURE_TEST_FILES[feature]
                    module = importlib.import_module(test_module_name)
                    suite = unittest.TestLoader().loadTestsFromModule(module)
                    combined_suite.addTest(suite)
                    logger.info(f"Added {suite.countTestCases()} tests from {test_module_name}")
                except ImportError as e:
                    logger.error(f"Error importing {test_module_name}: {e}")
            
            # Return the combined suite
            return combined_suite
            
            # Original approach - only run first test in the list
            #args.feature = features[0]
            #args.simplified_features = features
    if args.mock:
        logger.info("Using mock services for all tests")
        # Import mocks and apply them globally
        try:
            from test_mocks import apply_service_mocks
            global_mocks = apply_service_mocks()
            logger.info("Mock services applied successfully")
        except Exception as e:
            logger.error(f"Failed to apply mock services: {e}")
    
    # Discover and run tests
    suite = discover_tests(
        department=args.department, 
        feature=args.feature,
        verbose=args.verbose,
        failfast=args.failfast
    )
    
    result = run_tests(suite, verbose=args.verbose, failfast=args.failfast)
    
    # Generate test report if requested
    if args.report:
        try:
            report_format = args.report.lower()
            report_file = f"test_report.{report_format}"
            
            if report_format == 'html':
                import unittest.runner as unittest_runner
                with open(report_file, 'w') as f:
                    runner = unittest_runner.HTMLTestRunner(
                        stream=f,
                        title='Fire-EMS Tools Test Report',
                        description='Test results for the Fire-EMS Tools application'
                    )
                    runner.run(suite)
                logger.info(f"HTML test report generated: {report_file}")
                
            elif report_format == 'xml':
                import xmlrunner
                with open(report_file, 'wb') as f:
                    xmlrunner.XMLTestRunner(output=f).run(suite)
                logger.info(f"XML test report generated: {report_file}")
                
            elif report_format == 'json':
                import json
                # Create a simple JSON report from the test result
                report = {
                    'total': result.testsRun,
                    'errors': len(result.errors),
                    'failures': len(result.failures),
                    'skipped': len(result.skipped),
                    'successful': result.wasSuccessful(),
                    'timestamp': datetime.datetime.now().isoformat(),
                    'details': {
                        'errors': [str(error) for error in result.errors],
                        'failures': [str(failure) for failure in result.failures],
                        'skipped': [str(skipped) for skipped in result.skipped]
                    }
                }
                with open(report_file, 'w') as f:
                    json.dump(report, f, indent=2)
                logger.info(f"JSON test report generated: {report_file}")
            
            else:
                logger.warning(f"Unsupported report format: {report_format}")
        except Exception as e:
            logger.error(f"Failed to generate test report: {e}")
    
    # Clean up mocks if applied
    if args.mock and 'global_mocks' in locals():
        try:
            from test_mocks import remove_service_mocks
            remove_service_mocks(global_mocks)
            logger.info("Mock services removed successfully")
        except Exception as e:
            logger.error(f"Failed to remove mock services: {e}")
    
    # Set exit code based on test success
    sys.exit(0 if result.wasSuccessful() else 1)

if __name__ == '__main__':
    main()