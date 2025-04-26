# Docker Testing Environment for Fire-EMS Tools

This document describes how to use the Docker-based testing environment for Fire-EMS Tools.

## Overview

The Fire-EMS Tools Docker test environment provides a consistent and reproducible way to run tests. It includes:

- A Docker container with all required dependencies
- An automatically generated test database
- Configuration for running different types of tests
- Volume mapping for viewing test results

## Requirements

- Docker
- Docker Compose
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/AZJJH2025/fire-ems-tools.git
   cd fire-ems-tools
   ```

2. Build and run all tests:
   ```bash
   ./run_docker_tests.sh
   ```

## Running Specific Test Types

The script supports running different types of tests:

```bash
# Run simplified tests only
./run_docker_tests.sh simplified

# Run error condition tests only
./run_docker_tests.sh error

# Run boundary condition tests only
./run_docker_tests.sh boundary

# Run performance tests
./run_docker_tests.sh performance

# Start the application
./run_docker_tests.sh app

# Clean up containers and volumes
./run_docker_tests.sh clean
```

## Test Results

Test results are stored in the `test-results` directory, which is mapped as a volume in the Docker container. This allows you to view the results even after the container has stopped.

## Docker Environment

The Docker environment includes:

- Python 3.10 with all required dependencies
- SQLite database for testing
- Test data generated using `setup_test_database.py`
- All application code and test files

## Container Structure

The Docker Compose file defines several services:

- `app`: Runs the Fire-EMS Tools application
- `test`: Runs simplified tests
- `test-error`: Runs error condition tests
- `test-boundary`: Runs boundary condition tests
- `test-performance`: Runs performance tests

Each service uses the same Docker image but with different commands.

## Customizing the Environment

### Adding Dependencies

If you need to add dependencies, update the `requirements.txt` file and rebuild the Docker image:

```bash
docker-compose build
```

### Modifying Test Data

The test database is automatically generated using `setup_test_database.py`. If you need to modify the test data:

1. Edit `setup_test_database.py`
2. Rebuild the Docker image:
   ```bash
   docker-compose build
   ```

### Running Custom Test Commands

You can run custom test commands inside the Docker container:

```bash
docker-compose run --rm test python run_all_tests.py --feature=incident_logger_simplified
```

## Continuous Integration

The Docker environment is designed to work with CI/CD systems. You can use the same Docker Compose file in your CI/CD pipeline.

Example GitHub Actions workflow:

```yaml
name: Docker Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker
      uses: docker/setup-buildx-action@v2
    
    - name: Run tests
      run: ./run_docker_tests.sh
```

## Troubleshooting

### Tests Failing

If tests are failing, you can access the logs:

```bash
docker-compose logs test
```

### Database Issues

If you suspect database issues, you can reset the test database:

```bash
docker-compose run --rm test python setup_test_database.py --force
```

### Container Access

To access a running container for debugging:

```bash
docker exec -it fire-ems-tools-test bash
```

## Best Practices

1. Always run tests in the Docker environment before committing changes
2. Keep the Docker image up to date with dependencies
3. Use volumes for persistent test data
4. Use the same Docker image for development and CI/CD
5. Regularly clean up old containers and volumes

## Support

For issues with the Docker environment, please create an issue in the GitHub repository.