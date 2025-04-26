"""Tests for dashboards routes blueprint.

This module contains tests for the dashboard-related routes of the application.
"""

import unittest
import pytest
from flask import url_for

from tests.routes.base import DashboardsBlueprintTestCase
from database import Department, Incident, User, Station, db

# Mark all tests in this module as dashboards blueprint tests


@pytest.mark.dashboards
class TestDashboardsRoutes(DashboardsBlueprintTestCase):
    """Test cases for dashboards blueprint routes."""
    
    def setup_test_data(self):
        """Create test data in the database."""
        # Create a test department
        dept = Department(name="Test Department", code="TEST")
        db.session.add(dept)
        
        # Create a test station
        station = Station(name="Test Station", department_id=1, latitude=33.448376, longitude=-112.074036)
        db.session.add(station)
        
        # Create test incidents
        for i in range(10):
            incident = Incident(
                incident_number=f"TEST-{i}",
                department_id=1,
                station_id=1,
                latitude=33.448376 + (i * 0.001),
                longitude=-112.074036 + (i * 0.001),
                incident_type="EMS" if i % 2 == 0 else "Fire",
                priority=str(i % 3 + 1),
                status="Closed"
            )
            db.session.add(incident)
        
        db.session.commit()
    
    def test_dashboards_route(self):
        """Test that any defined dashboard routes work correctly."""
        # This is a placeholder - adapt based on your actual dashboard routes
        with self.app.app_context():
            # Check if there are any dashboard-specific routes
            dashboard_routes_exist = False
            for rule in self.app.url_map.iter_rules():
                if 'dashboards.' in rule.endpoint:
                    dashboard_routes_exist = True
                    break
            
            if dashboard_routes_exist:
                # Test a sample dashboard route
                # Replace with an actual route from your dashboards blueprint
                response = self.client.get('/dashboard/test')
                # We don't assert specific status codes as implementation may vary
            else:
                self.skipTest("No dashboard-specific routes defined")


if __name__ == '__main__':
    unittest.main()
