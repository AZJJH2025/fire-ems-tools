# Fire-EMS Tools

A comprehensive suite of tools for Fire and EMS departments to manage incidents, visualize response data, and improve operational efficiency.

## Features

- **Incident Logger**: A HIPAA-compliant tool for logging and managing emergency incidents
- **Call Density Heatmap**: Visualize call volume across your service area
- **Isochrone Map**: Analyze response times and coverage areas
- **Station Overview**: Track station performance and resource utilization
- **Response Time Analysis**: Analyze response time data across your jurisdiction
- **Fire Map Pro**: Advanced mapping tools for fire departments
- **Data Formatter**: Tools for importing, cleaning, and normalizing data

## Architecture

The application uses a modern architecture with:

- **Backend**: Flask-based Python application
- **Frontend**: 
  - ES6 modules bundled with webpack
  - Component-based architecture
  - Proper separation of concerns
- **Storage**: 
  - Client-side localStorage for offline capability
  - Server-side SQLite database for persistence

## Getting Started

### Prerequisites

- Python 3.10 or later
- Required Python packages (see requirements.txt)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fire-ems-tools.git
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Install JavaScript dependencies (for ES6 module support):
   ```
   npm install
   ```

4. Build the JavaScript bundles:
   ```
   npm run build
   ```

5. Run the application:
   ```
   python app.py
   ```

### Development Workflow

For active development with automatic rebuilding of JavaScript:

```
npm run watch
```

This will watch for changes in JavaScript files and automatically rebuild the bundles.

## Testing Framework

This project includes a comprehensive testing framework with multiple testing approaches:

### Simplified Tests

Simplified tests use mock data and dependencies to ensure tests can run in any environment without external dependencies:

```
python run_all_tests.py --category simplified
```

Documentation: [SIMPLIFIED_TESTS.md](SIMPLIFIED_TESTS.md)

### Error and Boundary Testing

Tests that verify the application handles errors and edge cases correctly:

```
python run_all_tests.py --category error
python run_all_tests.py --category boundary
```

Documentation: [ERROR_TESTING.md](ERROR_TESTING.md)

### Docker Testing

Run tests in a containerized environment for consistency across platforms:

```
./run_docker_tests.sh
```

Documentation: [DOCKER_TESTING.md](DOCKER_TESTING.md)

### End-to-End Testing

Browser-based tests that validate the application from a user's perspective:

```
./run_e2e_tests.sh
```

Documentation: [E2E_TESTING.md](E2E_TESTING.md)

### Security Testing

Tests that validate application security and vulnerability mitigation:

```
./run_e2e_tests.sh --test-match="security.spec.js"
```

Documentation: [SECURITY_TESTING.md](SECURITY_TESTING.md)

### Test Coverage Analysis

Analyzes which parts of the code are covered by tests:

```
./run_coverage.py --categories all --html
```

Documentation: [COVERAGE_TESTING.md](COVERAGE_TESTING.md)

### Accessibility Testing

Validates application compliance with WCAG accessibility standards:

```
./run_e2e_tests.sh --test-type=accessibility
```

Documentation: [ACCESSIBILITY_TESTING.md](ACCESSIBILITY_TESTING.md)

### Responsive Design Testing

Ensures the application works well across different device sizes:

```
./run_e2e_tests.sh --test-type=responsive
```

Documentation: [RESPONSIVE_TESTING.md](RESPONSIVE_TESTING.md)

## CI/CD Integration

The project includes GitHub Actions workflows for continuous integration and deployment:

- Automated testing on pull requests and pushes to main branch
- Support for Python 3.10, 3.11, and 3.12
- End-to-end testing with Playwright
- Test report generation and artifact storage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.