# Blueprint Route Tests

This directory contains tests for the Flask blueprint routes of the Fire-EMS Tools application.

## Test Structure

- `base.py` - Contains base test classes for blueprint testing
- `test_main_routes.py` - Tests for the main routes (homepage, basic tool pages)
- `test_auth_routes.py` - Tests for authentication routes (login, logout)
- `test_api_routes.py` - Tests for API endpoints
- `test_dashboards_routes.py` - Tests for dashboard-specific routes
- `test_tools_routes.py` - Tests for tool-specific routes

## Running the Tests

You can run these tests using pytest:

```bash
pytest tests/routes/
```

Or using the provided run_all_tests.py script:

```bash
python run_all_tests.py --feature=routes
```

## Base Test Classes

The base test classes handle common setup and teardown operations:

- `BlueprintTestCase` - Base class for all blueprint tests
- `MainBlueprintTestCase` - For testing main routes
- `AuthBlueprintTestCase` - For testing auth routes
- `ApiBlueprintTestCase` - For testing API routes
- `DashboardsBlueprintTestCase` - For testing dashboard routes
- `ToolsBlueprintTestCase` - For testing tool routes

## Adding New Tests

To add tests for a new route:

1. Choose the appropriate base test class based on the blueprint
2. Create a new test method with a clear name
3. Make requests using `self.client`
4. Assert the expected response

Example:

```python
def test_new_tool_route(self):
    """Test the new tool route."""
    response = self.client.get('/tools/new-tool')
    self.assertEqual(response.status_code, 200)
```
