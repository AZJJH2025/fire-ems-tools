#!/usr/bin/env python3
"""
Call Density Heatmap Testing Module

This module provides comprehensive testing for the Call Density Heatmap feature.
It validates functionality across different department configurations.

Usage:
    python test_call_density.py [--verbose] [--department CODE]
"""

import os
import sys
import json
import argparse
import unittest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import application modules
try:
    from app import app, register_routes
    from database import Department, User, Station, Incident, db
    from test_departments import DepartmentTestBase
    from flask_login import LoginManager, login_user, current_user
    from flask import session
except ImportError:
    print("Error: Could not import required modules.")
    print("Make sure you're running this script from the project root directory.")
    sys.exit(1)


class CallDensityUITests(DepartmentTestBase):
    """Tests for the Call Density Heatmap user interface"""
    
    def test_call_density_page_load(self):
        """Test that the call density page loads for enabled departments"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('call_density', False):
                continue
                
            client = self.get_admin_client(code)
            response = client.get(f'/call-density-heatmap')
            
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            
            # Verify essential UI components
            self.assertIn("Call Density", html)
            self.assertIn("Heatmap", html)
            self.assertIn("map", html.lower())
    
    def test_call_density_filter_controls(self):
        """Test that filter controls are present on the call density page"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('call_density', False):
                continue
                
            client = self.get_admin_client(code)
            response = client.get(f'/call-density-heatmap')
            
            html = response.data.decode('utf-8')
            
            # Check for essential filter controls
            filter_elements = [
                "date",
                "filter",
                "incident_type",
                "time"
            ]
            
            for element in filter_elements:
                self.assertIn(element, html.lower(), f"Filter element {element} missing in {dept.name} call density page")


class CallDensityFunctionalTests(DepartmentTestBase):
    """Tests for Call Density Heatmap functionality"""
    
    def test_incident_data_availability(self):
        """Test that incident data is available for the heatmap"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('call_density', False):
                continue
            
            # Check if there are incidents for this department
            incidents = self.session.query(Incident).filter_by(department_id=dept.id).count()
            self.assertGreater(incidents, 0, f"No incidents found for {dept.name}")
            
            # Check if incidents have coordinates for mapping
            incidents_with_coords = self.session.query(Incident).filter_by(department_id=dept.id).filter(
                Incident.latitude.isnot(None), 
                Incident.longitude.isnot(None)
            ).count()
            
            self.assertGreater(incidents_with_coords, 0, 
                              f"No incidents with coordinates found for {dept.name}")
    
    def test_heatmap_data_endpoint(self):
        """Test the API endpoint that provides heatmap data"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('call_density', False):
                continue
                
            client = self.get_admin_client(code)
            
            # Get incident data for heatmap
            response = client.get(f'/api/dept/{dept.code}/heatmap-data')
            
            # If endpoint exists, check data structure
            if response.status_code == 200:
                data = json.loads(response.data)
                
                # Basic validation of heatmap data
                self.assertIn('points', data)
                
                # If points exist, check their structure
                if data['points']:
                    point = data['points'][0]
                    self.assertIn('lat', point)
                    self.assertIn('lng', point)
                    self.assertIn('weight', point)


class CallDensityPermissionTests(DepartmentTestBase):
    """Tests for Call Density Heatmap permissions and access control"""
    
    def test_manager_call_density_permissions(self):
        """Test manager user permissions for call density"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('call_density', False):
                continue
                
            # Get a manager user
            manager = self.session.query(User).filter_by(
                department_id=dept.id, 
                role='manager'
            ).first()
            
            if not manager:
                continue
                
            # Create a test client with a proper Flask-Login session
            client = self.app.test_client()
            
            # Login the manager user
            with self.app.test_request_context():
                login_user(manager)
                # Get the session cookie data
                session_cookie = dict(session)
            
            # Set the session cookie in the test client
            with client.session_transaction() as sess:
                # Update session with Flask-Login data
                for key, value in session_cookie.items():
                    sess[key] = value
                
                # Also set department context variables
                sess['department_id'] = dept.id
                sess['department_code'] = dept.code
                sess['user_role'] = manager.role
            
            # Manager should be able to access call density
            response = client.get(f'/call-density-heatmap')
            self.assertEqual(response.status_code, 200)
    
    def test_regular_user_call_density_permissions(self):
        """Test regular user permissions for call density"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('call_density', False):
                continue
                
            # Get a regular user
            user = self.session.query(User).filter_by(
                department_id=dept.id, 
                role='user'
            ).first()
            
            if not user:
                continue
                
            # Create a test client with a proper Flask-Login session
            client = self.app.test_client()
            
            # Login the regular user
            with self.app.test_request_context():
                login_user(user)
                # Get the session cookie data
                session_cookie = dict(session)
            
            # Set the session cookie in the test client
            with client.session_transaction() as sess:
                # Update session with Flask-Login data
                for key, value in session_cookie.items():
                    sess[key] = value
                
                # Also set department context variables
                sess['department_id'] = dept.id
                sess['department_code'] = dept.code
                sess['user_role'] = user.role
            
            # Regular user should be able to access call density
            response = client.get(f'/call-density-heatmap')
            self.assertEqual(response.status_code, 200)


class CallDensityIntegrationTests(DepartmentTestBase):
    """Integration tests for the Call Density Heatmap with other components"""
    
    def test_station_data_integration(self):
        """Test integration with station data"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('call_density', False):
                continue
                
            client = self.get_admin_client(code)
            
            # Check if stations are available for this department
            stations = self.session.query(Station).filter_by(department_id=dept.id).count()
            self.assertGreater(stations, 0, f"No stations found for {dept.name}")
            
            # If there's an endpoint for station data, check it
            response = client.get(f'/api/dept/{dept.code}/stations')
            if response.status_code == 200:
                data = json.loads(response.data)
                self.assertIn('stations', data)


def main():
    """Run call density tests"""
    parser = argparse.ArgumentParser(description='Run call density tests')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed test output')
    parser.add_argument('--department', '-d', help='Test only a specific department by code')
    args = parser.parse_args()
    
    # Get all test cases
    test_cases = [
        CallDensityUITests,
        CallDensityFunctionalTests,
        CallDensityPermissionTests,
        CallDensityIntegrationTests
    ]
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    for test_case in test_cases:
        suite.addTest(loader.loadTestsFromTestCase(test_case))
    
    # Filter by department if specified
    if args.department:
        filtered_suite = unittest.TestSuite()
        for test in unittest.defaultTestLoader.getTestsFromTestSuite(suite):
            if isinstance(test, unittest.TestCase):
                test._department_filter = args.department
                filtered_suite.addTest(test)
        suite = filtered_suite
    
    # Run the tests
    verbosity = 2 if args.verbose else 1
    runner = unittest.TextTestRunner(verbosity=verbosity)
    
    print(f"Running Call Density tests with {suite.countTestCases()} test cases...")
    result = runner.run(suite)
    
    # Return non-zero exit code if tests failed
    sys.exit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    main()