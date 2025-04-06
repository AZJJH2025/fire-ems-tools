#!/usr/bin/env python3
"""
Simplified Department Testing Framework

This provides a simplified base class for department tests
that works with the current environment.
"""

import os
import sys
import json
import unittest
from unittest.mock import MagicMock

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import application modules - with error handling for missing modules
try:
    from app import app
    from database import Department, User, Station, Incident, db
except ImportError as e:
    print(f"Warning: Could not import some modules. Tests may be limited: {e}")


class SimpleDepartmentTestBase(unittest.TestCase):
    """Simplified base class for department tests"""
    
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
        
        # Create mock departments for testing
        cls.departments = {
            'rural': MagicMock(
                id=1, 
                code='rural',
                name='Pinecrest Fire District',
                department_type='fire',
                num_stations=2,
                features_enabled={
                    'incident_logger': True,
                    'call_density': True,
                    'isochrone_map': False,
                    'fire_map_pro': False
                },
                api_enabled=False,
                webhooks_enabled=False
            ),
            'suburban': MagicMock(
                id=2,
                code='suburban',
                name='Oakridge Fire Department',
                department_type='combined',
                num_stations=4,
                features_enabled={
                    'incident_logger': True,
                    'call_density': True,
                    'isochrone_map': True,
                    'coverage_gap_finder': True,
                    'fire_map_pro': False
                },
                api_enabled=True,
                webhooks_enabled=True,
                webhook_url="https://test-webhook.oakridgefd.gov/incident-updates",
                webhook_events={
                    'incident.created': True,
                    'incident.updated': True,
                    'incident.deleted': False
                }
            ),
            'urban': MagicMock(
                id=3,
                code='urban',
                name='Bayport Fire & Rescue',
                department_type='combined',
                num_stations=12,
                features_enabled={
                    'incident_logger': True,
                    'call_density': True,
                    'isochrone_map': True,
                    'coverage_gap_finder': True,
                    'fire_map_pro': True,
                    'data_formatter': True
                },
                api_enabled=True,
                webhooks_enabled=True,
                webhook_url="https://api.bayportfire.org/webhooks",
                webhook_events={
                    'incident.created': True,
                    'incident.updated': True,
                    'incident.deleted': True
                }
            ),
            'regional': MagicMock(
                id=4,
                code='regional',
                name='Tri-County Regional Fire & EMS',
                department_type='combined',
                num_stations=8,
                features_enabled={
                    'incident_logger': True,
                    'call_density': True,
                    'isochrone_map': True,
                    'coverage_gap_finder': True,
                    'fire_map_pro': True,
                    'data_formatter': True
                },
                api_enabled=True,
                webhooks_enabled=True,
                webhook_url="https://cad.tricountyems.org/api/webhooks",
                webhook_events={
                    'incident.created': True,
                    'incident.updated': True,
                    'incident.deleted': False
                }
            )
        }
        
        # Create mock admin clients dictionary
        cls.admin_clients = {}
        for code in cls.departments.keys():
            cls.admin_clients[code] = cls.app.test_client()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        cls.app_context.pop()
    
    def setUp(self):
        """Set up before each test"""
        self.maxDiff = None  # Show full diffs in test output
        
        # Skip tests that rely on real database content
        if hasattr(self, 'requires_database') and self.requires_database:
            self.skipTest("Test requires database access which is not configured")
    
    def login(self, client, role='admin'):
        """
        Simulate a login for testing.
        
        This is a dummy login that doesn't actually authenticate,
        but sets necessary session values.
        
        Args:
            client: Flask test client
            role: User role ('admin', 'manager', 'user')
            
        Returns:
            The client with a mocked login session
        """
        with client.session_transaction() as sess:
            sess['user_id'] = 1
            sess['department_id'] = 1
            sess['department_code'] = 'rural'
            sess['user_role'] = role
            sess['logged_in'] = True
        
        return client
    
    def get_admin_client(self, dept_code):
        """Get an authenticated client for a department admin"""
        client = self.admin_clients.get(dept_code)
        return self.login(client, 'admin')
    
    def get_department(self, dept_code):
        """Get a department by code"""
        return self.departments.get(dept_code)


class BasicFunctionalityTests(SimpleDepartmentTestBase):
    """Basic functionality tests to validate test setup"""
    
    def test_app_exists(self):
        """Test that the Flask app exists"""
        self.assertIsNotNone(self.app)
    
    def test_app_is_testing(self):
        """Test that the app is in testing mode"""
        self.assertTrue(self.app.config['TESTING'])
    
    def test_client_exists(self):
        """Test that we have a test client"""
        self.assertIsNotNone(self.client)
    
    def test_mock_departments_exist(self):
        """Test that we have mock departments"""
        self.assertEqual(len(self.departments), 4)
        self.assertIn('rural', self.departments)
        self.assertIn('urban', self.departments)


# Run tests if executed directly
if __name__ == "__main__":
    unittest.main()