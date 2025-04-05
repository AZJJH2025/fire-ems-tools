#!/usr/bin/env python3
"""
Department Testing Framework

This script provides automated testing for department-specific features and integrations.
It builds on the test departments created by create_test_departments.py to validate
that all features work correctly across different department configurations.

Usage:
    python test_departments.py [--verbose] [--department CODE] [--tool TOOLNAME]

Options:
    --verbose       Show detailed test output
    --department    Test only a specific department by code (rural, suburban, urban, regional)
    --tool          Test only a specific tool (incident_logger, call_density, etc.)
"""

import os
import sys
import json
import argparse
import unittest
import requests
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask import url_for
from contextlib import contextmanager

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import application modules
try:
    from app import app, register_routes
    from database import Department, User, Station, Incident, db
except ImportError:
    print("Error: Could not import required modules.")
    print("Make sure you're running this script from the project root directory.")
    sys.exit(1)


class DepartmentTestBase(unittest.TestCase):
    """Base class for department tests with shared setup"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment once for all tests"""
        cls.app = app
        cls.app.config['TESTING'] = True
        cls.app.config['WTF_CSRF_ENABLED'] = False
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        
        # Create a test client
        cls.client = cls.app.test_client()
        
        # Set up database session
        cls.engine = db.engine
        Session = sessionmaker(bind=cls.engine)
        cls.session = Session()
        
        # Get test departments
        cls.departments = {}
        for code in ['rural', 'suburban', 'urban', 'regional']:
            dept = cls.session.query(Department).filter_by(code=code).first()
            if dept:
                cls.departments[code] = dept
                
        if not cls.departments:
            print("No test departments found. Please run create_test_departments.py first.")
            sys.exit(1)
            
        # Create admin session clients for each department
        cls.admin_clients = {}
        for code, dept in cls.departments.items():
            admin = cls.session.query(User).filter_by(
                department_id=dept.id, 
                role='admin'
            ).first()
            
            if admin:
                client = cls.app.test_client()
                with client.session_transaction() as sess:
                    sess['user_id'] = admin.id
                    sess['user_role'] = admin.role
                    sess['department_id'] = dept.id
                    sess['department_code'] = dept.code
                cls.admin_clients[code] = client
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        cls.session.close()
        cls.app_context.pop()
    
    def setUp(self):
        """Set up before each test"""
        self.maxDiff = None  # Show full diffs in test output
    
    def get_admin_client(self, dept_code):
        """Get an authenticated client for a department admin"""
        return self.admin_clients.get(dept_code)
    
    def get_department(self, dept_code):
        """Get a department by code"""
        return self.departments.get(dept_code)


class DepartmentConfigurationTests(DepartmentTestBase):
    """Tests for department configuration and settings"""
    
    def test_department_profiles(self):
        """Test that department profiles match expected configurations"""
        # Test rural department
        rural = self.get_department('rural')
        self.assertEqual(rural.name, "Pinecrest Fire District")
        self.assertEqual(rural.department_type, "fire")
        self.assertEqual(rural.num_stations, 2)
        self.assertEqual(rural.features_enabled['incident_logger'], True)
        self.assertEqual(rural.features_enabled['fire_map_pro'], False)
        self.assertEqual(rural.api_enabled, False)
        
        # Test suburban department
        suburban = self.get_department('suburban')
        self.assertEqual(suburban.name, "Oakridge Fire Department")
        self.assertEqual(suburban.department_type, "combined")
        self.assertEqual(suburban.num_stations, 4)
        self.assertEqual(suburban.features_enabled['incident_logger'], True)
        self.assertEqual(suburban.features_enabled['coverage_gap_finder'], True)
        self.assertEqual(suburban.api_enabled, True)
        
        # Test urban department
        urban = self.get_department('urban')
        self.assertEqual(urban.name, "Bayport Fire & Rescue")
        self.assertEqual(urban.department_type, "combined")
        self.assertEqual(urban.num_stations, 12)
        self.assertTrue(all(urban.features_enabled.values()))  # All features enabled
        
        # Test combined department
        combined = self.get_department('regional')
        self.assertEqual(combined.name, "Tri-County Regional Fire & EMS")
        self.assertEqual(combined.department_type, "combined")
        self.assertEqual(combined.num_stations, 8)
        self.assertTrue(all(combined.features_enabled.values()))  # All features enabled
    
    def test_department_home_page(self):
        """Test department home page for each department type"""
        for code, dept in self.departments.items():
            client = self.get_admin_client(code)
            response = client.get(f'/dept/{code}/')
            
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            
            # Department name should be in the response
            self.assertIn(dept.name, html)
            
            # Only enabled features should be shown
            for feature, enabled in dept.features_enabled.items():
                if enabled:
                    # For enabled features, at least check for their presence in some form
                    if feature == "incident_logger":
                        self.assertIn("Incident Logger", html)
                    elif feature == "call_density":
                        self.assertIn("Call Density", html)
                    elif feature == "isochrone_map":
                        self.assertIn("Isochrone Map", html)
                    elif feature == "dashboard":
                        self.assertIn("Dashboard", html)


