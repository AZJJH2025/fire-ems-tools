# Fire-EMS Tools Testing Framework

This directory contains a comprehensive testing framework for the Fire-EMS Tools application.

## Overview

The testing framework provides:

1. **Test Data Management**: A system for generating and managing realistic test data
2. **Database Integration**: Tools for setting up and interacting with a test database
3. **Test Fixtures**: Common test fixtures for different test scenarios
4. **Command-Line Tools**: CLI for managing test data and fixtures

## Directory Structure

```
tests/
├── __init__.py
├── README.md                    # This file
├── TEST_DATA_MANAGEMENT.md      # Documentation for test data management
├── conftest.py                  # Pytest configuration and fixtures
├── test_data/                   # Generated test data
│   ├── departments/             # Department data
│   ├── stations/                # Station data
│   ├── users/                   # User data
│   ├── incidents/               # Incident data
│   └── test.db                  # SQLite test database
├── fixtures/                    # Test fixtures
│   └── README.md                # Documentation for fixtures
├── data_generators/             # Data generators
│   ├── __init__.py
│   ├── department_generator.py
│   ├── station_generator.py
│   ├── incident_generator.py
│   ├── user_generator.py
│   └── generate_test_data.py    # Main data generation script
├── utilities/                   # Utility modules
│   ├── __init__.py
│   ├── test_data_manager.py     # Core data management API
│   └── setup_test_database.py   # Database setup utility
├── test_data_cli.py             # Command-line interface
└── test_data_usage_example.py   # Example of using test data
```

## Test Data Management

The test data management system provides tools for creating and using realistic test data. See [TEST_DATA_MANAGEMENT.md](TEST_DATA_MANAGEMENT.md) for details.

### Quick Start

```python
# Using the test data manager
from tests.utilities.test_data_manager import data_manager

# Load a dataset
departments = data_manager.get_dataset("small_test_departments", "departments")

# Load a fixture
fixture = data_manager.get_fixture("small_test")

# Set up for a test with specific fixtures
data_manager.setup_for_test(["small_test"])

# Access the test database
db = data_manager.db
```

## Using with pytest

The `conftest.py` file provides fixtures for pytest:

```python
# Example test using pytest fixtures
def test_department_api(test_department, test_database):
    """Test department API."""
    assert test_department is not None
    assert "name" in test_department
    assert "type" in test_department
```

### Running Tests

```bash
# Run tests with default fixture (small_test)
pytest

# Run tests with a specific fixture
pytest --fixture=medium_test

# Run tests with a custom database path
pytest --db-path=/tmp/custom_test.db

# Skip database setup (if you already have a database)
pytest --skip-db
```

## Command-Line Interface

The `test_data_cli.py` script provides a command-line interface for working with test data:

```bash
# List available datasets
python tests/test_data_cli.py list-datasets

# List available fixtures
python tests/test_data_cli.py list-fixtures

# Show dataset contents
python tests/test_data_cli.py show-dataset departments small_test_departments

# Show fixture contents
python tests/test_data_cli.py show-fixture small_test

# Generate standard test fixtures
python tests/test_data_cli.py generate

# Generate custom dataset
python tests/test_data_cli.py generate-custom --name custom --departments 2 --stations 4 --users 15 --incidents 200

# Create test database from fixture
python tests/test_data_cli.py create-db small_test --overwrite
```

## Available Fixtures

See the [fixtures/README.md](fixtures/README.md) for details on available fixtures.

## Generating Test Data

You can generate test data using the `generate_test_data.py` script:

```bash
# Generate standard test fixtures
python tests/data_generators/generate_test_data.py --standard

# Generate custom dataset
python tests/data_generators/generate_test_data.py --name custom --departments 2 --stations 4 --users 15 --incidents 200
```

## Best Practices

1. **Use fixtures for consistency**: Use the standard fixtures for most tests to ensure consistency.

2. **Reset between tests**: Call `data_manager.reset_all()` between tests to avoid state leakage, or use the `reset_test_data` fixture.

3. **Use seed values for reproducibility**: When generating custom data, use a seed value for reproducible results.

4. **Separate test data from application code**: Keep test data in the `tests/test_data` directory, separate from application code.

5. **Use the CLI for exploration**: Use the CLI to explore available datasets and fixtures.

6. **Create specialized fixtures for specific tests**: For tests with specific data requirements, create specialized fixtures.