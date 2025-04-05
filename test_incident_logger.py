#!/usr/bin/env python3
"""
Incident Logger Testing Module

This module provides comprehensive testing for the Incident Logger feature.
It validates functionality across different department configurations.

Usage:
    python test_incident_logger.py [--verbose] [--department CODE]
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
except ImportError:
    print("Error: Could not import required modules.")
    print("Make sure you're running this script from the project root directory.")
    sys.exit(1)


class IncidentLoggerUITests(DepartmentTestBase):
    """Tests for the Incident Logger user interface"""
    
    def test_incident_logger_page_load(self):
        """Test that the incident logger page loads for enabled departments"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False):
                continue
                
            client = self.get_admin_client(code)
            response = client.get(f'/dept/{code}/incident-logger')
            
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            
            # Verify essential UI components
            self.assertIn("Incident Logger", html)
            self.assertIn("Create New Incident", html)
            self.assertIn("View Incidents", html)
    
    def test_incident_form_fields(self):
        """Test that incident form fields are present"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False):
                continue
                
            client = self.get_admin_client(code)
            response = client.get(f'/dept/{code}/incident-logger')
            
            html = response.data.decode('utf-8')
            
            # Check for essential form fields
            essential_fields = [
                "incident_type",
                "location",
                "dispatch_time",
                "responding_units"
            ]
            
            for field in essential_fields:
                self.assertIn(field, html, f"Field {field} missing in {dept.name} incident form")
            
            # If department is combined, check for EMS fields
            if dept.department_type == "combined":
                ems_fields = [
                    "patient_count",
                    "patient_age"
                ]
                for field in ems_fields:
                    self.assertIn(field, html, f"EMS field {field} missing in {dept.name} incident form")


class IncidentLoggerFunctionalTests(DepartmentTestBase):
    """Tests for Incident Logger functionality"""
    
    def test_create_incident(self):
        """Test creating a new incident"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False):
                continue
                
            client = self.get_admin_client(code)
            
            # Get the current incident count
            initial_count = self.session.query(Incident).filter_by(department_id=dept.id).count()
            
            # Create a new incident
            incident_data = {
                "title": "Test Fire Incident",
                "incident_type": "Structure Fire",
                "location": "123 Test Street",
                "latitude": "37.7749",
                "longitude": "-122.4194",
                "dispatch_time": datetime.now().isoformat(),
                "status": "active",
                "responding_units": ["1", "2"]
            }
            
            # Additional data based on department type
            if dept.department_type == "combined":
                incident_data["patient_count"] = "2"
            
            response = client.post(
                f'/dept/{code}/incidents/create',
                data=incident_data,
                follow_redirects=True
            )
            
            # Check for successful creation
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            self.assertIn("Incident created successfully", html)
            
            # Verify incident count increased
            new_count = self.session.query(Incident).filter_by(department_id=dept.id).count()
            self.assertEqual(new_count, initial_count + 1)
    
    def test_view_incident_details(self):
        """Test viewing incident details"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False):
                continue
                
            client = self.get_admin_client(code)
            
            # Get an existing incident
            incident = self.session.query(Incident).filter_by(department_id=dept.id).first()
            if not incident:
                continue
                
            # View incident details
            response = client.get(f'/dept/{code}/incidents/{incident.id}')
            
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            
            # Check incident details are displayed
            self.assertIn(incident.title, html)
            self.assertIn(incident.incident_type, html)
            self.assertIn(incident.location, html)
    
    def test_update_incident(self):
        """Test updating an incident"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False):
                continue
                
            client = self.get_admin_client(code)
            
            # Get an existing incident
            incident = self.session.query(Incident).filter_by(department_id=dept.id).first()
            if not incident:
                continue
                
            # Update incident status
            update_data = {
                "status": "closed",
                "clear_time": datetime.now().isoformat()
            }
            
            response = client.post(
                f'/dept/{code}/incidents/{incident.id}/update',
                data=update_data,
                follow_redirects=True
            )
            
            # Check for successful update
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            self.assertIn("Incident updated successfully", html)
            
            # Verify database update
            updated_incident = self.session.query(Incident).filter_by(id=incident.id).first()
            self.assertEqual(updated_incident.status, "closed")


