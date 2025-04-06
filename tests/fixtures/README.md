# Test Fixtures

This directory contains test fixtures for the Fire-EMS Tools application.

## What are Fixtures?

Fixtures are pre-defined sets of test data that can be used across different test types. They provide a consistent baseline for testing application functionality.

## Available Fixtures

- `small_test`: Small dataset with 1 department, 3 stations, 10 users, and 50 incidents. Suitable for unit tests.
- `medium_test`: Medium dataset with 2 departments, 5 stations per department, 20 users per department, and 100 incidents per department. Suitable for integration tests.
- `large_test`: Large dataset with 5 departments, 10 stations per department, 50 users per department, and 500 incidents per department. Suitable for performance tests.
- `heatmap_test`: Specialized dataset with 1000 incidents clustered in specific areas. Suitable for testing call density heatmap.

## Using Fixtures

Fixtures can be loaded using the `TestDataManager`:

```python
from tests.utilities.test_data_manager import data_manager

# Load a fixture
fixture = data_manager.get_fixture("small_test")

# Set up for a test with a specific fixture
data_manager.setup_for_test(["small_test"])
```

Or using the CLI:

```bash
# Show fixture contents
python tests/test_data_cli.py show-fixture small_test

# Create test database from fixture
python tests/test_data_cli.py create-db small_test --overwrite
```

## Creating Custom Fixtures

You can create custom fixtures using the `generate_complete_dataset` function:

```python
from tests.data_generators.generate_test_data import generate_complete_dataset

# Generate a complete dataset
generate_complete_dataset(
    name="custom_test",
    department_count=2,
    stations_per_department=3,
    users_per_department=10,
    incidents_per_department=50,
    seed=123  # Optional: for reproducible generation
)
```

Or using the CLI:

```bash
python tests/test_data_cli.py generate-custom --name custom --departments 2 --stations 4 --users 15 --incidents 200
```

## Fixture Format

Fixtures are stored as JSON files with the following structure:

```json
{
  "name": "fixture_name",
  "metadata": {
    "created": "2023-01-01T00:00:00.000000",
    "id": "00000000-0000-0000-0000-000000000000",
    "version": "1.0",
    "dataset_ids": [...]
  },
  "datasets": [
    {"name": "dataset_name", "category": "dataset_category"},
    ...
  ]
}
```

The actual data is stored in the corresponding dataset files in the `test_data` directory.