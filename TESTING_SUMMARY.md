# Fire-EMS Tools Testing Framework

This document provides an overview of the testing framework for the Fire-EMS Tools application.

## Testing Approach

Our testing strategy is built around four key principles:

1. **Environment Independence**: Tests should run in any environment without external dependencies
2. **Comprehensive Coverage**: Tests should cover all functionality, edge cases, and error conditions
3. **CI/CD Integration**: Tests should integrate with continuous integration and deployment systems
4. **User-focused Validation**: Tests should validate the application from a user's perspective

## Testing Layers

### 1. Blueprint Route Tests

Blueprint route tests focus on testing the Flask blueprint routes used to modularize the application. This ensures that each module's routes function correctly and handle errors appropriately.

**Key Features:**
- Base test classes for each blueprint (main, auth, api, dashboards, tools)
- In-memory SQLite database for testing with real database models
- Route existence and response validation
- Content type verification and basic content validation
- Error handling validation

**Test Files:**
- `tests/routes/test_main_routes.py`: Tests for main page routes
- `tests/routes/test_auth_routes.py`: Tests for authentication routes
- `tests/routes/test_api_routes.py`: Tests for API endpoints
- `tests/routes/test_dashboards_routes.py`: Tests for dashboard routes
- `tests/routes/test_tools_routes.py`: Tests for tool-specific routes

**Running Blueprint Tests:**
```
python run_all_tests.py --feature=routes
python tests/routes/run_blueprint_tests.py
```

**Documentation:** [BLUEPRINT_TESTS.md](BLUEPRINT_TESTS.md)

### 2. Simplified Tests

Simplified tests use a base test class (`SimpleDepartmentTestBase`) that provides mock departments, users, and data. This approach allows tests to run in any environment without external dependencies.

**Key Features:**
- Mock departments with configurable features and permissions
- In-memory data storage to avoid database dependencies
- Flask test client for simulating HTTP requests
- Environment-agnostic execution

**Test Files:**
- `test_departments_simplified.py`: Base class for simplified tests
- `test_incident_logger_simplified.py`: Tests for Incident Logger feature
- `test_call_density_simplified.py`: Tests for Call Density Heatmap feature
- `test_isochrone_map_simplified.py`: Tests for Isochrone Map feature
- `test_response_time_simplified.py`: Tests for Response Time Analysis feature
- `test_station_overview_simplified.py`: Tests for Station Overview feature
- `test_fire_map_pro_simplified.py`: Tests for Fire Map Pro feature
- `test_data_formatter_simplified.py`: Tests for Data Formatter feature

**Running Simplified Tests:**
```
python run_all_tests.py --category simplified
```

**Documentation:** [SIMPLIFIED_TESTS.md](SIMPLIFIED_TESTS.md)

### 2. Error and Boundary Testing

Error and boundary tests focus on how the application handles abnormal conditions, edge cases, and invalid inputs.

**Error Testing:**
- Service failures and network issues
- Authentication and authorization errors
- Invalid input handling
- Resource constraints

**Boundary Testing:**
- Extreme inputs (very large/small values)
- Empty or null inputs
- Edge cases in business logic
- Resource limitations

**Test Files:**
- `test_error_conditions.py`: Tests for error conditions
- `test_api_errors.py`: Tests for API-specific errors
- `test_boundary_conditions.py`: Tests for boundary conditions

**Running Error and Boundary Tests:**
```
python run_all_tests.py --category error
python run_all_tests.py --category boundary
```

**Documentation:** [ERROR_TESTING.md](ERROR_TESTING.md)

### 3. Docker Testing

Docker-based testing ensures consistent test environments across different platforms and development machines.

**Key Features:**
- Dockerfile for reproducible test environment
- docker-compose.yml for multi-container test setup
- Easy test execution with run_docker_tests.sh
- CI/CD integration

**Docker Configuration:**
- `Dockerfile`: Container definition for testing environment
- `docker-compose.yml`: Multi-container setup for different test types
- `run_docker_tests.sh`: Script for executing tests in Docker

**Running Docker Tests:**
```
./run_docker_tests.sh
```

**Documentation:** [DOCKER_TESTING.md](DOCKER_TESTING.md)

### 4. End-to-End Testing

End-to-end (E2E) tests validate the application from a user's perspective, ensuring all components work together correctly.

**Key Features:**
- Browser automation with Playwright
- Tests for critical user flows
- Fixtures for different user roles
- CI/CD integration

