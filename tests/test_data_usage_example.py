"""
Test Data Usage Example

Examples of how to use the test data management system in tests.
This version doesn't require pytest to run.
"""

import sys
import json
import sqlite3
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent))

from utilities.test_data_manager import data_manager
from utilities.setup_test_database import load_fixture_to_database


def get_test_department():
    """Provide a test department."""
    department = data_manager.get_dataset("small_test_departments", "departments").data[0]
    return department


def get_test_stations():
    """Provide test stations for a department."""
    stations = data_manager.get_dataset("small_test_department_1_stations", "stations").data
    return stations


def get_test_users():
    """Provide test users for a department."""
    users = data_manager.get_dataset("small_test_department_1_users", "users").data
    return users


def get_test_incidents():
    """Provide test incidents for a department."""
    incidents = data_manager.get_dataset("small_test_department_1_incidents", "incidents").data
    return incidents


def get_test_database():
    """Provide a test database with sample data."""
    # Use the small_test fixture
    db_path = str(Path(__file__).parent / "test_data" / "test.db")
    conn = load_fixture_to_database("small_test", db_path, overwrite=True)
    return conn


def test_department_data():
    """Test that department data is loaded correctly."""
    department = get_test_department()
    assert department is not None, "Department should not be None"
    assert "name" in department, "Department should have a name"
    assert "type" in department, "Department should have a type"
    assert "size" in department, "Department should have a size"
    print(f"Department: {department['name']} ({department['type']}, {department['size']})")


def test_station_data():
    """Test that station data is loaded correctly."""
    stations = get_test_stations()
    assert len(stations) > 0, "Should have at least one station"
    for station in stations:
        assert "name" in station, "Station should have a name"
        assert "department_id" in station, "Station should have a department_id"
        assert "apparatus" in station, "Station should have apparatus"
        assert isinstance(station["apparatus"], list), "Apparatus should be a list"
    
    print(f"Stations: {len(stations)}")
    for station in stations:
        print(f"  - {station['name']}: {len(station['apparatus'])} apparatus")


def test_user_data():
    """Test that user data is loaded correctly."""
    users = get_test_users()
    assert len(users) > 0, "Should have at least one user"
    for user in users:
        assert "username" in user, "User should have a username"
        assert "first_name" in user, "User should have a first_name"
        assert "last_name" in user, "User should have a last_name"
        assert "role" in user, "User should have a role"
    
    print(f"Users: {len(users)}")
    for user in users[:3]:  # Show first 3 users
        print(f"  - {user['first_name']} {user['last_name']} ({user['role']})")
    if len(users) > 3:
        print(f"  - ... and {len(users) - 3} more")


def test_incident_data():
    """Test that incident data is loaded correctly."""
    incidents = get_test_incidents()
    assert len(incidents) > 0, "Should have at least one incident"
    for incident in incidents:
        assert "type" in incident, "Incident should have a type"
        assert "category" in incident, "Incident should have a category"
        assert "priority" in incident, "Incident should have a priority"
        assert "location" in incident, "Incident should have a location"
        assert "units" in incident, "Incident should have units"
    
    print(f"Incidents: {len(incidents)}")
    # Count incidents by category
    categories = {}
    for incident in incidents:
        category = incident["category"]
        if category not in categories:
            categories[category] = 0
        categories[category] += 1
    
    for category, count in categories.items():
        print(f"  - {category}: {count} incidents")


def test_database_connection():
    """Test that database connection works."""
    conn = get_test_database()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    assert len(tables) >= 4, "Should have at least 4 tables"
    
    table_names = [table[0] for table in tables]
    assert "departments" in table_names, "Should have departments table"
    assert "stations" in table_names, "Should have stations table"
    assert "users" in table_names, "Should have users table"
    assert "incidents" in table_names, "Should have incidents table"
    
    print("Database Tables:")
    for table in table_names:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"  - {table}: {count} rows")
    
    conn.close()


def test_database_queries():
    """Test querying the database."""
    conn = get_test_database()
    cursor = conn.cursor()
    
    # Test departments table
    cursor.execute("SELECT COUNT(*) FROM departments")
    count = cursor.fetchone()[0]
    assert count > 0, "Should have at least one department"
    
    # Test stations table
    cursor.execute("SELECT COUNT(*) FROM stations")
    count = cursor.fetchone()[0]
    assert count > 0, "Should have at least one station"
    
    # Test users table
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    assert count > 0, "Should have at least one user"
    
    # Test incidents table
    cursor.execute("SELECT COUNT(*) FROM incidents")
    count = cursor.fetchone()[0]
    assert count > 0, "Should have at least one incident"
    
    print("Database Query Tests: All passed")
    
    conn.close()


def test_json_fields():
    """Test JSON fields in the database."""
    conn = get_test_database()
    cursor = conn.cursor()
    
    # Test station location field
    cursor.execute("SELECT location FROM stations LIMIT 1")
    location_json = cursor.fetchone()[0]
    location = json.loads(location_json)
    assert "latitude" in location, "Location should have latitude"
    assert "longitude" in location, "Location should have longitude"
    
    # Test incident units field
    cursor.execute("SELECT units FROM incidents LIMIT 1")
    units_json = cursor.fetchone()[0]
    units = json.loads(units_json)
    assert isinstance(units, list), "Units should be a list"
    assert len(units) > 0, "Should have at least one unit"
    assert "unit_id" in units[0], "Unit should have unit_id"
    
    print("JSON Field Tests:")
    print(f"  - Station location: {location['latitude']}, {location['longitude']}")
    print(f"  - Incident units: {len(units)} units")
    
    conn.close()


def test_database_relationships():
    """Test database relationships."""
    conn = get_test_database()
    cursor = conn.cursor()
    
    # Get a department ID
    cursor.execute("SELECT id FROM departments LIMIT 1")
    department_id = cursor.fetchone()[0]
    
    # Check that stations reference the department
    cursor.execute(f"SELECT COUNT(*) FROM stations WHERE department_id = ?", (department_id,))
    station_count = cursor.fetchone()[0]
    assert station_count > 0, "Should have at least one station for department"
    
    # Check that users reference the department
    cursor.execute(f"SELECT COUNT(*) FROM users WHERE department_id = ?", (department_id,))
    user_count = cursor.fetchone()[0]
    assert user_count > 0, "Should have at least one user for department"
    
    # Check that incidents reference the department
    cursor.execute(f"SELECT COUNT(*) FROM incidents WHERE department_id = ?", (department_id,))
    incident_count = cursor.fetchone()[0]
    assert incident_count > 0, "Should have at least one incident for department"
    
    print("Database Relationship Tests:")
    print(f"  - Department {department_id} has:")
    print(f"    - {station_count} stations")
    print(f"    - {user_count} users")
    print(f"    - {incident_count} incidents")
    
    conn.close()


def run_tests():
    """Run all tests."""
    tests = [
        test_department_data,
        test_station_data,
        test_user_data,
        test_incident_data,
        test_database_connection,
        test_database_queries,
        test_json_fields,
        test_database_relationships
    ]
    
    success = True
    for test in tests:
        try:
            print(f"\n=== Running {test.__name__} ===")
            test()
            print(f"✅ {test.__name__} passed")
        except AssertionError as e:
            print(f"❌ {test.__name__} failed: {e}")
            success = False
        except Exception as e:
            print(f"❌ {test.__name__} error: {e}")
            success = False
    
    return success


if __name__ == "__main__":
    print("=== Test Data Usage Example ===\n")
    success = run_tests()
    
    if success:
        print("\n✅ All tests passed")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed")
        sys.exit(1)