# Blueprint Route Testing

This document provides an overview of the blueprint-based route testing approach for the Fire-EMS Tools application.

## Overview

The Fire-EMS Tools application uses Flask blueprints to organize routes into logical modules. The blueprint-based testing framework allows us to test each blueprint's routes independently or as part of the entire application.

## Testing Architecture

### Base Test Classes

The blueprint testing framework includes several base test classes:

1. **BlueprintTestCase**: The foundation class that sets up a Flask test environment with an in-memory SQLite database. It handles:
   - Flask application creation
   - Test client initialization
   - Database setup and teardown
   - Test data population

2. **Specialized Blueprint Test Cases**:
   - **MainBlueprintTestCase**: For testing the main routes blueprint
   - **AuthBlueprintTestCase**: For testing the authentication routes blueprint
   - **ApiBlueprintTestCase**: For testing the API routes blueprint
   - **DashboardsBlueprintTestCase**: For testing dashboard-specific routes
   - **ToolsBlueprintTestCase**: For testing tool-specific routes

### Test Implementation

Each blueprint has a dedicated test file that contains test classes and methods:

- `test_main_routes.py`: Tests for the main blueprint (home page, tool pages)
- `test_auth_routes.py`: Tests for the auth blueprint (login, logout)
- `test_api_routes.py`: Tests for the API blueprint (data access endpoints)
- `test_dashboards_routes.py`: Tests for the dashboards blueprint
- `test_tools_routes.py`: Tests for the tools blueprint

## Test Types

The blueprint tests include:

1. **Route Existence**: Tests that each route returns the expected HTTP status code
2. **Content Type Verification**: Tests that routes return the expected content type (HTML, JSON, etc.)
3. **Basic Content Validation**: Tests that responses contain expected data or markers
4. **Authentication Tests**: Tests that protected routes require authentication
5. **Error Handling**: Tests that routes properly handle error conditions

## Running Blueprint Tests

There are multiple ways to run the blueprint tests:

### Using the Dedicated Script

```bash
# Run all blueprint tests
python tests/routes/run_blueprint_tests.py

# Run tests for a specific blueprint
python tests/routes/run_blueprint_tests.py main    # Main blueprint
python tests/routes/run_blueprint_tests.py auth    # Auth blueprint
python tests/routes/run_blueprint_tests.py api     # API blueprint
python tests/routes/run_blueprint_tests.py dashboards # Dashboards blueprint
python tests/routes/run_blueprint_tests.py tools   # Tools blueprint
```

### Using the Primary Test Runner

```bash
# Run all blueprint tests
python run_all_tests.py --feature=routes

# Run tests for specific blueprints
python run_all_tests.py --feature=main_routes
python run_all_tests.py --feature=auth_routes
python run_all_tests.py --feature=api_routes
python run_all_tests.py --feature=dashboards_routes
python run_all_tests.py --feature=tools_routes
```

### Using Pytest Directly

```bash
# Run all blueprint tests
pytest tests/routes/

# Run tests for a specific blueprint
pytest tests/routes/test_main_routes.py
pytest tests/routes/test_auth_routes.py
pytest tests/routes/test_api_routes.py
pytest tests/routes/test_dashboards_routes.py
pytest tests/routes/test_tools_routes.py
```

## CI/CD Integration

The blueprint tests are integrated into our CI/CD pipeline through GitHub Actions:

1. **Automatic Testing**: Blueprint tests run automatically on pull requests and pushes to main branches
2. **Multiple Python Versions**: Tests run across Python 3.8, 3.9, 3.10, and 3.12
3. **Test Reports**: XML test reports are generated for analysis
4. **Coverage Tracking**: Code coverage for blueprints is tracked and reported

## Extending Blueprint Tests

To add new tests for blueprint routes:

1. Choose the appropriate test class based on the blueprint
2. Create a new test method with a clear, descriptive name
3. Use the Flask test client (`self.client`) to make requests to routes
4. Assert the expected status code, content type, and response content
5. Add test data in the `setup_test_data` method if needed

Example of adding a new test:

```python
def test_new_feature_route(self):
    """Test the new feature route."""
    # Setup any required test data or state
    
    # Make a request to the route
    response = self.client.get('/feature/new')
    
    # Assert the expected response
    self.assertEqual(response.status_code, 200)
    self.assertIn('New Feature', response.data.decode('utf-8'))
```

## Best Practices

1. **Independent Tests**: Each test should be independent and not rely on other tests
2. **Complete Setup**: Initialize all required test data in the setup method
3. **Clear Assertions**: Make specific, clear assertions about the expected behavior
4. **Error Handling**: Include tests for error conditions and edge cases
5. **Comprehensive Coverage**: Test all routes and route parameters in each blueprint
6. **Authentication Testing**: Test both authenticated and unauthenticated access
7. **Parameterized Tests**: Use pytest parameterization for testing similar routes

## Related Documentation

- [TESTING_SUMMARY.md](TESTING_SUMMARY.md): Overview of the entire testing strategy
- [TESTING_FRAMEWORK.md](TESTING_FRAMEWORK.md): Details on the testing framework
- [TESTING_PLAN.md](TESTING_PLAN.md): Testing plan and roadmap