class IncidentLoggerAPITests(DepartmentTestBase):
    """Tests for Incident Logger API endpoints"""
    
    def test_incidents_api(self):
        """Test incidents API endpoint"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False) or not dept.api_enabled:
                continue
                
            # Test incidents list endpoint
            client = self.get_admin_client(code)
            response = client.get(f'/api/v1/departments/{dept.id}/incidents')
            
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            
            self.assertIn('incidents', data)
            self.assertTrue(isinstance(data['incidents'], list))
            
            # Check incident fields
            if data['incidents']:
                incident = data['incidents'][0]
                essential_fields = ['id', 'title', 'incident_type', 'location', 'status']
                for field in essential_fields:
                    self.assertIn(field, incident)
    
    def test_incident_detail_api(self):
        """Test incident detail API endpoint"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False) or not dept.api_enabled:
                continue
                
            # Get an existing incident
            incident = self.session.query(Incident).filter_by(department_id=dept.id).first()
            if not incident:
                continue
                
            # Test incident detail endpoint
            client = self.get_admin_client(code)
            response = client.get(f'/api/v1/departments/{dept.id}/incidents/{incident.id}')
            
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            
            self.assertIn('incident', data)
            self.assertEqual(data['incident']['id'], incident.id)
            self.assertEqual(data['incident']['incident_type'], incident.incident_type)


class IncidentLoggerPermissionTests(DepartmentTestBase):
    """Tests for Incident Logger permissions and access control"""
    
    def test_manager_incident_permissions(self):
        """Test manager user permissions for incidents"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False):
                continue
                
            # Get a manager user
            manager = self.session.query(User).filter_by(
                department_id=dept.id, 
                role='manager'
            ).first()
            
            if not manager:
                continue
                
            # Create client for manager
            client = self.app.test_client()
            with client.session_transaction() as sess:
                sess['user_id'] = manager.id
                sess['user_role'] = manager.role
                sess['department_id'] = dept.id
                sess['department_code'] = dept.code
            
            # Manager should be able to access incident logger
            response = client.get(f'/dept/{code}/incident-logger')
            self.assertEqual(response.status_code, 200)
            
            # Manager should be able to create incidents
            response = client.get(f'/dept/{code}/incidents/create')
            self.assertEqual(response.status_code, 200)
            
            # Get an existing incident
            incident = self.session.query(Incident).filter_by(department_id=dept.id).first()
            if not incident:
                continue
                
            # Manager should be able to view incidents
            response = client.get(f'/dept/{code}/incidents/{incident.id}')
            self.assertEqual(response.status_code, 200)
    
    def test_regular_user_incident_permissions(self):
        """Test regular user permissions for incidents"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False):
                continue
                
            # Get a regular user
            user = self.session.query(User).filter_by(
                department_id=dept.id, 
                role='user'
            ).first()
            
            if not user:
                continue
                
            # Create client for regular user
            client = self.app.test_client()
            with client.session_transaction() as sess:
                sess['user_id'] = user.id
                sess['user_role'] = user.role
                sess['department_id'] = dept.id
                sess['department_code'] = dept.code
            
            # Regular user should be able to access incident logger view
            response = client.get(f'/dept/{code}/incident-logger')
            self.assertEqual(response.status_code, 200)
            
            # Get an existing incident
            incident = self.session.query(Incident).filter_by(department_id=dept.id).first()
            if not incident:
                continue
                
            # Regular user should be able to view incidents
            response = client.get(f'/dept/{code}/incidents/{incident.id}')
            self.assertEqual(response.status_code, 200)


class IncidentLoggerIntegrationTests(DepartmentTestBase):
    """Integration tests for the Incident Logger with other components"""
    
    def test_incident_reporting_integration(self):
        """Test integration with reporting features"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False):
                continue
                
            client = self.get_admin_client(code)
            
            # Access incident reporting
            response = client.get(f'/dept/{code}/incidents/report')
            
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            
            # Check for report generation options
            self.assertIn("Generate Report", html)
            self.assertIn("Export", html)
    
    def test_webhook_integration(self):
        """Test webhook integration for incident changes"""
        for code, dept in self.departments.items():
            if not dept.features_enabled.get('incident_logger', False) or not dept.webhooks_enabled:
                continue
                
            # This test would typically mock webhook delivery and verify payloads
            # Since we can't easily test actual webhook delivery in a unit test,
            # we'll check that the webhook configuration is correct
            
            self.assertTrue(dept.webhook_url)
            self.assertTrue(dept.webhook_secret)
            
            # Incident creation/update should be enabled
            self.assertTrue(dept.webhook_events.get('incident.created', False))
            self.assertTrue(dept.webhook_events.get('incident.updated', False))


def main():
    """Run incident logger tests"""
    parser = argparse.ArgumentParser(description='Run incident logger tests')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed test output')
    parser.add_argument('--department', '-d', help='Test only a specific department by code')
    args = parser.parse_args()
    
    # Get all test cases
    test_cases = [
        IncidentLoggerUITests,
        IncidentLoggerFunctionalTests,
        IncidentLoggerAPITests,
        IncidentLoggerPermissionTests,
        IncidentLoggerIntegrationTests
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
    
    print(f"Running Incident Logger tests with {suite.countTestCases()} test cases...")
    result = runner.run(suite)
    
    # Return non-zero exit code if tests failed
    sys.exit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    main()