class FeatureAccessTests(DepartmentTestBase):
    """Tests to verify feature access control based on department configuration"""
    
    def test_incident_logger_access(self):
        """Test access to incident logger based on department configuration"""
        for code, dept in self.departments.items():
            client = self.get_admin_client(code)
            response = client.get(f'/dept/{code}/incident-logger')
            
            if dept.features_enabled.get('incident_logger', False):
                self.assertEqual(response.status_code, 200)
                html = response.data.decode('utf-8')
                self.assertIn("Incident Logger", html)
            else:
                # Should redirect or show access denied
                self.assertNotEqual(response.status_code, 200)
    
    def test_call_density_access(self):
        """Test access to call density heatmap based on department configuration"""
        for code, dept in self.departments.items():
            client = self.get_admin_client(code)
            response = client.get(f'/dept/{code}/call-density')
            
            if dept.features_enabled.get('call_density', False):
                self.assertEqual(response.status_code, 200)
                html = response.data.decode('utf-8')
                self.assertIn("Call Density Heatmap", html)
            else:
                # Should redirect or show access denied
                self.assertNotEqual(response.status_code, 200)
    
    def test_isochrone_map_access(self):
        """Test access to isochrone map based on department configuration"""
        for code, dept in self.departments.items():
            client = self.get_admin_client(code)
            response = client.get(f'/dept/{code}/isochrone-map')
            
            if dept.features_enabled.get('isochrone_map', False):
                self.assertEqual(response.status_code, 200)
                html = response.data.decode('utf-8')
                self.assertIn("Isochrone Map", html)
            else:
                # Should redirect or show access denied
                self.assertNotEqual(response.status_code, 200)
    
    def test_coverage_gap_finder_access(self):
        """Test access to coverage gap finder based on department configuration"""
        for code, dept in self.departments.items():
            client = self.get_admin_client(code)
            response = client.get(f'/dept/{code}/coverage-gap-finder')
            
            if dept.features_enabled.get('coverage_gap_finder', False):
                self.assertEqual(response.status_code, 200)
                html = response.data.decode('utf-8')
                self.assertIn("Coverage Gap Finder", html)
            else:
                # Should redirect or show access denied
                self.assertNotEqual(response.status_code, 200)


class APIFunctionalityTests(DepartmentTestBase):
    """Tests for API functionality for departments with API enabled"""
    
    def test_api_access(self):
        """Test API access based on department configuration"""
        for code, dept in self.departments.items():
            headers = {}
            if dept.api_enabled and dept.api_key:
                headers['X-API-Key'] = dept.api_key
            
            # Test incidents API
            response = requests.get(
                f'http://localhost:5000/api/v1/departments/{dept.id}/incidents',
                headers=headers
            )
            
            if dept.api_enabled:
                self.assertEqual(response.status_code, 200)
                data = response.json()
                self.assertIn('incidents', data)
            else:
                # Should be unauthorized or not found
                self.assertNotEqual(response.status_code, 200)
    
    def test_api_functionality(self):
        """Test API functionality for departments with API enabled"""
        for code, dept in self.departments.items():
            if not dept.api_enabled or not dept.api_key:
                continue
                
            headers = {'X-API-Key': dept.api_key}
            
            # Test retrieving department info
            response = requests.get(
                f'http://localhost:5000/api/v1/departments/{dept.id}',
                headers=headers
            )
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data['department']['name'], dept.name)
            self.assertEqual(data['department']['code'], dept.code)
            
            # Test retrieving stations
            response = requests.get(
                f'http://localhost:5000/api/v1/departments/{dept.id}/stations',
                headers=headers
            )
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn('stations', data)


class WebhookIntegrationTests(DepartmentTestBase):
    """Tests for webhook integrations"""
    
    def test_webhook_configuration(self):
        """Test webhook configuration for each department"""
        for code, dept in self.departments.items():
            # Check if webhook settings match what we expect
            if code == 'rural':
                self.assertFalse(dept.webhooks_enabled)
            elif code == 'suburban':
                self.assertTrue(dept.webhooks_enabled)
                self.assertEqual(dept.webhook_url, "https://test-webhook.oakridgefd.gov/incident-updates")
                self.assertEqual(dept.webhook_events['incident.created'], True)
                self.assertEqual(dept.webhook_events['incident.deleted'], False)
            elif code == 'urban':
                self.assertTrue(dept.webhooks_enabled)
                self.assertTrue(all([
                    dept.webhook_events['incident.created'],
                    dept.webhook_events['incident.updated'],
                    dept.webhook_events['incident.deleted']
                ]))
            elif code == 'regional':
                self.assertTrue(dept.webhooks_enabled)
                self.assertEqual(dept.webhook_url, "https://cad.tricountyems.org/api/webhooks")
                self.assertTrue(dept.webhook_events['incident.created'])
                self.assertFalse(dept.webhook_events['incident.deleted'])


