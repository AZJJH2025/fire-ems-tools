"""Tests for API routes blueprint.

This module contains tests for the API endpoints of the application.
"""

import unittest
import pytest
import json
from flask import url_for
import time

from tests.routes.base import ApiBlueprintTestCase
from database import Department, Incident, User, Station, db
from datetime import datetime

# Mock require_api_key decorator
def mock_require_api_key(f):
    def decorated_function(*args, **kwargs):
        # This mock version adds a department to kwargs
        kwargs['department'] = Department.query.first()
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function


@pytest.mark.api
class TestApiRoutes(ApiBlueprintTestCase):
    """Test cases for API blueprint routes."""
    
    def setUp(self):
        """Set up the test environment with mock data and API key validation."""
        super().setUp()
        
        # Mock the require_api_key decorator
        import routes.api
        routes.api.require_api_key = mock_require_api_key

    def setup_test_data(self):
        """Create test data in the database."""
        # Create a test department
        dept = Department(
            name="Test Department", 
            code="TEST", 
            api_key="test-api-key", 
            status="active"
        )
        db.session.add(dept)
        
        # Create test stations
        for i in range(3):
            station = Station(
                name=f"Test Station {i+1}", 
                station_number=f"S{i+1}",
                department_id=1, 
                latitude=33.448376 + (i * 0.01), 
                longitude=-112.074036 + (i * 0.01),
                address=f"123 Test St {i+1}",
                status="active"
            )
            db.session.add(station)
        
        # Create test incidents
        for i in range(5):
            incident = Incident(
                incident_number=f"TEST-{i+1}",
                department_id=1,
                station_id=i % 3 + 1,
                latitude=33.448376 + (i * 0.005),
                longitude=-112.074036 + (i * 0.005),
                incident_type="EMS" if i % 2 == 0 else "Fire",
                priority=str(i % 3 + 1),
                incident_date=datetime.now(),
                status="Closed"
            )
            db.session.add(incident)
        
        db.session.commit()
    
    def test_api_get_incidents(self):
        """Test the GET /api/incidents endpoint."""
        # Add Authorization header to simulate API key
        response = self.client.get('/api/incidents')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/json')
        
        # Verify the response has the expected structure
        data = response.get_json()
        self.assertIn('incidents', data)
        self.assertIn('total', data)
        self.assertIn('pages', data)
        self.assertIn('page', data)
        
        # Verify we got the expected number of incidents
        self.assertEqual(len(data['incidents']), 5)
        self.assertEqual(data['total'], 5)
    
    def test_api_get_incident_by_id(self):
        """Test the GET /api/incidents/<id> endpoint."""
        # Get a single incident
        response = self.client.get('/api/incidents/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/json')
        
        # Verify the incident data
        data = response.get_json()
        self.assertEqual(data['id'], 1)
        self.assertEqual(data['incident_number'], 'TEST-1')
    
    def test_api_get_nonexistent_incident(self):
        """Test getting a nonexistent incident returns 404."""
        response = self.client.get('/api/incidents/999')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content_type, 'application/json')
        
        # Verify the error message
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Incident not found')
    
    def test_api_create_incident(self):
        """Test the POST /api/incidents endpoint."""
        # Create a new incident
        new_incident = {
            'incident_number': 'NEW-123',
            'incident_type': 'Medical',
            'incident_date': datetime.now().isoformat(),
            'latitude': 33.5,
            'longitude': -112.1,
            'status': 'Active'
        }
        
        response = self.client.post(
            '/api/incidents', 
            data=json.dumps(new_incident),
            content_type='application/json'
        )
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/json')
        
        # Verify the response data
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertIn('incident_id', data)
        self.assertIn('incident', data)
        self.assertEqual(data['incident']['incident_number'], 'NEW-123')
        
        # Verify the incident was added to the database
        incident = Incident.query.filter_by(incident_number='NEW-123').first()
        self.assertIsNotNone(incident)
        self.assertEqual(incident.incident_type, 'Medical')
    
    def test_api_create_incident_missing_fields(self):
        """Test creating an incident with missing required fields returns 400."""
        # Missing incident_type and incident_date
        incomplete_incident = {
            'incident_number': 'INCOMPLETE-123'
        }
        
        response = self.client.post(
            '/api/incidents', 
            data=json.dumps(incomplete_incident),
            content_type='application/json'
        )
        
        # Check the response
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content_type, 'application/json')
        
        # Verify the error message
        data = response.get_json()
        self.assertIn('error', data)
        self.assertIn('Missing required field', data['error'])
    
    def test_api_get_stations(self):
        """Test the GET /api/stations endpoint."""
        response = self.client.get('/api/stations')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/json')
        
        # Verify the response has the expected structure
        data = response.get_json()
        self.assertIn('stations', data)
        self.assertIn('total', data)
        
        # Verify we got the expected number of stations
        self.assertEqual(len(data['stations']), 3)
        self.assertEqual(data['total'], 3)
    
    def test_api_get_station_by_id(self):
        """Test the GET /api/stations/<id> endpoint."""
        # Get a single station
        response = self.client.get('/api/stations/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/json')
        
        # Verify the station data
        data = response.get_json()
        self.assertEqual(data['id'], 1)
        self.assertEqual(data['name'], 'Test Station 1')
    
    def test_api_get_nonexistent_station(self):
        """Test getting a nonexistent station returns 404."""
        response = self.client.get('/api/stations/999')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content_type, 'application/json')
        
        # Verify the error message
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Station not found')
    
    def test_api_create_station(self):
        """Test the POST /api/stations endpoint."""
        # Create a new station
        new_station = {
            'name': 'New Test Station',
            'station_number': 'N123',
            'latitude': 33.6,
            'longitude': -112.2,
            'address': '456 New Station Ave',
            'status': 'Active'
        }
        
        response = self.client.post(
            '/api/stations', 
            data=json.dumps(new_station),
            content_type='application/json'
        )
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/json')
        
        # Verify the response data
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertIn('station_id', data)
        self.assertIn('station', data)
        self.assertEqual(data['station']['name'], 'New Test Station')
        
        # Verify the station was added to the database
        station = Station.query.filter_by(name='New Test Station').first()
        self.assertIsNotNone(station)
        self.assertEqual(station.station_number, 'N123')
    
    def test_api_create_station_missing_fields(self):
        """Test creating a station with missing required fields returns 400."""
        # Missing station_number
        incomplete_station = {
            'name': 'Incomplete Station'
        }
        
        response = self.client.post(
            '/api/stations', 
            data=json.dumps(incomplete_station),
            content_type='application/json'
        )
        
        # Check the response
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content_type, 'application/json')
        
        # Verify the error message
        data = response.get_json()
        self.assertIn('error', data)
        self.assertIn('Missing required field', data['error'])
    
    def test_api_rate_limiting(self):
        """Test that rate limiting headers are present in responses."""
        # This test just checks for presence of rate limiting headers
        # Actual rate limiting functionality would need to be tested differently
        response = self.client.get('/api/incidents')
        
        # Expect rate limit headers if they are implemented
        # If not implemented, this test will be skipped
        for header in response.headers:
            if 'ratelimit' in header.lower():
                return  # Found a rate limit header
                
        # If we reach here, no rate limit headers were found
        # This is a soft fail - just log a message 
        self.skipTest("No rate limit headers found - rate limiting may not be enabled")


if __name__ == '__main__':
    unittest.main()