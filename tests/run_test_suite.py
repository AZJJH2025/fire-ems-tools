#!/usr/bin/env python3
"""
Test Suite Runner

A script to run the test suite for the Fire-EMS Tools application.
"""

import argparse
import os
import sys
import unittest
import time
import json
from pathlib import Path
import subprocess


def setup_test_data(test_type):
    """Set up test data for running tests."""
    # Import test data manager
    sys.path.append(str(Path(__file__).parent))
    from utilities.test_data_manager import data_manager
    from data_generators.generate_test_data import generate_standard_test_fixtures
    
    # Generate standard test fixtures if they don't exist
    fixtures_dir = Path(__file__).parent / "fixtures"
    if not fixtures_dir.exists() or not list(fixtures_dir.glob("*.json")):
        print("Generating standard test fixtures...")
        generate_standard_test_fixtures()
    
    # Set the appropriate fixture for the test type
    fixture_name = "small_test"  # Default
    
    if test_type == "unit":
        fixture_name = "small_test"
    elif test_type == "integration":
        fixture_name = "medium_test"
    elif test_type == "performance":
        fixture_name = "large_test"
    elif test_type == "e2e":
        fixture_name = "medium_test"
    
    # Set environment variable for tests
    os.environ["TEST_FIXTURE"] = fixture_name
    print(f"Using fixture: {fixture_name}")
    
    return fixture_name


def discover_tests(test_dirs, pattern):
    """Discover tests in the given directories."""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    for test_dir in test_dirs:
        if os.path.exists(test_dir):
            print(f"Discovering tests in {test_dir}...")
            discovered_suite = loader.discover(test_dir, pattern=pattern)
            suite.addTest(discovered_suite)
    
    return suite


def run_unittest_suite(test_type, verbose=False, failfast=False):
    """Run the unittest suite for the given test type."""
    # Set up the test data
    setup_test_data(test_type)
    
    # Define directories to search for tests
    test_dirs = []
    
    if test_type == "unit":
        test_dirs = [os.path.join(os.path.dirname(__file__), "unit")]
    elif test_type == "integration":
        test_dirs = [os.path.join(os.path.dirname(__file__), "integration")]
    elif test_type == "api":
        test_dirs = [os.path.join(os.path.dirname(__file__), "api")]
    elif test_type == "performance":
        test_dirs = [os.path.join(os.path.dirname(__file__), "performance")]
    elif test_type == "scenarios":
        test_dirs = [os.path.join(os.path.dirname(__file__), "scenarios")]
    elif test_type == "all":
        test_dirs = [
            os.path.join(os.path.dirname(__file__), "unit"),
            os.path.join(os.path.dirname(__file__), "integration"),
            os.path.join(os.path.dirname(__file__), "api"),
            os.path.join(os.path.dirname(__file__), "performance"),
            os.path.join(os.path.dirname(__file__), "scenarios")
        ]
    
    # Discover and run tests
    suite = discover_tests(test_dirs, pattern="test_*.py")
    
    runner = unittest.TextTestRunner(
        verbosity=2 if verbose else 1,
        failfast=failfast
    )
    
    start_time = time.time()
    result = runner.run(suite)
    end_time = time.time()
    
    # Print summary
    print("\nTest Suite Summary:")
    print(f"  Test type: {test_type}")
    print(f"  Duration: {end_time - start_time:.2f} seconds")
    print(f"  Tests run: {result.testsRun}")
    print(f"  Failures: {len(result.failures)}")
    print(f"  Errors: {len(result.errors)}")
    print(f"  Skipped: {len(result.skipped)}")
    
    # Return the result
    return result.wasSuccessful()