class IncidentDataTests(DepartmentTestBase):
    """Tests for incident data functionality"""
    
    def test_incident_counts(self):
        """Test incident counts for each department"""
        for code, dept in self.departments.items():
            incident_count = self.session.query(Incident).filter_by(department_id=dept.id).count()
            
            # Ensure each department has incidents
            self.assertGreater(incident_count, 0, f"Department {code} has no incidents")
            
            if code == 'rural':
                # Rural should have base count
                base_count = incident_count
            elif code == 'suburban':
                # Suburban should have 2x rural
                self.assertGreaterEqual(incident_count, base_count*1.5)
            elif code == 'urban':
                # Urban should have 3x rural
                self.assertGreaterEqual(incident_count, base_count*2.5)
    
    def test_incident_types(self):
        """Test incident types distribution"""
        for code, dept in self.departments.items():
            incidents = self.session.query(Incident).filter_by(department_id=dept.id).all()
            
            # Count incident types
            type_counts = {}
            for incident in incidents:
                incident_type = incident.incident_type
                type_counts[incident_type] = type_counts.get(incident_type, 0) + 1
            
            # Medical emergencies should be most common
            medical_count = type_counts.get("Medical Emergency", 0)
            for incident_type, count in type_counts.items():
                if incident_type != "Medical Emergency":
                    self.assertGreaterEqual(medical_count, count, 
                                           f"Medical incidents should be most common, but {incident_type} has more")


class UserPermissionTests(DepartmentTestBase):
    """Tests for user permissions and access control"""
    
    def test_admin_access(self):
        """Test admin user access to department settings"""
        for code, dept in self.departments.items():
            client = self.get_admin_client(code)
            
            # Test access to settings page
            response = client.get(f'/dept/{code}/settings')
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            self.assertIn("Department Settings", html)
            
            # Test access to user management
            response = client.get(f'/dept/{code}/users')
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            self.assertIn("User Management", html)
    
    def create_manager_client(self, dept_code):
        """Create a test client for a manager user"""
        dept = self.get_department(dept_code)
        manager = self.session.query(User).filter_by(
            department_id=dept.id, 
            role='manager'
        ).first()
        
        if not manager:
            return None
            
        client = self.app.test_client()
        with client.session_transaction() as sess:
            sess['user_id'] = manager.id
            sess['user_role'] = manager.role
            sess['department_id'] = dept.id
            sess['department_code'] = dept.code
        return client
    
    def test_manager_permissions(self):
        """Test manager user permissions"""
        for code, dept in self.departments.items():
            manager_client = self.create_manager_client(code)
            if not manager_client:
                continue
                
            # Managers should have access to incidents
            response = manager_client.get(f'/dept/{code}/incidents')
            self.assertEqual(response.status_code, 200)
            
            # But not to department settings
            response = manager_client.get(f'/dept/{code}/settings')
            self.assertNotEqual(response.status_code, 200)


def run_specific_tests(test_suite, department=None, tool=None):
    """Run tests for a specific department or tool"""
    if not department and not tool:
        return test_suite
        
    filtered_suite = unittest.TestSuite()
    
    for test in unittest.defaultTestLoader.getTestsFromTestSuite(test_suite):
        if isinstance(test, unittest.TestCase):
            test_name = test._testMethodName
            
            # Filter by department
            if department and not test_name.lower().find(department.lower()) >= 0:
                continue
                
            # Filter by tool
            if tool:
                tool_variations = [
                    tool,
                    tool.replace('_', '-'),
                    tool.replace('_', ' ')
                ]
                if not any(variation.lower() in test_name.lower() for variation in tool_variations):
                    continue
                    
            filtered_suite.addTest(test)
        else:
            # Recursively filter test suites
            sub_tests = run_specific_tests(test, department, tool)
            if sub_tests.countTestCases() > 0:
                filtered_suite.addTest(sub_tests)
                
    return filtered_suite


def main():
    """Run department tests"""
    parser = argparse.ArgumentParser(description='Run department tests')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed test output')
    parser.add_argument('--department', '-d', help='Test only a specific department by code')
    parser.add_argument('--tool', '-t', help='Test only a specific tool')
    args = parser.parse_args()
    
    # Get all tests
    loader = unittest.TestLoader()
    all_tests = unittest.TestSuite()
    all_tests.addTest(loader.loadTestsFromTestCase(DepartmentConfigurationTests))
    all_tests.addTest(loader.loadTestsFromTestCase(FeatureAccessTests))
    all_tests.addTest(loader.loadTestsFromTestCase(APIFunctionalityTests))
    all_tests.addTest(loader.loadTestsFromTestCase(WebhookIntegrationTests))
    all_tests.addTest(loader.loadTestsFromTestCase(IncidentDataTests))
    all_tests.addTest(loader.loadTestsFromTestCase(UserPermissionTests))
    
    # Filter tests if needed
    if args.department or args.tool:
        all_tests = run_specific_tests(all_tests, args.department, args.tool)
    
    # Run tests
    verbosity = 2 if args.verbose else 1
    runner = unittest.TextTestRunner(verbosity=verbosity)
    
    print(f"Running department tests with {all_tests.countTestCases()} test cases...")
    result = runner.run(all_tests)
    
    # Return non-zero exit code if tests failed
    sys.exit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    main()