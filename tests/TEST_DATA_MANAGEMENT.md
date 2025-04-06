# Test Data Management

This document describes the test data management system for the Fire-EMS Tools application.

## Overview

The test data management system provides a comprehensive solution for creating, managing, and using test data across different test types. It includes:

- Realistic data generators for departments, stations, users, and incidents
- A consistent API for accessing test data
- Fixtures for common test scenarios
- Database integration for testing with a real database
- CLI tools for working with test data

## Directory Structure

```
tests/
├── __init__.py
├── test_data/                  # Generated test data
│   ├── departments/            # Department data
│   ├── stations/               # Station data
│   ├── users/                  # User data
│   ├── incidents/              # Incident data
│   └── test.db                 # SQLite test database
├── fixtures/                   # Test fixtures
├── data_generators/            # Data generators
│   ├── __init__.py
│   ├── department_generator.py
│   ├── station_generator.py
│   ├── incident_generator.py
│   ├── user_generator.py
│   └── generate_test_data.py   # Main data generation script
├── utilities/                  # Utility modules
│   ├── __init__.py
│   ├── test_data_manager.py    # Core data management API
│   └── setup_test_database.py  # Database setup utility
└── test_data_cli.py            # Command-line interface
```

## Data Generators

The system includes generators for creating realistic test data:

- `department_generator.py`: Generates fire/EMS departments with realistic properties
- `station_generator.py`: Generates fire/EMS stations with apparatus and staffing
- `incident_generator.py`: Generates incidents with realistic distributions and properties
- `user_generator.py`: Generates users with appropriate roles and permissions

## Test Data Manager

The `TestDataManager` class provides a unified API for accessing test data:

- `TestDataSet`: Represents a named dataset with metadata
- `TestFixture`: Represents a collection of datasets for a test scenario
- `TestDatabase`: Manages a SQLite database for tests

## Using Test Data in Tests

### Basic Usage

```python
from tests.utilities.test_data_manager import data_manager

# Load a dataset
departments = data_manager.get_dataset("small_test_departments", "departments")
print(f"Loaded {len(departments.data)} departments")

# Load a fixture
fixture = data_manager.get_fixture("small_test")
print(f"Loaded fixture with {len(fixture.datasets)} datasets")

# Set up for a test with specific fixtures
data_manager.setup_for_test(["small_test"])

# Access the test database
db = data_manager.db
conn = db.connect()
```

### Using with pytest

```python
import pytest
from tests.utilities.test_data_manager import data_manager

@pytest.fixture(scope="function")
def test_database():
    """Provide a test database with sample data."""
    data_manager.setup_for_test(["small_test"])
    yield data_manager.db
    data_manager.reset_all()

def test_incident_query(test_database):
    """Test querying incidents from the database."""
    conn = test_database.connect()
    cursor = conn.execute("SELECT * FROM incidents LIMIT 5")
    incidents = cursor.fetchall()
    assert len(incidents) == 5
```

## Command-line Interface

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

## Creating Custom Test Data

### Using the CLI

You can generate custom test data using the CLI:

```bash
python tests/test_data_cli.py generate-custom --name "my_test" --departments 1 --stations 5 --users 20 --incidents 100
```

### Using the API

You can also generate test data programmatically:

```python
from tests.data_generators.generate_test_data import generate_complete_dataset

# Generate a complete dataset
dataset = generate_complete_dataset(
    name="custom_test",
    department_count=2,
    stations_per_department=3,
    users_per_department=10,
    incidents_per_department=50,
    seed=123  # Optional: for reproducible generation
)
```

## Standard Test Fixtures

The system includes several standard test fixtures:

- `small_test`: Small dataset with 1 department, suitable for unit tests
- `medium_test`: Medium dataset with 2 departments, suitable for integration tests
- `large_test`: Large dataset with 5 departments, suitable for performance tests
- `heatmap_test`: Specialized dataset for testing call density heatmap

## Database Integration

For tests that require a database, you can use the `setup_test_database.py` utility:

```python
from tests.utilities.setup_test_database import load_fixture_to_database

# Create a test database from a fixture
conn = load_fixture_to_database("small_test", "tests/test_data/custom.db", overwrite=True)
```

## Best Practices

1. **Use fixtures for consistency**: Use the standard fixtures for most tests to ensure consistency.

2. **Reset between tests**: Call `data_manager.reset_all()` between tests to avoid state leakage.

3. **Use seed values for reproducibility**: When generating custom data, use a seed value for reproducible results.

4. **Separate test data from application code**: Keep test data in the `tests/test_data` directory, separate from application code.

5. **Use the CLI for exploration**: Use the CLI to explore available datasets and fixtures.

6. **Create specialized fixtures for specific tests**: For tests with specific data requirements, create specialized fixtures.

## Extending the System

To extend the system with new data types:

1. Create a new generator in the `data_generators` directory
2. Update `generate_test_data.py` to include the new data type
3. Update `setup_test_database.py` with the appropriate database schema
4. Update the `test_data_cli.py` to include the new data type