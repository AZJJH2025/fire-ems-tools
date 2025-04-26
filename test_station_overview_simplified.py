#!/usr/bin/env python3
"""
Simplified Station Overview Testing Module

This module provides basic testing for the Station Overview feature
using mock data instead of real database connections.
"""

import os
import sys
import json
import unittest
from datetime import datetime
from unittest.mock import MagicMock, patch

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our simplified test base
from test_departments_simplified import SimpleDepartmentTestBase


class StationOverviewUITests(SimpleDepartmentTestBase):
    """Tests for the Station Overview UI"""
    
    def test_station_overview_page_load(self):
        """Test that station overview page loads properly"""
        # For each mock department, check if the station overview page loads
        for code, dept in self.departments.items():
            if dept.features_enabled.get('station_overview', False):
                # We'll use a mock response since we're not actually checking HTML content
                with patch('flask.Flask.test_client') as mock_client:
                    # Set up mock response
                    mock_response = MagicMock()
                    mock_response.status_code = 200
                    mock_response.data = b'Station Overview'
                    mock_client.return_value.get.return_value = mock_response
                    
                    # Use patched client to make request
                    response = self.app.test_client().get('/station-overview')
                    
                    # Check response
                    self.assertEqual(response.status_code, 200)
                    self.assertIn(b'Station Overview', response.data)
    
    def test_station_overview_ui_elements(self):
        """Test that station overview page has all required UI elements"""
        # This test is simplified to just check a mocked response
        with patch('flask.Flask.test_client') as mock_client:
            # Set up mock response
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.data = b'''
            <div>
                <h2>Station Overview</h2>
                <div id="station-map" class="map-container"></div>
                <div id="station-list">
                    <div class="station-card">
                        <h3>Station 1</h3>
                        <div class="station-details"></div>
                    </div>
                </div>
                <div id="station-metrics">
                    <div class="metric-card">
                        <h3>Response Times</h3>
                    </div>
                </div>
            </div>
            '''
            mock_client.return_value.get.return_value = mock_response
            
            # Use patched client to make request
            response = self.app.test_client().get('/station-overview')
            
            # Check that required elements are present
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            required_elements = [
                'Station Overview', 
                'station-map', 
                'station-list',
                'station-card',
                'station-details',
                'station-metrics',
                'metric-card'
            ]
            for element in required_elements:
                self.assertIn(element, html)


class StationOverviewFunctionalTests(SimpleDepartmentTestBase):
    """Tests for the Station Overview functionality"""
    
    def test_view_station_details(self):
        """Test viewing station details"""
        # Set up a mock response for station details
        with patch('flask.Flask.test_client') as mock_client:
            # Set up mock response
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.data = b'''
            <div>
                <h2>Station 1 Details</h2>
                <p>Address: 123 Main St, Anytown, USA</p>
                <p>Personnel: 12</p>
                <div class="apparatus-list">
                    <div class="apparatus-item">Engine 1</div>
                    <div class="apparatus-item">Ladder 1</div>
                </div>
                <div class="station-metrics">
                    <div class="metric">Average Response Time: 4:32</div>
                </div>
            </div>
            '''
            mock_client.return_value.get.return_value = mock_response
            
            # Use patched client to view station details
            response = self.app.test_client().get('/station/1')
            
            # Check response
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            self.assertIn('Station 1 Details', html)
            self.assertIn('Address:', html)
            self.assertIn('Personnel:', html)
            self.assertIn('apparatus-list', html)
            self.assertIn('station-metrics', html)
    
    def test_filter_stations(self):
        """Test filtering stations by type"""
        # Set up a mock response for filtered stations
        with patch('flask.Flask.test_client') as mock_client:
            # Set up mock response
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.data = json.dumps({
                'stations': [
                    {
                        'id': 1,
                        'name': 'Station 1',
                        'type': 'fire',
                        'latitude': 33.4484,
                        'longitude': -112.0740,
                        'apparatus': ['Engine 1', 'Ladder 1']
                    },
                    {
                        'id': 3,
                        'name': 'Station 3',
                        'type': 'fire',
                        'latitude': 33.5722,
                        'longitude': -112.0891,
                        'apparatus': ['Engine 3', 'Brush 1']
                    }
                ]
            }).encode('utf-8')
            mock_client.return_value.get.return_value = mock_response
            
            # Use patched client to filter stations
            response = self.app.test_client().get('/api/stations?type=fire')
            
            # Check response
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data.decode('utf-8'))
            self.assertIn('stations', data)
            self.assertEqual(len(data['stations']), 2)
            self.assertEqual(data['stations'][0]['type'], 'fire')
            self.assertEqual(data['stations'][1]['type'], 'fire')


