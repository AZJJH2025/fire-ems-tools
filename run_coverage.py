#!/usr/bin/env python3
"""
Test Coverage Runner for Fire-EMS Tools

This script runs tests with coverage analysis and generates comprehensive reports.
"""

import os
import sys
import argparse
import subprocess
import shutil
from datetime import datetime


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Run tests with code coverage analysis")
    parser.add_argument(
        "--categories",
        nargs="+",
        choices=["simplified", "error", "boundary", "all"],
        default=["simplified"],
        help="Test categories to run (default: simplified)",
    )
    parser.add_argument(
        "--html", action="store_true", help="Generate HTML coverage report"
    )
    parser.add_argument(
        "--xml", action="store_true", help="Generate XML coverage report for CI tools"
    )
    parser.add_argument(
        "--output-dir",
        default="coverage_reports",
        help="Directory to store coverage reports (default: coverage_reports)",
    )
    parser.add_argument(
        "--omit",
        nargs="+",
        default=["*test*.py", "*/tests/*", "*/e2e/*", "*/venv/*", "setup*"],
        help="Patterns of files to exclude from coverage",
    )
    return parser.parse_args()


def setup_coverage_directory(output_dir):
    """Create or clean coverage output directory."""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Create timestamped directory for this run
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = os.path.join(output_dir, f"run_{timestamp}")
    os.makedirs(run_dir)
    
    # Create link to latest run
    latest_link = os.path.join(output_dir, "latest")
    if os.path.exists(latest_link):
        if os.path.islink(latest_link):
            os.unlink(latest_link)
        else:
            shutil.rmtree(latest_link)
    
    # Create relative symlink on Unix or copy directory on Windows
    if os.name == 'nt':  # Windows
        # Windows doesn't handle symlinks well, so we'll use a file to point to the latest run
        with open(os.path.join(output_dir, "latest_run.txt"), "w") as f:
            f.write(run_dir)
    else:  # Unix-like
        os.symlink(os.path.basename(run_dir), latest_link)
    
    return run_dir


def run_coverage(categories, html, xml, output_dir, omit_patterns):
    """Run tests with coverage and generate reports."""
    print(f"Running coverage analysis for categories: {', '.join(categories)}")
    
    run_dir = setup_coverage_directory(output_dir)
    
    # Construct the coverage command
    coverage_cmd = [
        "coverage", "run", 
        "--source=.", 
        "--omit=" + ",".join(omit_patterns),
    ]
    
    # Run coverage for each category
    if "all" in categories:
        categories = ["simplified", "error", "boundary"]
    
    for category in categories:
        test_cmd = coverage_cmd + ["run_all_tests.py", f"--category={category}"]
        try:
            subprocess.run(test_cmd, check=True)
            print(f"Successfully ran tests for category: {category}")
        except subprocess.CalledProcessError as e:
            print(f"Error running tests for category {category}: {e}")
            return False
    
    # Generate coverage report
    print("\nGenerating coverage report...")
    
    # Always generate console text report
    try:
        subprocess.run(["coverage", "report"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error generating text report: {e}")
    
    # Generate HTML report if requested
    if html:
        html_dir = os.path.join(run_dir, "html")
        try:
            subprocess.run(["coverage", "html", f"--directory={html_dir}"], check=True)
            print(f"HTML coverage report generated in {html_dir}")
            
            # Create index.html in the run directory that redirects to the HTML report
            with open(os.path.join(run_dir, "index.html"), "w") as f:
                f.write(f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta http-equiv="refresh" content="0; url=html/index.html">
                </head>
                <body>
                    <p>Redirecting to <a href="html/index.html">coverage report</a>...</p>
                </body>
                </html>
                """)
        except subprocess.CalledProcessError as e:
            print(f"Error generating HTML report: {e}")
    
    # Generate XML report if requested (for CI integration)
    if xml:
        xml_path = os.path.join(run_dir, "coverage.xml")
        try:
            subprocess.run(["coverage", "xml", f"-o={xml_path}"], check=True)
            print(f"XML coverage report generated: {xml_path}")
        except subprocess.CalledProcessError as e:
            print(f"Error generating XML report: {e}")
    
    # Create a summary file
    with open(os.path.join(run_dir, "summary.txt"), "w") as f:
        f.write(f"Coverage Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Categories: {', '.join(categories)}\n")
        f.write(f"HTML Report: {html}\n")
        f.write(f"XML Report: {xml}\n")
        f.write(f"Omit Patterns: {', '.join(omit_patterns)}\n")
    
    return True


def main():
    """Main function."""
    args = parse_arguments()
    
    # Check if coverage is installed
    try:
        subprocess.run(["coverage", "--version"], stdout=subprocess.PIPE, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: 'coverage' not found. Please install it using:")
        print("pip install coverage")
        return 1
    
    # Run coverage
    success = run_coverage(
        args.categories,
        args.html,
        args.xml,
        args.output_dir,
        args.omit
    )
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())