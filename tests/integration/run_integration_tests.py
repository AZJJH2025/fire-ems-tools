#!/usr/bin/env python3
"""
Integration Test Runner

Comprehensive test runner for Flask API integration tests.
Provides zero-risk testing of all Flask endpoints and database operations.

Usage:
    python run_integration_tests.py                    # Run all integration tests
    python run_integration_tests.py --quick           # Run quick subset only
    python run_integration_tests.py --security-only   # Run security tests only
    python run_integration_tests.py --database-only   # Run database tests only
    python run_integration_tests.py --verbose         # Verbose output
    python run_integration_tests.py --generate-report # Generate HTML report
"""

import sys
import os
import argparse
import subprocess
import time
from pathlib import Path
from datetime import datetime

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

def run_pytest_command(test_files, args):
    """Run pytest with specified test files and arguments"""
    
    # Base pytest command
    cmd = ['python', '-m', 'pytest']
    
    # Add test files
    cmd.extend(test_files)
    
    # Add pytest arguments based on user options
    if args.verbose:
        cmd.extend(['-v', '--tb=long'])
    else:
        cmd.extend(['-q', '--tb=short'])
    
    if args.generate_report:
        report_file = f'integration_test_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.html'
        cmd.extend(['--html', report_file, '--self-contained-html'])
    
    # Add coverage if requested
    if args.coverage:
        cmd.extend(['--cov=app', '--cov=database', '--cov=routes', '--cov-report=term-missing'])
    
    # Execute command
    print(f"Running: {' '.join(cmd)}")
    print("-" * 80)
    
    try:
        result = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=False, text=True)
        return result.returncode
    except Exception as e:
        print(f"Error running tests: {e}")
        return 1

def check_dependencies():
    """Check if required testing dependencies are available"""
    required_packages = ['pytest', 'flask', 'sqlalchemy']
    optional_packages = ['pytest-html', 'pytest-cov']
    
    missing_required = []
    missing_optional = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_required.append(package)
    
    for package in optional_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_optional.append(package)
    
    if missing_required:
        print("ERROR: Missing required packages:")
        for package in missing_required:
            print(f"  - {package}")
        print("\nInstall with: pip install " + " ".join(missing_required))
        return False
    
    if missing_optional:
        print("WARNING: Missing optional packages (some features may not work):")
        for package in missing_optional:
            print(f"  - {package}")
        print("\nInstall with: pip install " + " ".join(missing_optional))
        print()
    
    return True

def validate_flask_app():
    """Validate Flask app can be imported and basic structure exists"""
    try:
        from app import create_app
        from database import db
        
        app = create_app()
        print("✓ Flask app imports successfully")
        
        # Test basic app creation
        with app.app_context():
            print("✓ Flask app context works")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to validate Flask app: {e}")
        print("Make sure you're running from the project root directory")
        return False

def get_test_files(test_selection):
    """Get list of test files based on selection"""
    base_dir = Path(__file__).parent
    
    if test_selection == 'all':
        return [
            str(base_dir / 'test_flask_api_integration.py'),
            str(base_dir / 'test_database_integration.py'),
            str(base_dir / 'test_security_integration.py')
        ]
    elif test_selection == 'api':
        return [str(base_dir / 'test_flask_api_integration.py')]
    elif test_selection == 'database':
        return [str(base_dir / 'test_database_integration.py')]
    elif test_selection == 'security':
        return [str(base_dir / 'test_security_integration.py')]
    elif test_selection == 'quick':
        # Quick subset - just health checks and basic functionality
        return [str(base_dir / 'test_flask_api_integration.py::TestHealthAndMonitoringEndpoints')]
    else:
        return []

def print_test_summary():
    """Print summary of available tests"""
    print("Flask API Integration Test Suite")
    print("=" * 50)
    print()
    print("Available Test Categories:")
    print("  • Flask API Integration Tests")
    print("    - Health and monitoring endpoints")
    print("    - Authentication endpoints")  
    print("    - Admin endpoints with authorization")
    print("    - Public endpoints accessibility")
    print("    - Data endpoints access control")
    print("    - Security validation")
    print("    - Error handling")
    print()
    print("  • Database Integration Tests")
    print("    - Database connectivity and pooling")
    print("    - Transaction integrity")
    print("    - Performance under load") 
    print("    - Reliability and error recovery")
    print("    - Configuration validation")
    print()
    print("  • Security Integration Tests")
    print("    - Authentication security")
    print("    - Authorization and access controls")
    print("    - Input validation and sanitization")
    print("    - Security headers and middleware")
    print("    - Rate limiting and DoS protection")
    print("    - Session security")
    print()

def main():
    """Main test runner function"""
    parser = argparse.ArgumentParser(
        description='Run Flask API Integration Tests',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_integration_tests.py                    # Run all tests
  python run_integration_tests.py --quick           # Quick health checks only
  python run_integration_tests.py --security-only   # Security tests only
  python run_integration_tests.py --database-only   # Database tests only
  python run_integration_tests.py --api-only        # API tests only
  python run_integration_tests.py --verbose --coverage  # Detailed output with coverage
        """
    )
    
    # Test selection options
    test_group = parser.add_mutually_exclusive_group()
    test_group.add_argument('--quick', action='store_true',
                           help='Run quick subset of tests (health checks only)')
    test_group.add_argument('--api-only', action='store_true',
                           help='Run Flask API tests only')
    test_group.add_argument('--database-only', action='store_true',
                           help='Run database integration tests only')
    test_group.add_argument('--security-only', action='store_true',
                           help='Run security integration tests only')
    
    # Output options
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Verbose test output')
    parser.add_argument('--generate-report', action='store_true',
                       help='Generate HTML test report')
    parser.add_argument('--coverage', action='store_true',
                       help='Generate coverage report')
    parser.add_argument('--summary', action='store_true',
                       help='Print test summary and exit')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Print summary if requested
    if args.summary:
        print_test_summary()
        return 0
    
    # Determine test selection
    if args.quick:
        test_selection = 'quick'
    elif args.api_only:
        test_selection = 'api'
    elif args.database_only:
        test_selection = 'database'
    elif args.security_only:
        test_selection = 'security'
    else:
        test_selection = 'all'
    
    print("Fire EMS Tools - Flask API Integration Test Runner")
    print("=" * 60)
    print(f"Test Selection: {test_selection}")
    print(f"Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check dependencies
    print("Checking dependencies...")
    if not check_dependencies():
        return 1
    
    # Validate Flask app
    print("Validating Flask application...")
    if not validate_flask_app():
        return 1
    
    print()
    
    # Get test files
    test_files = get_test_files(test_selection)
    if not test_files:
        print("ERROR: No test files found for selection")
        return 1
    
    print(f"Running {len(test_files)} test file(s):")
    for test_file in test_files:
        print(f"  • {Path(test_file).name}")
    print()
    
    # Run tests
    start_time = time.time()
    return_code = run_pytest_command(test_files, args)
    end_time = time.time()
    
    # Print completion summary
    print()
    print("-" * 80)
    print(f"Test run completed in {end_time - start_time:.2f} seconds")
    print(f"End Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if return_code == 0:
        print("✓ All tests completed successfully")
    else:
        print("✗ Some tests failed or encountered errors")
    
    if args.generate_report:
        print(f"✓ HTML report generated: integration_test_report_*.html")
    
    return return_code

if __name__ == '__main__':
    sys.exit(main())