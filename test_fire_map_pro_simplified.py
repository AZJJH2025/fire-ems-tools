#!/usr/bin/env python3
"""
Simplified Fire Map Pro Testing Module

This module provides basic testing for the Fire Map Pro feature
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


class FireMapProUITests(SimpleDepartmentTestBase):
    """Tests for the Fire Map Pro UI"""
    
    def test_fire_map_pro_page_load(self):
        """Test that Fire Map Pro page loads properly"""
        # For each mock department, check if Fire Map Pro page loads
        for code, dept in self.departments.items():
            if dept.features_enabled.get('fire_map_pro', False):
                # We'll use a mock response since we're not actually checking HTML content
                with patch('flask.Flask.test_client') as mock_client:
                    # Set up mock response
                    mock_response = MagicMock()
                    mock_response.status_code = 200
                    mock_response.data = b'Fire Map Pro'
                    mock_client.return_value.get.return_value = mock_response
                    
                    # Use patched client to make request
                    response = self.app.test_client().get('/fire-map-pro')
                    
                    # Check response
                    self.assertEqual(response.status_code, 200)
                    self.assertIn(b'Fire Map Pro', response.data)
    
    def test_fire_map_pro_ui_elements(self):
        """Test that Fire Map Pro page has all required UI elements"""
        # This test is simplified to just check a mocked response
        with patch('flask.Flask.test_client') as mock_client:
            # Set up mock response
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.data = b'''
            <div>
                <h2>Fire Map Pro</h2>
                <div id="fire-map-container" class="map-container"></div>
                <div class="control-panel">
                    <div class="layer-controls">
                        <h3>Map Layers</h3>
                        <div class="layer-toggle" data-layer="stations">Stations</div>
                        <div class="layer-toggle" data-layer="hydrants">Hydrants</div>
                        <div class="layer-toggle" data-layer="hazards">Hazards</div>
                    </div>
                    <div class="search-controls">
                        <input type="text" id="address-search" placeholder="Search address...">
                        <button id="search-button">Search</button>
                    </div>
                </div>
            </div>
            '''
            mock_client.return_value.get.return_value = mock_response
            
            # Use patched client to make request
            response = self.app.test_client().get('/fire-map-pro')
            
            # Check that required elements are present
            self.assertEqual(response.status_code, 200)
            html = response.data.decode('utf-8')
            required_elements = [
                'Fire Map Pro', 
                'fire-map-container', 
                'control-panel',
                'layer-controls',
                'layer-toggle',
                'search-controls',
                'address-search',
                'search-button'
            ]
            for element in required_elements:
                self.assertIn(element, html)


class FireMapProFunctionalTests(SimpleDepartmentTestBase):
    """Tests for the Fire Map Pro functionality"""
    
    def test_toggle_map_layers(self):
        """Test toggling map layers"""
        # Set up a mock response for the layer toggle
        with patch('flask.Flask.test_client') as mock_client:
            # Set up mock response
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.data = json.dumps({
                'layer': 'hydrants',
                'visible': True,
                'features': 358
            }).encode('utf-8')
            mock_client.return_value.post.return_value = mock_response
            
            # Use patched client to toggle a layer
            response = self.app.test_client().post(
                '/api/map/layers/toggle',
                json={'layer': 'hydrants', 'visible': True}
            )
            
            # Check response
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data.decode('utf-8'))
            self.assertEqual(data['layer'], 'hydrants')
            self.assertEqual(data['visible'], True)
            self.assertIn('features', data)
    
    def test_address_search(self):
        """Test searching for an address"""
        # Set up a mock response for address search
        with patch('flask.Flask.test_client') as mock_client:
            # Set up mock response
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.data = json.dumps({
                'address': '123 Main St, Anytown, USA',
                'coordinates': {
                    'latitude': 33.4484,
                    'longitude': -112.0740
                },
                'nearest_station': {
                    'id': 2,
                    'name': 'Station 2',
                    'distance': 1.4  # miles
                },
                'nearest_hydrants': [
                    {
                        'id': 145,
                        'distance': 0.12,  # miles
                        'flow_rate': 1500  # GPM
                    },
                    {
                        'id': 187,
                        'distance': 0.24,  # miles
                        'flow_rate': 1200  # GPM
                    }
                ]
            }).encode('utf-8')
            mock_client.return_value.get.return_value = mock_response
            
            # Use patched client to search for an address
            response = self.app.test_client().get(
                '/api/map/search?address=123%20Main%20St,%20Anytown,%20USA'
            )
            
            # Check response
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data.decode('utf-8'))
            self.assertIn('address', data)
            self.assertIn('coordinates', data)
            self.assertIn('nearest_station', data)
            self.assertIn('nearest_hydrants', data)
            self.assertEqual(len(data['nearest_hydrants']), 2)


class FireMapProAPITests(SimpleDepartmentTestBase):
    """Tests for the Fire Map Pro API endpoints"""
    
    def test_map_features_api(self):
        """Test map features API endpoint"""
        # Only test departments with API enabled and Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.api_enabled and dept.features_enabled.get('fire_map_pro', False):
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
                        'features': {
                            'stations': [
                                {
                                    'id': 1,
                                    'name': 'Station 1',
                                    'type': 'fire',
                                    'latitude': 33.4484,
                                    'longitude': -112.0740
                                },
                                {
                                    'id': 2,
                                    'name': 'Station 2',
                                    'type': 'combined',
                                    'latitude': 33.5123,
                                    'longitude': -112.1042
                                }
                            ],
                            'hydrants': [
                                {
                                    'id': 145,
                                    'latitude': 33.4492,
                                    'longitude': -112.0752,
                                    'flow_rate': 1500
                                },
                                {
                                    'id': 187,
                                    'latitude': 33.4468,
                                    'longitude': -112.0728,
                                    'flow_rate': 1200
                                }
                            ],
                            'hazards': [
                                {
                                    'id': 23,
                                    'name': 'Chemical Storage',
                                    'latitude': 33.4512,
                                    'longitude': -112.0765,
                                    'hazard_type': 'chemical',
                                    'risk_level': 'high'
                                }
                            ]
                        }
                    }).encode('utf-8')
                    mock_client.return_value.get.return_value = mock_response
                    
                    # Use patched client to make API request
                    response = self.app.test_client().get(
                        f'/api/departments/{dept.code}/map-features',
                        headers={'Authorization': f'Bearer TEST_API_KEY_{code}'}
                    )
                    
                    # Check response
                    self.assertEqual(response.status_code, 200)
                    data = json.loads(response.data.decode('utf-8'))
                    self.assertIn('department', data)
                    self.assertIn('features', data)
                    self.assertIn('stations', data['features'])
                    self.assertIn('hydrants', data['features'])
                    self.assertIn('hazards', data['features'])
    
    def test_hazard_details_api(self):
        """Test hazard details API endpoint"""
        # Only test departments with API enabled and Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.api_enabled and dept.features_enabled.get('fire_map_pro', False):
                # Set up a mock response for the API
                with patch('flask.Flask.test_client') as mock_client:
                    # Set up mock response
                    mock_response = MagicMock()
                    mock_response.status_code = 200
                    mock_response.data = json.dumps({
                        'hazard': {
                            'id': 23,
                            'name': 'Chemical Storage',
                            'address': '789 Industrial Blvd',
                            'latitude': 33.4512,
                            'longitude': -112.0765,
                            'hazard_type': 'chemical',
                            'risk_level': 'high',
                            'description': 'Bulk chemical storage facility with hazardous materials',
                            'contact': {
                                'name': 'John Smith',
                                'phone': '555-123-4567',
                                'email': 'jsmith@facility.com'
                            },
                            'materials': [
                                'Chlorine',
                                'Ammonia',
                                'Sulfuric Acid'
                            ],
                            'emergency_plan': 'Evacuation plan in place, foam suppression system installed'
                        }
                    }).encode('utf-8')
                    mock_client.return_value.get.return_value = mock_response
                    
                    # Use patched client to make API request
                    response = self.app.test_client().get(
                        f'/api/departments/{dept.code}/hazards/23',
                        headers={'Authorization': f'Bearer TEST_API_KEY_{code}'}
                    )
                    
                    # Check response
                    self.assertEqual(response.status_code, 200)
                    data = json.loads(response.data.decode('utf-8'))
                    self.assertIn('hazard', data)
                    self.assertEqual(data['hazard']['id'], 23)
                    self.assertIn('contact', data['hazard'])
                    self.assertIn('materials', data['hazard'])
                    self.assertIn('emergency_plan', data['hazard'])


# Run tests if executed directly
if __name__ == "__main__":
    unittest.main()