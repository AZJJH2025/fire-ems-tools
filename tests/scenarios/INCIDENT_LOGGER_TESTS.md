# Incident Logger Testing Framework

This document describes the comprehensive testing framework for the Fire-EMS Tools Incident Logger feature, which ensures its reliability, security, and interoperability.

## Overview

The Incident Logger is a critical component of the Fire-EMS Tools application that allows departments to record, manage, and analyze emergency incidents. Due to its importance and the sensitive nature of the data it handles, a comprehensive testing approach has been implemented.

## Test Categories

The testing framework covers the following key areas:

1. **HIPAA Compliance** - Tests that verify protected health information (PHI) is properly secured, accessed, and shared according to HIPAA requirements.

2. **Form Validation** - Tests that ensure the incident form properly validates input data according to business rules and industry standards.

3. **CAD Integration** - Tests that verify proper integration with various Computer-Aided Dispatch (CAD) systems, including data formatting, incident updates, and webhook functionality.

## Running the Tests

To run the complete suite of Incident Logger tests:

```bash
python tests/scenarios/run_incident_logger_tests.py
```

To run specific test categories individually:

```bash
# Run HIPAA compliance tests only
python -m unittest tests.scenarios.incident_logger_hipaa_test

# Run form validation tests only
python -m unittest tests.scenarios.incident_logger_validation_test

# Run CAD integration tests only
python -m unittest tests.scenarios.incident_logger_cad_test
```

## Test Details

### HIPAA Compliance Tests

The HIPAA compliance tests (`incident_logger_hipaa_test.py`) verify:

- Protected Health Information (PHI) is properly restricted based on user authorization
- Audit trails are created when PHI is accessed
- PHI is properly encrypted in storage
- Data export and sharing functionality respects HIPAA requirements
- De-identification works correctly for reporting
- Patient consent is properly tracked and recorded

### Form Validation Tests

The form validation tests (`incident_logger_validation_test.py`) verify:

- Required fields are properly enforced
- Time sequences are validated (e.g., dispatch before arrival)
- Patient vital signs are within valid ranges
- Narrative meets minimum length requirements
- NFIRS compliance validation works correctly
- Multiple patient data is handled properly
- Field formats (phone numbers, ZIP codes, etc.) are validated

### CAD Integration Tests

The CAD integration tests (`incident_logger_cad_test.py`) verify:

- Integration with multiple CAD system formats (Generic, Zoll, ESO)
- Proper conversion of external CAD formats to internal data model
- Updating existing incidents with new CAD data
- Webhook processing for CAD updates
- API key authentication for secure CAD integration
- Coordination between multiple CAD systems for the same incident

## Test Reports

After running the tests, reports are automatically generated in the `tests/reports/` directory with the following:

- A detailed JSON report of all test results
- A human-readable summary text file
- Timestamp of test execution
- Pass/fail counts and details of any failures

## Adding New Tests

When adding new features to the Incident Logger, corresponding tests should be added to the appropriate test file:

1. For features related to patient information security, add tests to `incident_logger_hipaa_test.py`
2. For features related to data validation and form handling, add tests to `incident_logger_validation_test.py`
3. For features related to external system integration, add tests to `incident_logger_cad_test.py`

## Test Environments

These tests are designed to run in multiple environments:

- **Local Development**: Using SQLite for rapid testing during development
- **CI/CD Pipeline**: Using GitHub Actions with in-memory database for automated testing
- **Staging**: Using the staging database with test data for pre-production validation

## Dependencies

The Incident Logger tests depend on:
- The base test classes in `tests/integration/test_integration_base.py`
- The blueprint test framework in `tests/routes/base.py`
- Test data fixtures defined in the test data management system

## Maintenance

Test maintenance should be performed when:
- New features are added to the Incident Logger
- Business logic or validation rules change
- CAD integration formats change
- HIPAA requirements or interpretations are updated