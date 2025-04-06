"""
Pytest Configuration

Global pytest fixtures and configuration.
"""

import pytest
import os
from pathlib import Path

# Add the current directory to sys.path
import sys
sys.path.append(str(Path(__file__).parent))

from utilities.test_data_manager import data_manager
from utilities.setup_test_database import load_fixture_to_database


def pytest_addoption(parser):
    """Add command-line options to pytest."""
    parser.addoption(
        "--fixture",
        default="small_test",
        help="Test fixture to use (small_test, medium_test, large_test, etc.)"
    )
    parser.addoption(
        "--db-path",
        default=None,
        help="Path to the test database (default: tests/test_data/test.db)"
    )
    parser.addoption(
        "--skip-db",
        action="store_true",
        help="Skip database setup for tests"
    )


@pytest.fixture(scope="session")
def test_fixture_name(request):
    """Get the test fixture name from command line."""
    return request.config.getoption("--fixture")


@pytest.fixture(scope="session")
def test_db_path(request):
    """Get the test database path from command line."""
    db_path = request.config.getoption("--db-path")
    if db_path is None:
        db_path = str(Path(__file__).parent / "test_data" / "test.db")
    return db_path


@pytest.fixture(scope="session")
def skip_db(request):
    """Check if database setup should be skipped."""
    return request.config.getoption("--skip-db")


@pytest.fixture(scope="session")
def test_fixture(test_fixture_name):
    """Load the test fixture."""
    return data_manager.get_fixture(test_fixture_name)


@pytest.fixture(scope="session")
def test_db_connection(test_fixture_name, test_db_path, skip_db):
    """Set up the test database."""
    if skip_db:
        yield None
    else:
        conn = load_fixture_to_database(test_fixture_name, test_db_path, overwrite=True)
        yield conn
        conn.close()


@pytest.fixture(scope="function")
def test_database(test_db_connection):
    """Provide the test database connection for tests."""
    return test_db_connection


@pytest.fixture(scope="function")
def test_departments(test_fixture):
    """Provide test departments."""
    departments = []
    for dataset in test_fixture.datasets:
        if dataset.category == "departments":
            departments.extend(dataset.data)
    return departments


@pytest.fixture(scope="function")
def test_stations(test_fixture):
    """Provide test stations."""
    stations = []
    for dataset in test_fixture.datasets:
        if dataset.category == "stations":
            stations.extend(dataset.data)
    return stations


@pytest.fixture(scope="function")
def test_users(test_fixture):
    """Provide test users."""
    users = []
    for dataset in test_fixture.datasets:
        if dataset.category == "users":
            users.extend(dataset.data)
    return users


@pytest.fixture(scope="function")
def test_incidents(test_fixture):
    """Provide test incidents."""
    incidents = []
    for dataset in test_fixture.datasets:
        if dataset.category == "incidents":
            incidents.extend(dataset.data)
    return incidents


@pytest.fixture(scope="function")
def test_department(test_departments):
    """Provide a single test department."""
    return test_departments[0] if test_departments else None


@pytest.fixture(scope="function")
def reset_test_data():
    """Reset the test data manager."""
    data_manager.reset_all()
    yield
    data_manager.reset_all()