**Test Files:**
- `e2e/tests/auth.spec.js`: Authentication tests
- `e2e/tests/incident-logger.spec.js`: Tests for Incident Logger feature
- `e2e/tests/call-density.spec.js`: Tests for Call Density Heatmap feature

**Running E2E Tests:**
```
./run_e2e_tests.sh
```

**Documentation:** [E2E_TESTING.md](E2E_TESTING.md)

## CI/CD Integration

Our CI/CD pipeline integrates all testing layers to ensure code quality and reliability:

**GitHub Actions Workflow:**
- Runs on every push to main and pull requests
- Tests multiple Python versions (3.10, 3.11, 3.12)
- Executes simplified, error, boundary, and E2E tests
- Generates and stores test reports
- Blocks PRs with failing tests

**Configuration:**
- `.github/workflows/ci.yml`: GitHub Actions workflow definition

## Test Data Management

We use a dedicated script for setting up test data:

**Key Features:**
- `setup_test_database.py`: Script for creating test database and data
- Generates realistic test data for departments, stations, users, and incidents
- Supports CSV export for data portability
- Creates consistent test data across environments

## Performance Testing

Performance tests evaluate the application's performance under various conditions:

**Key Aspects:**
- Load testing with concurrent users
- Response time measurements
- Resource utilization monitoring
- Scalability assessment

**Examples:**
- `test_examples/test_performance_specific.py`: Example of performance testing

## Security Testing

Security tests focus on authentication, authorization, and data protection:

**Key Aspects:**
- Authentication and session management
- Authorization and access control
- Input validation and sanitization
- XSS and CSRF prevention
- SQL injection prevention
- Rate limiting and brute force protection
- HIPAA compliance requirements

**Test Files:**
- `e2e/tests/security.spec.js`: End-to-end security tests
- `test_examples/test_incident_authentication_errors.py`: Example of authentication error testing

**Running Security Tests:**
```
./run_e2e_tests.sh --test-match="security.spec.js"
```

**Documentation:** [SECURITY_TESTING.md](SECURITY_TESTING.md)

## Test Coverage Analysis

Test coverage analysis measures how much of the codebase is exercised by our tests:

**Key Features:**
- Line-by-line coverage tracking
- HTML reports with visual highlighting
- XML reports for CI integration
- Coverage threshold enforcement
- Exclusion of test code and utilities

**Tools:**
- `run_coverage.py`: Script for running tests with coverage analysis
- `.coveragerc`: Configuration for coverage reporting

**Running Coverage Analysis:**
```
./run_coverage.py --categories all --html --xml
```

**Documentation:** [COVERAGE_TESTING.md](COVERAGE_TESTING.md)

## Accessibility Testing

Accessibility tests ensure the application is usable by people with disabilities:

**Key Features:**
- Automated accessibility checks with Axe
- WCAG 2.1 AA compliance validation
- Color contrast verification
- Keyboard navigation testing
- Screen reader compatibility testing
- Focus management validation

**Test Files:**
- `e2e/tests/accessibility.spec.js`: Automated accessibility tests

**Running Accessibility Tests:**
```
./run_e2e_tests.sh --test-type=accessibility
```

**Documentation:** [ACCESSIBILITY_TESTING.md](ACCESSIBILITY_TESTING.md)

## Responsive Design Testing

Responsive design tests ensure the application works well across different device sizes:

**Key Features:**
- Automated testing on multiple device sizes
- Mobile, tablet, and desktop viewport testing
- Layout validation across breakpoints
- Touch interaction verification
- Visual regression capturing (screenshots)
- Orientation change testing

**Test Files:**
- `e2e/tests/responsive.spec.js`: Responsive design tests

**Running Responsive Tests:**
```
./run_e2e_tests.sh --test-type=responsive
```

**Documentation:** [RESPONSIVE_TESTING.md](RESPONSIVE_TESTING.md)

## Test Execution and Reporting

Test execution and reporting is streamlined through various scripts:

- `run_all_tests.py`: Executes tests by category
- `run_docker_tests.sh`: Runs tests in Docker containers
- `run_e2e_tests.sh`: Executes end-to-end tests
- `run_coverage.py`: Runs tests with coverage analysis
- HTML and JSON test reports for simplified analysis
- Coverage reports in HTML and XML formats

## Best Practices

1. **Independence**: Each test should be independent and not rely on other tests
2. **Isolation**: Tests should clean up after themselves and not affect the environment
3. **Determinism**: Tests should produce the same results on each run
4. **Clarity**: Test names and assertions should clearly indicate what's being tested
5. **Maintainability**: Tests should be easy to maintain and update as the application evolves