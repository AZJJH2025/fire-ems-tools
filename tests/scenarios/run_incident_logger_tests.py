#!/usr/bin/env python3
"""
Runner script for all Incident Logger functional tests.

This script runs all the functional tests for the Incident Logger feature
and generates a report of the results.
"""

import unittest
import sys
import os
import datetime
import json
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

# Import test modules
from tests.scenarios.incident_logger_hipaa_test import IncidentLoggerHIPAATest
from tests.scenarios.incident_logger_validation_test import IncidentLoggerValidationTest
from tests.scenarios.incident_logger_cad_test import IncidentLoggerCADTest

def run_tests():
    """Run all Incident Logger tests and return the results."""
    # Create a test suite containing all tests
    test_suite = unittest.TestSuite()
    
    # Add all Incident Logger tests
    test_suite.addTest(unittest.makeSuite(IncidentLoggerHIPAATest))
    test_suite.addTest(unittest.makeSuite(IncidentLoggerValidationTest))
    test_suite.addTest(unittest.makeSuite(IncidentLoggerCADTest))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result

def generate_report(result):
    """Generate a report of test results."""
    # Create reports directory if it doesn't exist
    reports_dir = Path(__file__).parent.parent / 'reports'
    reports_dir.mkdir(exist_ok=True)
    
    # Create a timestamp for the report
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Initialize the report data
    report = {
        'timestamp': datetime.datetime.now().isoformat(),
        'total_tests': result.testsRun,
        'passed': result.testsRun - len(result.failures) - len(result.errors),
        'failures': len(result.failures),
        'errors': len(result.errors),
        'skipped': len(result.skipped),
        'failure_details': [],
        'error_details': []
    }
    
    # Add failure details
    for test, traceback in result.failures:
        report['failure_details'].append({
            'test': str(test),
            'traceback': traceback
        })
    
    # Add error details
    for test, traceback in result.errors:
        report['error_details'].append({
            'test': str(test),
            'traceback': traceback
        })
    
    # Write JSON report
    report_file = reports_dir / f'incident_logger_tests_{timestamp}.json'
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    # Write summary file
    summary_file = reports_dir / f'incident_logger_tests_{timestamp}.txt'
    with open(summary_file, 'w') as f:
        f.write(f"Incident Logger Test Results - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Total Tests: {report['total_tests']}\n")
        f.write(f"Passed: {report['passed']}\n")
        f.write(f"Failed: {report['failures']}\n")
        f.write(f"Errors: {report['errors']}\n")
        f.write(f"Skipped: {report['skipped']}\n\n")
        
        if report['failures']:
            f.write("Failures:\n")
            f.write("-" * 80 + "\n")
            for i, failure in enumerate(report['failure_details']):
                f.write(f"{i+1}. {failure['test']}\n")
            f.write("\n")
        
        if report['errors']:
            f.write("Errors:\n")
            f.write("-" * 80 + "\n")
            for i, error in enumerate(report['error_details']):
                f.write(f"{i+1}. {error['test']}\n")
            f.write("\n")
        
        f.write("=" * 80 + "\n")
    
    return report_file, summary_file

def print_summary(result, report_file, summary_file):
    """Print a summary of the test results to the console."""
    print("\n" + "=" * 80)
    print(f"Incident Logger Test Summary")
    print("=" * 80)
    print(f"Total Tests: {result.testsRun}")
    print(f"Passed: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failed: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped)}")
    print("-" * 80)
    print(f"Detailed report saved to: {report_file}")
    print(f"Summary report saved to: {summary_file}")
    print("=" * 80 + "\n")

if __name__ == '__main__':
    # Run the tests
    print("\nRunning Incident Logger functional tests...\n")
    result = run_tests()
    
    # Generate the report
    report_file, summary_file = generate_report(result)
    
    # Print summary
    print_summary(result, report_file, summary_file)
    
    # Exit with appropriate status code
    sys.exit(1 if result.failures or result.errors else 0)