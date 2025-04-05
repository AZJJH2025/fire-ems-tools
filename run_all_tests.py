#!/usr/bin/env python3
"""
Comprehensive Test Runner

This script runs all tests in sequence to validate the Fire-EMS Tools application.
It ensures test departments exist and then runs all test suites.

Usage:
    python run_all_tests.py [--verbose] [--skip-setup] [--skip-performance]
"""

import os
import sys
import time
import argparse
import subprocess
import unittest
from datetime import datetime

def print_header(message):
    """Print a formatted header"""
    print("\n" + "=" * 80)
    print(f" {message}")
    print("=" * 80)

def run_command(command, description):
    """Run a shell command and print output"""
    print_header(description)
    print(f"Running: {' '.join(command)}")
    
    result = subprocess.run(command, capture_output=True, text=True)
    print(result.stdout)
    
    if result.stderr:
        print("ERRORS:")
        print(result.stderr)
        
    return result.returncode

def check_test_departments():
    """Check if test departments exist"""
    try:
        # Import necessary modules
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from app import app
        from database import Department, db
        
        # Check for test departments
        with app.app_context():
            dept_count = Department.query.filter(Department.code.in_(['rural', 'suburban', 'urban', 'regional'])).count()
            return dept_count >= 4
            
    except Exception as e:
        print(f"Error checking test departments: {str(e)}")
        return False

def setup_test_departments():
    """Set up test departments if they don't exist"""
    if check_test_departments():
        print("Test departments already exist. Skipping setup.")
        return 0
        
    print("Test departments not found. Creating them...")
    return run_command(['python', 'create_test_departments.py'], "Creating Test Departments")

def run_department_tests(verbose=False):
    """Run department configuration tests"""
    command = ['python', 'test_departments.py']
    if verbose:
        command.append('--verbose')
        
    return run_command(command, "Running Department Configuration Tests")

def run_incident_logger_tests(verbose=False):
    """Run incident logger tests"""
    command = ['python', 'test_incident_logger.py']
    if verbose:
        command.append('--verbose')
        
    return run_command(command, "Running Incident Logger Tests")

def run_api_tests(verbose=False):
    """Run API tests"""
    command = ['python', 'test_api.py']
    if verbose:
        command.append('-v')
        
    return run_command(command, "Running API Tests")

def run_db_tests(verbose=False):
    """Run database tests"""
    command = ['python', 'test_db.py']
    if verbose:
        command.append('-v')
        
    return run_command(command, "Running Database Tests")

def run_performance_tests(department='urban', users=5, runtime=30):
    """Run performance tests"""
    command = [
        'python', 'test_performance.py',
        '--department', department,
        '--users', str(users),
        '--runtime', str(runtime)
    ]
    
    return run_command(command, f"Running Performance Tests ({users} users, {runtime}s)")

def generate_test_report(results):
    """Generate a test report"""
    print_header("Test Report")
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"Test run completed at {timestamp}")
    
    for test_name, status in results.items():
        status_text = "PASSED" if status == 0 else "FAILED"
        print(f"{test_name:30} {status_text}")
    
    # Count passed tests
    passed = sum(1 for status in results.values() if status == 0)
    total = len(results)
    
    print(f"\nTotal: {total}, Passed: {passed}, Failed: {total - passed}")
    
    # Save report to file
    filename = f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(filename, 'w') as f:
        f.write(f"Fire-EMS Tools Test Report\n")
        f.write(f"Test run completed at {timestamp}\n\n")
        
        for test_name, status in results.items():
            status_text = "PASSED" if status == 0 else "FAILED"
            f.write(f"{test_name:30} {status_text}\n")
        
        f.write(f"\nTotal: {total}, Passed: {passed}, Failed: {total - passed}\n")
    
    print(f"\nTest report saved to {filename}")

def main():
    """Main function to run all tests"""
    parser = argparse.ArgumentParser(description='Run all tests for Fire-EMS Tools')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed test output')
    parser.add_argument('--skip-setup', action='store_true', help='Skip test department setup')
    parser.add_argument('--skip-performance', action='store_true', help='Skip performance tests')
    parser.add_argument('--performance-users', type=int, default=5, help='Number of users for performance tests')
    parser.add_argument('--performance-runtime', type=int, default=30, help='Runtime for performance tests in seconds')
    
    args = parser.parse_args()
    
    print_header("Fire-EMS Tools Comprehensive Test Suite")
    print(f"Starting tests at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results = {}
    
    # Setup test departments if needed
    if not args.skip_setup:
        setup_status = setup_test_departments()
        test_results["Test Department Setup"] = setup_status
        
        if setup_status != 0:
            print("Failed to set up test departments. Aborting tests.")
            generate_test_report(test_results)
            return 1
    
    # Run main tests
    test_results["Department Configuration Tests"] = run_department_tests(args.verbose)
    test_results["Incident Logger Tests"] = run_incident_logger_tests(args.verbose)
    test_results["API Tests"] = run_api_tests(args.verbose)
    test_results["Database Tests"] = run_db_tests(args.verbose)
    
    # Run performance tests if not skipped
    if not args.skip_performance:
        test_results["Performance Tests (urban)"] = run_performance_tests(
            'urban', args.performance_users, args.performance_runtime
        )
        
        # Also test suburban department with fewer users
        test_results["Performance Tests (suburban)"] = run_performance_tests(
            'suburban', max(2, args.performance_users // 2), args.performance_runtime
        )
    
    # Generate test report
    generate_test_report(test_results)
    
    # Return error code if any tests failed
    return 0 if all(status == 0 for status in test_results.values()) else 1

if __name__ == "__main__":
    sys.exit(main())