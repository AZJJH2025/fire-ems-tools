# GraphQL API Testing Guide

This guide covers testing the GraphQL API for the Fire-EMS Tools application, ensuring robust and reliable API functionality.

## Overview

GraphQL provides a powerful, flexible API layer for clients to query exactly the data they need. Our testing framework verifies:

1. Query validation and correctness
2. Mutation functionality
3. Schema design and documentation
4. Authentication and authorization
5. Performance under load
6. Error handling and edge cases

## Setup

### Prerequisites

- Python 3.10+
- Required packages: `aiohttp`, `matplotlib`, `numpy`

### Installation

```bash
# Install dependencies
pip install aiohttp matplotlib numpy
```

## Running Tests

### Basic Usage

Test the GraphQL API against a development server:

```bash
python graphql_api_test.py test
```

### Schema Validation

Validate the GraphQL schema:

```bash
python graphql_api_test.py schema
```

### Load Testing

Run load tests on a specific query:

```bash
python graphql_api_test.py load --query graphql_tests/load_test_incidents.json --requests 100 --concurrency 10
```

### Custom Server

Test against a specific server:

```bash
python graphql_api_test.py test --url http://staging.example.com --endpoint /api/graphql
```

## Test Structure

Tests are defined in JSON files in the `graphql_tests` directory:

```json
{
  "description": "Get all departments",
  "query": "query GetDepartments { departments { id name code department_type num_stations } }",
  "variables": {},
  "auth_required": true,
  "role": "admin",
  "expected_status": 200,
  "validation_rules": [
    {
      "type": "no_errors"
    },
    {
      "type": "has_data"
    },
    {
      "type": "field_exists",
      "path": "data.departments"
    },
    {
      "type": "array_length",
      "path": "data.departments",
      "min": 1
    }
  ]
}
```

### Test File Fields

| Field | Description |
|-------|-------------|
| `description` | Human-readable description of the test |
| `query` | GraphQL query or mutation to execute |
| `variables` | Variables to pass to the query |
| `auth_required` | Whether authentication is required |
| `role` | Role to use for authentication (admin or user) |
| `expected_status` | Expected HTTP status code |
| `validation_rules` | Rules to validate the response |

### Validation Rules

| Rule Type | Description | Parameters |
|-----------|-------------|------------|
| `no_errors` | Check that response has no errors | None |
| `has_data` | Check that response has data | None |
| `field_exists` | Check that a field exists | `path` |
| `field_equals` | Check that a field equals a value | `path`, `value` |
| `field_contains` | Check that a field contains a value | `path`, `value` |
| `array_length` | Check array length | `path`, `min`, `max` |
| `custom` | Custom validator function | `validator` |

## Authentication

For tests requiring authentication:

1. Set `auth_required` to `true` in the test file
2. Specify the required role (`admin` or `user`)
3. The testing framework will handle login automatically

Example:

```json
{
  "description": "Get user profile",
  "query": "query { me { id name email role } }",
  "variables": {},
  "auth_required": true,
  "role": "user"
}
```

## Test Reports

After running tests, HTML reports are generated in the `graphql_test_reports` directory. Reports include:

- Summary of test results (passed/failed)
- Detailed information about each test
- Request and response data
- Validation errors for failed tests
- Performance metrics for load tests

## Load Testing

The framework supports load testing to evaluate API performance:

```bash
python graphql_api_test.py load --query graphql_tests/load_test_incidents.json --requests 200 --concurrency 20
```

Load test reports include:

- Requests per second
- Success rate
- Response time statistics (min, avg, max, percentiles)
- Response time distribution graphs
- Error details

## Schema Validation

Schema validation checks:

- Presence of required types
- Type descriptions
- Field descriptions
- Argument descriptions
- Type relationships

Run schema validation with:

```bash
python graphql_api_test.py schema
```

## Continuous Integration

Add GraphQL API tests to your CI pipeline:

```yaml
graphql-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install aiohttp matplotlib numpy
    - name: Start server
      run: |
        python app.py &
        sleep 5
    - name: Run GraphQL API tests
      run: |
        python graphql_api_test.py test
    - name: Upload test reports
      uses: actions/upload-artifact@v3
      with:
        name: graphql-test-reports
        path: graphql_test_reports/
```

## Best Practices

1. **Cover all operations**: Test all queries and mutations in your schema
2. **Test edge cases**: Include tests for error conditions and edge cases
3. **Validate data types**: Check that returned data has the correct types
4. **Test authorization**: Verify access control for different roles
5. **Optimize queries**: Use load testing to identify slow queries
6. **Keep tests independent**: Each test should be self-contained
7. **Document tests**: Include clear descriptions for all tests

## Troubleshooting

### Authentication Issues

If tests fail due to authentication:

1. Check the credentials in the code
2. Verify that the login mutation returns a token
3. Ensure the token is correctly sent in subsequent requests

### Schema Changes

If tests fail after schema changes:

1. Update test queries to match the new schema
2. Review validation rules for changed fields
3. Run schema validation to check for issues

### Performance Issues

If load tests show poor performance:

1. Check query complexity (nested fields, large result sets)
2. Look for N+1 query problems
3. Consider implementing pagination for large collections
4. Review database indexes for frequently queried fields