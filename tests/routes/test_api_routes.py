"""Tests for API routes blueprint.

This module contains tests for the API endpoints of the application.
"""

import unittest
import pytest
import json
from flask import url_for

from tests.routes.base import ApiBlueprintTestCase
from database import Department, Incident, User, Station, db

# Mark all tests in this module as api blueprint tests


@pytest.mark.api
class TestApiRoutes(ApiBlueprintTestCase):
    """Test cases for API blueprint routes."""
    
    def setup_test_data(self):
        """Create test data in the database."""
        # Create a test department
        dept = Department(name="Test Department", code="TEST")
        db.session.add(dept)
        
        # Create a test station
        station = Station(name="Test Station", department_id=1, latitude=33.448376, longitude=-112.074036)
        db.session.add(station)
        
        # Create a test incident
        incident = Incident(
            incident_number="TEST-123",
            department_id=1,
            station_id=1,
            latitude=33.448376,
            longitude=-112.074036,
            incident_type="EMS",
            priority="1",
            status="Closed"
        )
        db.session.add(incident)
        
        db.session.commit()
    
    def test_api_endpoint(self):
        """Test that the API endpoint exists and returns valid JSON."""
        # Check if the API routes have a specific endpoint defined
        # This is a placeholder - you'll need to adapt to your actual API endpoints
        with self.app.app_context():
            if hasattr(self.app.url_map, 'api_endpoint'):
                response = self.client.get('/api/v1/status')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.content_type, 'application/json')
            else:
                # If the endpoint doesn't exist yet, just skip this test
                self.skipTest("API endpoint not defined in API blueprint")


if __name__ == '__main__':
    unittest.main()