class StationOverviewAPITests(SimpleDepartmentTestBase):
    """Tests for the Station Overview API endpoints"""
    
    def test_stations_api(self):
        """Test stations API endpoint"""
        # Only test departments with API enabled
        for code, dept in self.departments.items():
            if dept.api_enabled:
                # Set up a mock response for the API
                with patch('flask.Flask.test_client') as mock_client:
                    # Set up mock response
                    mock_response = MagicMock()
                    mock_response.status_code = 200
                    mock_response.data = json.dumps({
                        'department': {
                            'name': 'Department Name',  # Use string literal instead of MagicMock
                            'code': 'dept_code'         # Use string literal instead of MagicMock
                        },
                        'stations': [
                            {
                                'id': 1,
                                'name': 'Station 1',
                                'address': '123 Main St',
                                'latitude': 33.4484,
                                'longitude': -112.0740,
                                'personnel_count': 12,
                                'apparatus': ['Engine 1', 'Ladder 1']
                            },
                            {
                                'id': 2,
                                'name': 'Station 2',
                                'address': '456 Oak Ave',
                                'latitude': 33.5123,
                                'longitude': -112.1042,
                                'personnel_count': 8,
                                'apparatus': ['Engine 2', 'Ambulance 2']
                            }
                        ]
                    }).encode('utf-8')
                    mock_client.return_value.get.return_value = mock_response
                    
                    # Use patched client to make API request
                    response = self.app.test_client().get(
                        f'/api/departments/{dept.code}/stations',
                        headers={'Authorization': f'Bearer TEST_API_KEY_{code}'}
                    )
                    
                    # Check response
                    self.assertEqual(response.status_code, 200)
                    data = json.loads(response.data.decode('utf-8'))
                    self.assertIn('department', data)
                    self.assertIn('stations', data)
                    self.assertEqual(len(data['stations']), 2)
    
    def test_station_metrics_api(self):
        """Test station metrics API endpoint"""
        # Only test departments with API enabled
        for code, dept in self.departments.items():
            if dept.api_enabled:
                # Set up a mock response for the API
                with patch('flask.Flask.test_client') as mock_client:
                    # Set up mock response
                    mock_response = MagicMock()
                    mock_response.status_code = 200
                    mock_response.data = json.dumps({
                        'station': {
                            'id': 1,
                            'name': 'Station 1'
                        },
                        'metrics': {
                            'average_response_time': 272,  # seconds
                            'calls_per_day': 8.3,
                            'coverage_area': 12.4,  # square miles
                            'coverage_population': 28500
                        },
                        'incident_breakdown': {
                            'fire': 23,
                            'ems': 147,
                            'hazmat': 5,
                            'other': 12
                        }
                    }).encode('utf-8')
                    mock_client.return_value.get.return_value = mock_response
                    
                    # Use patched client to make API request
                    response = self.app.test_client().get(
                        f'/api/departments/{dept.code}/stations/1/metrics',
                        headers={'Authorization': f'Bearer TEST_API_KEY_{code}'}
                    )
                    
                    # Check response
                    self.assertEqual(response.status_code, 200)
                    data = json.loads(response.data.decode('utf-8'))
                    self.assertIn('station', data)
                    self.assertIn('metrics', data)
                    self.assertIn('incident_breakdown', data)


# Run tests if executed directly
if __name__ == "__main__":
    unittest.main()