#!/usr/bin/env python3
"""
Incident Logger Authentication Error Tests

This module demonstrates specific error tests for authentication issues
in the Incident Logger feature.
"""

import os
import sys
import json
import unittest
from datetime import datetime
from unittest.mock import MagicMock, patch

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our simplified test base
from test_departments_simplified import SimpleDepartmentTestBase


class IncidentLoggerAuthenticationErrorTests(SimpleDepartmentTestBase):
    """Specific tests for authentication errors in the Incident Logger feature"""
    
    def test_expired_session_error(self):
        """Test handling of expired session when accessing incident logger"""
        # Mock an expired session
        with patch('flask.session', {'logged_in': True, 'session_expired': True}):
            response = self.client.get('/incident-logger')
            
            # Verify the response redirects to the login page
            self.assertEqual(response.status_code, 302)
            self.assertIn('/login', response.location)
            
            # Verify the session flag was set
            with self.client.session_transaction() as session:
                self.assertTrue(session.get('session_expired'))
    
    def test_insufficient_permissions_error(self):
        """Test handling of insufficient permissions when creating an incident"""
        # Log in as a read-only user
        with self.client.session_transaction() as session:
            session['user_id'] = 1
            session['department_id'] = 1
            session['department_code'] = 'rural'
            session['user_role'] = 'readonly'
            session['logged_in'] = True
        
        # Try to create an incident
        incident_data = {
            'incident_number': 'TEST123',
            'incident_date': '2023-01-01',
            'incident_type': 'FIRE',
            'latitude': '33.4484',
            'longitude': '-112.0740',
            'description': 'Test incident'
        }
        
        response = self.client.post(
            '/incident/add',
            data=incident_data
        )
        
        # Verify response indicates permission error
        self.assertEqual(response.status_code, 403)
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn('error', data)
        self.assertIn('permission', data['error'].lower())
    
    def test_invalid_api_key_error(self):
        """Test handling of invalid API key when accessing incident API"""
        # Only test departments with API enabled
        for code, dept in self.departments.items():
            if dept.api_enabled:
                # Try to access API with invalid key
                response = self.client.get(
                    '/api/incidents',
                    headers={'Authorization': 'Bearer INVALID_API_KEY'}
                )
                
                # Verify response indicates authentication error
                self.assertEqual(response.status_code, 401)
                data = json.loads(response.data.decode('utf-8'))
                self.assertIn('error', data)
                self.assertIn('api key', data['error'].lower())
    
    def test_missing_authorization_header_error(self):
        """Test handling of missing authorization header when accessing incident API"""
        # Only test departments with API enabled
        for code, dept in self.departments.items():
            if dept.api_enabled:
                # Try to access API without authorization header
                response = self.client.get('/api/incidents')
                
                # Verify response indicates authentication error
                self.assertEqual(response.status_code, 401)
                data = json.loads(response.data.decode('utf-8'))
                self.assertIn('error', data)
                self.assertIn('authorization', data['error'].lower())
    
    def test_wrong_department_api_key_error(self):
        """Test using API key from one department to access another department's data"""
        # Only test if we have at least two departments with API enabled
        api_depts = [dept for dept in self.departments.values() if dept.api_enabled]
        if len(api_depts) >= 2:
            dept1 = api_depts[0]
            dept2 = api_depts[1]
            
            # Try to access dept2's incidents with dept1's API key
            response = self.client.get(
                f'/api/departments/{dept2.code}/incidents',
                headers={'Authorization': f'Bearer TEST_API_KEY_{dept1.code}'}
            )
            
            # Verify response indicates authentication error
            self.assertEqual(response.status_code, 403)
            data = json.loads(response.data.decode('utf-8'))
            self.assertIn('error', data)
            self.assertIn('access', data['error'].lower())
    
    def test_tampered_session_error(self):
        """Test handling of tampered session when accessing incident logger"""
        # Create a session with invalid/inconsistent values
        with self.client.session_transaction() as session:
            session['user_id'] = 1
            session['department_id'] = 1
            session['department_code'] = 'invalid_code'  # Inconsistent with department_id
            session['user_role'] = 'admin'
            session['logged_in'] = True
        
        # Try to access the incident logger
        response = self.client.get('/incident-logger')
        
        # Verify the response redirects to the login page due to session validation failure
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login', response.location)
        
        # Verify the session was cleared
        with self.client.session_transaction() as session:
            self.assertFalse(session.get('logged_in', False))
    
    def test_token_replay_attack_error(self):
        """Test handling of replayed form submission token"""
        # Log in as an admin user
        with self.client.session_transaction() as session:
            session['user_id'] = 1
            session['department_id'] = 1
            session['department_code'] = 'rural'
            session['user_role'] = 'admin'
            session['logged_in'] = True
            # Set a used/expired CSRF token
            session['_csrf_token'] = 'expired_token'
            session['_used_tokens'] = ['expired_token']
        
        # Try to create an incident with the expired token
        incident_data = {
            'incident_number': 'TEST123',
            'incident_date': '2023-01-01',
            'incident_type': 'FIRE',
            'latitude': '33.4484',
            'longitude': '-112.0740',
            'description': 'Test incident',
            'csrf_token': 'expired_token'
        }
        
        response = self.client.post(
            '/incident/add',
            data=incident_data
        )
        
        # Verify response indicates CSRF error
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn('error', data)
        self.assertIn('csrf', data['error'].lower())
    
    def test_brute_force_protection(self):
        """Test handling of multiple failed login attempts (brute force protection)"""
        # Simulate 5 failed login attempts
        for i in range(5):
            response = self.client.post(
                '/login',
                data={
                    'username': 'nonexistent_user',
                    'password': f'wrong_password_{i}'
                }
            )
        
        # Try one more login attempt
        response = self.client.post(
            '/login',
            data={
                'username': 'nonexistent_user',
                'password': 'wrong_password_again'
            }
        )
        
        # Verify the response indicates a temporary lockout
        self.assertEqual(response.status_code, 429)
        data = response.data.decode('utf-8')
        self.assertIn('too many', data.lower())


# Run tests if executed directly
if __name__ == "__main__":
    unittest.main()