def run_pytest_suite(test_type, verbose=False, failfast=False):
    """Run the pytest suite for the given test type."""
    # Set up the test data
    fixture_name = setup_test_data(test_type)
    
    # Define directories to search for tests
    test_dirs = []
    
    if test_type == "unit":
        test_dirs = [os.path.join(os.path.dirname(__file__), "unit")]
    elif test_type == "integration":
        test_dirs = [os.path.join(os.path.dirname(__file__), "integration")]
    elif test_type == "api":
        test_dirs = [os.path.join(os.path.dirname(__file__), "api")]
    elif test_type == "performance":
        test_dirs = [os.path.join(os.path.dirname(__file__), "performance")]
    elif test_type == "scenarios":
        test_dirs = [os.path.join(os.path.dirname(__file__), "scenarios")]
    elif test_type == "all":
        test_dirs = [os.path.dirname(__file__)]
    
    # Build the pytest command
    cmd = ["pytest"]
    
    # Add arguments
    if verbose:
        cmd.append("-v")
    if failfast:
        cmd.append("-x")
    
    # Add fixture argument
    cmd.append(f"--fixture={fixture_name}")
    
    # Add test directories
    cmd.extend(test_dirs)
    
    # Run pytest
    start_time = time.time()
    process = subprocess.run(cmd, capture_output=True, text=True)
    end_time = time.time()
    
    # Print the output
    print(process.stdout)
    if process.stderr:
        print(process.stderr)
    
    # Print summary
    print("\nTest Suite Summary:")
    print(f"  Test type: {test_type}")
    print(f"  Duration: {end_time - start_time:.2f} seconds")
    print(f"  Exit code: {process.returncode}")
    
    # Return the result (0 means success)
    return process.returncode == 0


def run_e2e_tests(headless=True, browser="chromium"):
    """Run end-to-end tests with Playwright."""
    # Check if playwright is installed
    try:
        subprocess.run(["npx", "playwright", "--version"], 
                      check=True, capture_output=True, text=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Playwright not found. Please install it with:")
        print("  npm install -g playwright")
        return False
    
    # Set up the test data
    setup_test_data("e2e")
    
    # Define the e2e test directory
    e2e_dir = os.path.join(os.path.dirname(__file__), "..", "e2e")
    if not os.path.exists(e2e_dir):
        print(f"E2E test directory not found: {e2e_dir}")
        return False
    
    # Build the playwright command
    cmd = ["npx", "playwright", "test"]
    
    # Add arguments
    if headless:
        cmd.append("--headed=false")
    else:
        cmd.append("--headed")
    
    cmd.append(f"--browser={browser}")
    
    # Run the e2e tests
    print(f"Running E2E tests with {browser}...")
    start_time = time.time()
    process = subprocess.run(cmd, cwd=e2e_dir, capture_output=True, text=True)
    end_time = time.time()
    
    # Print the output
    print(process.stdout)
    if process.stderr:
        print(process.stderr)
    
    # Print summary
    print("\nE2E Test Suite Summary:")
    print(f"  Browser: {browser}")
    print(f"  Headless: {headless}")
    print(f"  Duration: {end_time - start_time:.2f} seconds")
    print(f"  Exit code: {process.returncode}")
    
    # Return the result (0 means success)
    return process.returncode == 0


def generate_test_report(test_type, success, output_file=None):
    """Generate a JSON test report."""
    report = {
        "test_type": test_type,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "success": success,
        "fixture": os.environ.get("TEST_FIXTURE", "unknown")
    }
    
    if output_file:
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Write the report
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"Test report written to: {output_file}")
    
    return report


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="Run test suite for Fire-EMS Tools")
    parser.add_argument(
        "test_type",
        choices=["unit", "integration", "api", "performance", "scenarios", "e2e", "all"],
        help="Type of tests to run"
    )
    parser.add_argument(
        "--runner",
        choices=["unittest", "pytest"],
        default="unittest",
        help="Test runner to use"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output"
    )
    parser.add_argument(
        "--failfast", "-x",
        action="store_true",
        help="Stop on first failure"
    )
    parser.add_argument(
        "--report",
        help="Generate a JSON test report at the specified path"
    )
    parser.add_argument(
        "--no-headless",
        action="store_true",
        help="Run E2E tests with browser UI visible (not headless)"
    )
    parser.add_argument(
        "--browser",
        choices=["chromium", "firefox", "webkit"],
        default="chromium",
        help="Browser to use for E2E tests"
    )
    
    args = parser.parse_args()
    
    # Run the tests
    if args.test_type == "e2e":
        success = run_e2e_tests(
            headless=not args.no_headless,
            browser=args.browser
        )
    elif args.runner == "unittest":
        success = run_unittest_suite(
            args.test_type,
            verbose=args.verbose,
            failfast=args.failfast
        )
    else:  # pytest
        success = run_pytest_suite(
            args.test_type,
            verbose=args.verbose,
            failfast=args.failfast
        )
    
    # Generate test report if requested
    if args.report:
        generate_test_report(args.test_type, success, args.report)
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()