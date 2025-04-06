# Feature Scenario Testing

This directory contains comprehensive scenario-based tests for the Fire-EMS Tools application. Scenario tests validate complete features and their components through realistic usage patterns.

## Test Categories

### Incident Logger Tests

The Incident Logger scenario tests validate the functionality of the Incident Logger feature, focusing on:

- **HIPAA Compliance**: Ensures patient data is properly protected, accessed, and shared according to HIPAA requirements.
- **Form Validation**: Verifies that the incident form properly validates user input according to business rules.
- **CAD Integration**: Tests integration with various Computer-Aided Dispatch (CAD) systems.

## Running the Tests

### Run All Incident Logger Tests

```bash
python tests/scenarios/run_incident_logger_tests.py
```

### Run All Scenario Tests

```bash
python tests/run_test_suite.py scenarios
```

### Run Specific Test Categories

```bash
# Run HIPAA compliance tests only
python -m unittest tests/scenarios/incident_logger_hipaa_test.py

# Run form validation tests only
python -m unittest tests/scenarios/incident_logger_validation_test.py

# Run CAD integration tests only
python -m unittest tests/scenarios/incident_logger_cad_test.py
```

## Test Reports

After running the tests, reports are automatically generated in the `tests/reports/` directory, containing:

- A detailed JSON report of all test results
- A human-readable summary text file
- Timestamp of test execution
- Pass/fail counts and details of any failures

## Documentation

For detailed information about the Incident Logger tests, see:
[INCIDENT_LOGGER_TESTS.md](INCIDENT_LOGGER_TESTS.md)

## Adding New Scenario Tests

When adding new features to the application, corresponding scenario tests should be created to validate the complete functionality. Follow these guidelines:

1. Create a new test file in the appropriate subdirectory (e.g., `tests/scenarios/feature_name_test.py`)
2. Inherit from the appropriate base test class (e.g., `BlueprintTestCase` or `IntegrationTestBase`)
3. Implement comprehensive tests that cover the feature's functionality
4. Create a runner script if needed (e.g., `run_feature_name_tests.py`)
5. Add documentation in a corresponding markdown file (e.g., `FEATURE_NAME_TESTS.md`)
6. Update this README.md to include information about the new tests