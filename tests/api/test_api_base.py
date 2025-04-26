"""
Base class for API tests.

This module provides a base class for API tests that integrates with the
test data management system.
"""

import os
import unittest
import json
import sys
from pathlib import Path
import tempfile
import flask_testing
from flask import Flask

# Add the parent directory to sys.path to ensure imports work correctly
sys.path.append(str(Path(__file__).parent.parent))

from utilities.test_data_manager import data_manager
from utilities.setup_test_database import load_fixture_to_database


class APITestBase(flask_testing.TestCase):
    """Base class for API tests using the test data management system."""
    
    fixture_name = "small_test"  # Default fixture to use
    db_fd = None
    db_path = None
    
    def create_app(self):
        """Create and configure a Flask app for testing."""
        # Import the app from the main module
        sys.path.append(str(Path(__file__).parent.parent.parent))
        from app import app
        
        # Configure the app for testing
        app.config['TESTING'] = True
        app.config['DEBUG'] = False
        
        # Use an in-memory database for testing
        self.db_fd, self.db_path = tempfile.mkstemp()
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{self.db_path}'
        
        # Override the fixture name if specified in an environment variable
        self.fixture_name = os.environ.get("TEST_FIXTURE", self.fixture_name)
        
        return app
    
    def setUp(self):
        """Set up the test fixture."""
        super().setUp()
        
        # Set up the test data
        data_manager.setup_for_test([self.fixture_name])
        
        # Get data from the fixture
        fixture = data_manager.get_fixture(self.fixture_name)
        
        # Extract data from fixture
        self.departments = []
        self.stations = []
        self.users = []
        self.incidents = []
        
        for dataset in fixture.datasets:
            if dataset.category == "departments":
                self.departments.extend(dataset.data)
            elif dataset.category == "stations":
                self.stations.extend(dataset.data)
            elif dataset.category == "users":
                self.users.extend(dataset.data)
            elif dataset.category == "incidents":
                self.incidents.extend(dataset.data)
        
        # Load the fixture into the app's database
        conn = load_fixture_to_database(self.fixture_name, self.db_path, overwrite=True)
        conn.close()
    
    def tearDown(self):
        """Clean up after the test."""
        super().tearDown()
        
        # Reset data manager
        data_manager.reset_all()
        
        # Close and remove the temporary database
        os.close(self.db_fd)
        os.unlink(self.db_path)


class DepartmentAPITestCase(APITestBase):
    """Base class for department-related API tests."""
    
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


class StationAPITestCase(DepartmentAPITestCase):
    """Base class for station-related API tests."""
    
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


class IncidentAPITestCase(DepartmentAPITestCase):
    """Base class for incident-related API tests."""
    
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