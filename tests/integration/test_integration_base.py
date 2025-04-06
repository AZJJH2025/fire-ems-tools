"""
Base class for integration tests.

This module provides a base class for integration tests that integrates with the
test data management system.
"""

import os
import unittest
import sys
from pathlib import Path

# Add the parent directory to sys.path to ensure imports work correctly
sys.path.append(str(Path(__file__).parent.parent))

from utilities.test_data_manager import data_manager


class IntegrationTestBase(unittest.TestCase):
    """Base class for integration tests using the test data management system."""
    
    fixture_name = "small_test"  # Default fixture to use
    
    @classmethod
    def setUpClass(cls):
        """Set up the test fixture for the entire test class."""
        # Allow overriding the fixture name via environment variable
        cls.fixture_name = os.environ.get("TEST_FIXTURE", cls.fixture_name)
        
        # Set up the test data
        data_manager.setup_for_test([cls.fixture_name])
        
        # Get fixtures
        fixture = data_manager.get_fixture(cls.fixture_name)
        
        # Extract data from fixture
        cls.departments = []
        cls.stations = []
        cls.users = []
        cls.incidents = []
        
        for dataset in fixture.datasets:
            if dataset.category == "departments":
                cls.departments.extend(dataset.data)
            elif dataset.category == "stations":
                cls.stations.extend(dataset.data)
            elif dataset.category == "users":
                cls.users.extend(dataset.data)
            elif dataset.category == "incidents":
                cls.incidents.extend(dataset.data)
        
        # Set up database
        cls.db = data_manager.db
        cls.db_conn = cls.db.connect()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests in the class have been run."""
        if hasattr(cls, 'db_conn') and cls.db_conn:
            cls.db_conn.close()
        
        # Reset data manager
        data_manager.reset_all()
    
    def setUp(self):
        """Set up before each test method."""
        # Make sure we have a valid database connection
        if not self.db_conn:
            self.db_conn = self.db.connect()
    
    def tearDown(self):
        """Clean up after each test method."""
        # Commit any changes to ensure they don't affect other tests
        if self.db_conn:
            self.db_conn.commit()


class DepartmentTestCase(IntegrationTestBase):
    """Base class for department-related integration tests."""
    
    def setUp(self):
        """Set up department-specific test data."""
        super().setUp()
        
        # Get the first department for testing
        self.department = self.departments[0] if self.departments else None
        
        # Get stations, users, and incidents for this department
        if self.department:
            dept_id = self.department["id"]
            self.dept_stations = [s for s in self.stations if s["department_id"] == dept_id]
            self.dept_users = [u for u in self.users if u["department_id"] == dept_id]
            self.dept_incidents = [i for i in self.incidents if i["department_id"] == dept_id]


class StationTestCase(DepartmentTestCase):
    """Base class for station-related integration tests."""
    
    def setUp(self):
        """Set up station-specific test data."""
        super().setUp()
        
        # Get the first station for testing
        self.station = self.dept_stations[0] if self.dept_stations else None
        
        # Get users and apparatus for this station
        if self.station:
            station_id = self.station["id"]
            self.station_users = [u for u in self.dept_users if u.get("station_id") == station_id]
            self.station_apparatus = self.station["apparatus"]


class IncidentTestCase(DepartmentTestCase):
    """Base class for incident-related integration tests."""
    
    def setUp(self):
        """Set up incident-specific test data."""
        super().setUp()
        
        # Get the first incident for testing
        self.incident = self.dept_incidents[0] if self.dept_incidents else None
        
        # Get different incident types for testing
        if self.dept_incidents:
            self.ems_incidents = [i for i in self.dept_incidents if i["category"] == "EMS"]
            self.fire_incidents = [i for i in self.dept_incidents if i["category"] == "Fire"]
            self.service_incidents = [i for i in self.dept_incidents if i["category"] == "Service"]