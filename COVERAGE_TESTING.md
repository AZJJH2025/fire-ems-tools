# Test Coverage Analysis for Fire-EMS Tools

This document explains how to use the test coverage analysis tools for the Fire-EMS Tools application.

## Overview

Test coverage analysis helps identify which parts of the codebase are exercised by our tests and which parts need additional testing. Our coverage analysis is implemented using Python's `coverage` library and provides reports in multiple formats (text, HTML, and XML).

## Prerequisites

Before running coverage analysis, make sure you have the required dependencies:

```bash
pip install coverage
```

## Running Coverage Analysis

### Basic Usage

To run coverage analysis with default settings (simplified tests only):

```bash
./run_coverage.py
```

This will run the simplified tests with coverage analysis and display a text report in the console.

### Running Coverage for Multiple Test Categories

To run coverage analysis for multiple or all test categories:

```bash
./run_coverage.py --categories simplified error boundary
./run_coverage.py --categories all
```

### Generating HTML Reports

To generate HTML reports (for easy browsing of coverage results):

```bash
./run_coverage.py --html
```

The HTML report will be generated in `coverage_reports/latest/html/`.

### Generating XML Reports

For CI/CD integration (e.g., CodeCov, SonarQube), you can generate XML reports:

```bash
./run_coverage.py --xml
```

The XML report will be generated at `coverage_reports/latest/coverage.xml`.

### Custom Output Directory

You can specify a custom output directory for the reports:

```bash
./run_coverage.py --output-dir my_coverage_reports
```

### Excluding Files

By default, test files, virtual environments, and setup files are excluded from coverage analysis. You can customize the exclusion patterns:

```bash
./run_coverage.py --omit "*/tests/*" "*/venv/*" "*migrations*"
```

## Coverage Reports

### Text Report

The text report provides a summary of coverage results in the console, including:
- Percentage of code covered
- Number of statements
- Number of missing statements
- Coverage percentage by file

### HTML Report

The HTML report provides an interactive browser-based view of coverage results:
- Overall coverage summary
- File-by-file breakdown
- Line-by-line highlighting of covered and uncovered code
- Filtering and sorting options

To view the HTML report, open `coverage_reports/latest/html/index.html` in a web browser.

### XML Report

The XML report follows the Cobertura XML format, which is compatible with most CI/CD tools that support coverage visualization.

## CI/CD Integration

To integrate coverage analysis into your CI/CD workflow:

1. Add the following step to your GitHub Actions workflow:

```yaml
- name: Run coverage analysis
  run: |
    pip install coverage
    ./run_coverage.py --categories all --xml
    
- name: Upload coverage report
  uses: actions/upload-artifact@v3
  with:
    name: coverage-report
    path: coverage_reports/latest/
```

2. For services like CodeCov or SonarQube, use their respective GitHub Actions to upload the XML report.

## Interpreting Coverage Results

When analyzing coverage reports, consider:

1. **Overall coverage percentage**: Aim for at least 80% coverage for critical code.
2. **Uncovered lines**: Prioritize testing uncovered code in critical modules.
3. **Complex functions**: Ensure complex logic has thorough coverage.
4. **Exception handling**: Verify that error paths are tested.

## Best Practices

1. **Run coverage locally before committing**: Check coverage impact of your changes.
2. **Focus on quality, not just quantity**: 100% coverage doesn't guarantee good tests.
3. **Set coverage thresholds**: Establish minimum coverage requirements for critical modules.
4. **Use coverage as a guide**: Coverage analysis is a tool to help identify testing gaps, not an end goal.
5. **Include coverage in code reviews**: Review coverage results as part of PR review.

## Troubleshooting

### Common Issues

1. **Tests failing during coverage**: Ensure tests are independent and don't rely on previous state.
2. **Low coverage despite extensive tests**: Check that your omit patterns aren't excluding relevant code.
3. **Coverage not updating**: Make sure `.coverage` file isn't in your `.gitignore` or being overwritten.

### Getting Help

For more information about the coverage library, refer to the [official documentation](https://coverage.readthedocs.io/).