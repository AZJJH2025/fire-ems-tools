#!/usr/bin/env python3
"""
Fire Map Pro Edge Case Tests

This module contains test cases for edge cases and specialized scenarios 
in the Fire Map Pro feature.
"""

import os
import sys
import json
import unittest
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch, ANY

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our simplified test base
from test_departments_simplified import SimpleDepartmentTestBase


class FireMapProEdgeCaseTests(SimpleDepartmentTestBase):
    """Test edge cases for the Fire Map Pro feature"""

    def test_very_large_hydrant_count(self):
        """Test handling of areas with thousands of hydrants"""
        # Only test for departments with Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.features_enabled.get('fire_map_pro', False):
                # Create a mock response with a large number of hydrants
                with patch('flask.request') as mock_request:
                    mock_request.args = {'bounds': '33.4,-112.1,33.5,-112.0'}  # Map bounds
                    
                    # Create thousands of test hydrants
                    hydrants = []
                    for i in range(5000):  # 5000 hydrants
                        lat = 33.4 + (i % 100) * 0.001  # Distribute hydrants in a grid
                        lng = -112.1 + (i // 100) * 0.001
                        hydrants.append({
                            'id': i,
                            'latitude': lat,
                            'longitude': lng,
                            'flow_rate': 1500 if i % 3 == 0 else 1000,
                            'last_inspection': '2023-01-01'
                        })
                    
                    # Mock the get_hydrants_in_bounds function
                    with patch('app.get_hydrants_in_bounds', return_value=hydrants):
                        response = self.client.get(f'/api/map/hydrants')
                        
                        # Verify successful response
                        self.assertEqual(response.status_code, 200)
                        data = json.loads(response.data.decode('utf-8'))
                        
                        # Verify the returned data is clustered or paginated
                        # The application should implement some form of clustering or pagination
                        # to avoid sending too much data to the client
                        if 'clusters' in data:
                            # If it uses clustering
                            self.assertLess(len(data['clusters']), len(hydrants))
                        elif 'hydrants' in data and 'pagination' in data:
                            # If it uses pagination
                            self.assertLess(len(data['hydrants']), len(hydrants))
                            self.assertIn('total', data['pagination'])
                            self.assertIn('page', data['pagination'])
                            self.assertIn('pages', data['pagination'])
                        else:
                            # If neither, we should at least limit the results
                            self.assertLessEqual(len(data.get('hydrants', [])), 1000)

    def test_missing_coordinate_data(self):
        """Test handling of stations with missing geographic coordinates"""
        # Only test for departments with Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.features_enabled.get('fire_map_pro', False):
                # Mock stations with missing coordinates
                stations = [
                    {
                        'id': 1,
                        'name': 'Station 1',
                        'latitude': None,  # Missing latitude
                        'longitude': -112.1,
                        'address': '123 Main St'
                    },
                    {
                        'id': 2,
                        'name': 'Station 2',
                        'latitude': 33.5,
                        'longitude': None,  # Missing longitude
                        'address': '456 Oak Ave'
                    },
                    {
                        'id': 3,
                        'name': 'Station 3',
                        'latitude': 33.6,
                        'longitude': -112.2,
                        'address': '789 Pine St'  # Complete data
                    }
                ]
                
                # Mock the get_department_stations function
                with patch('app.get_department_stations', return_value=stations):
                    response = self.client.get(f'/api/map/stations')
                    
                    # Verify successful response
                    self.assertEqual(response.status_code, 200)
                    data = json.loads(response.data.decode('utf-8'))
                    
                    # Either the stations with missing coordinates should be excluded,
                    # or they should have been geocoded using their addresses
                    self.assertIn('stations', data)
                    
                    # Check each station has valid coordinates
                    for station in data['stations']:
                        # Either excluded stations with missing coordinates
                        if station['id'] == 3:
                            self.assertIsNotNone(station.get('latitude'))
                            self.assertIsNotNone(station.get('longitude'))
                        # Or geocoded them from the address
                        elif station['id'] in [1, 2]:
                            if 'latitude' in station and 'longitude' in station:
                                self.assertIsNotNone(station.get('latitude'))
                                self.assertIsNotNone(station.get('longitude'))

    def test_conflicting_data_layers(self):
        """Test handling of conflicting data in different map layers"""
        # Only test for departments with Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.features_enabled.get('fire_map_pro', False):
                # Set up test - enable multiple layers
                with patch('flask.session', {'map_layers': {'stations': True, 'hydrants': True, 'hazards': True}}):
                    # Create a test area with overlapping/conflicting data
                    # A hazard and station are at the exact same location
                    same_lat, same_lng = 33.5, -112.1
                    
                    # Mock the data sources
                    with patch('app.get_department_stations', return_value=[
                        {'id': 1, 'name': 'Station 1', 'latitude': same_lat, 'longitude': same_lng}
                    ]), patch('app.get_hazards_in_bounds', return_value=[
                        {'id': 1, 'name': 'Hazard 1', 'latitude': same_lat, 'longitude': same_lng}
                    ]):
                        response = self.client.get(f'/api/map/layers')
                        
                        # Verify successful response
                        self.assertEqual(response.status_code, 200)
                        data = json.loads(response.data.decode('utf-8'))
                        
                        # Check that both features are included despite the conflict
                        self.assertIn('stations', data)
                        self.assertIn('hazards', data)
                        
                        # The actual display handling would be on the frontend,
                        # but the backend should provide all data

    def test_deprecated_layer_format(self):
        """Test backward compatibility with deprecated layer format"""
        # Only test for departments with Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.features_enabled.get('fire_map_pro', False):
                # Use the old format for layer configuration (boolean instead of object)
                with patch('flask.session', {'enable_stations': True, 'enable_hydrants': False}):
                    response = self.client.get(f'/api/map/config')
                    
                    # Verify successful response
                    self.assertEqual(response.status_code, 200)
                    data = json.loads(response.data.decode('utf-8'))
                    
                    # Check that the old format is still supported
                    self.assertIn('layers', data)
                    self.assertIn('stations', data['layers'])
                    self.assertTrue(data['layers']['stations'])
                    self.assertIn('hydrants', data['layers'])
                    self.assertFalse(data['layers']['hydrants'])

    def test_extreme_zoom_levels(self):
        """Test handling of extreme zoom levels (very zoomed in/out)"""
        # Only test for departments with Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.features_enabled.get('fire_map_pro', False):
                # Test very zoomed out (large area)
                with patch('flask.request') as mock_request:
                    mock_request.args = {'bounds': '32.0,-113.0,35.0,-110.0', 'zoom': '5'}  # Large area
                    
                    response = self.client.get(f'/api/map/features')
                    
                    # Verify successful response
                    self.assertEqual(response.status_code, 200)
                    data = json.loads(response.data.decode('utf-8'))
                    
                    # At low zoom, should use clustering or limit results
                    if 'clusters' in data:
                        self.assertIn('clusters', data)
                    else:
                        # If not using clusters, should paginate or limit
                        if 'pagination' in data:
                            self.assertIn('pagination', data)
                        else:
                            # Should at least return some data with a sensible limit
                            for layer in ['stations', 'hydrants', 'hazards']:
                                if layer in data:
                                    self.assertLessEqual(len(data[layer]), 1000)
                
                # Test very zoomed in (small area)
                with patch('flask.request') as mock_request:
                    mock_request.args = {'bounds': '33.500,-112.010,33.501,-112.000', 'zoom': '20'}  # Tiny area
                    
                    response = self.client.get(f'/api/map/features')
                    
                    # Verify successful response
                    self.assertEqual(response.status_code, 200)
                    # At high zoom, should return detailed data for the small area
                    # No need to limit results since the area is small

    def test_slow_connection_optimization(self):
        """Test optimization for slow connections"""
        # Only test for departments with Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.features_enabled.get('fire_map_pro', False):
                # Simulate client requesting optimized data for slow connection
                with patch('flask.request') as mock_request:
                    mock_request.args = {'optimize': 'true', 'connection': 'slow'}
                    mock_request.headers = {'X-Connection-Speed': 'slow'}
                    
                    response = self.client.get(f'/api/map/features')
                    
                    # Verify successful response
                    self.assertEqual(response.status_code, 200)
                    data = json.loads(response.data.decode('utf-8'))
                    
                    # Should return simplified/optimized data
                    # Check for reduced data fields or simplified geometries
                    for layer in ['stations', 'hydrants', 'hazards']:
                        if layer in data and len(data[layer]) > 0:
                            # Some indication of optimization should be present
                            # Either fewer properties or a flag indicating simplification
                            if 'optimized' in data:
                                self.assertTrue(data['optimized'])
                            # Or a lower resolution indicator
                            elif 'resolution' in data:
                                self.assertIn(data['resolution'], ['low', 'medium'])

    def test_custom_icons_overflow(self):
        """Test handling of too many custom icons"""
        # Only test for departments with Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.features_enabled.get('fire_map_pro', False):
                # Generate a large number of custom icons
                custom_icons = []
                for i in range(1000):  # Excessive number of custom icons
                    custom_icons.append({
                        'id': i,
                        'name': f'Custom Icon {i}',
                        'url': f'https://example.com/icons/custom_{i}.png',
                        'width': 32,
                        'height': 32
                    })
                
                # Mock the API that saves custom icons
                with patch('app.get_custom_map_icons', return_value=custom_icons):
                    response = self.client.get(f'/api/map/icons')
                    
                    # Verify successful response
                    self.assertEqual(response.status_code, 200)
                    data = json.loads(response.data.decode('utf-8'))
                    
                    # Should handle the excessive number of icons gracefully
                    # Either by paginating or limiting
                    self.assertIn('icons', data)
                    if 'pagination' in data:
                        # If paginated, check pagination data
                        self.assertIn('total', data['pagination'])
                        self.assertGreaterEqual(data['pagination']['total'], len(custom_icons))
                        self.assertIn('page', data['pagination'])
                    else:
                        # If not paginated, should at least limit the results
                        self.assertLess(len(data['icons']), len(custom_icons))


class FireMapProSecurityTests(SimpleDepartmentTestBase):
    """Test security aspects of the Fire Map Pro feature"""

    def test_cross_department_access_prevention(self):
        """Test prevention of accessing another department's map data"""
        # Get two departments with Fire Map Pro
        fire_map_depts = [dept for code, dept in self.departments.items() 
                          if dept.features_enabled.get('fire_map_pro', False)]
        
        if len(fire_map_depts) >= 2:
            dept1 = fire_map_depts[0]
            dept2 = fire_map_depts[1]
            
            # Login as dept1 admin
            with self.client.session_transaction() as session:
                session['user_id'] = 1
                session['department_id'] = dept1.id
                session['department_code'] = dept1.code
                session['user_role'] = 'admin'
                session['logged_in'] = True
            
            # Try to access dept2's data
            response = self.client.get(f'/api/departments/{dept2.code}/map-features')
            
            # Should be forbidden or redirect to login
            self.assertIn(response.status_code, [401, 403, 302])

    def test_sensitive_location_masking(self):
        """Test masking of sensitive locations"""
        # Only test for departments with Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.features_enabled.get('fire_map_pro', False):
                # Mock data with sensitive locations
                hazards = [
                    {
                        'id': 1,
                        'name': 'Nuclear Materials Storage',
                        'sensitivity': 'high',
                        'latitude': 33.5,
                        'longitude': -112.1,
                        'details': 'Top secret nuclear material storage facility'
                    },
                    {
                        'id': 2,
                        'name': 'Chemical Factory',
                        'sensitivity': 'medium',
                        'latitude': 33.6,
                        'longitude': -112.2,
                        'details': 'Chemical manufacturing with hazardous materials'
                    },
                    {
                        'id': 3,
                        'name': 'Gas Station',
                        'sensitivity': 'low',
                        'latitude': 33.7,
                        'longitude': -112.3,
                        'details': 'Standard gas station'
                    }
                ]
                
                # Test with a regular user
                with self.client.session_transaction() as session:
                    session['user_id'] = 3
                    session['department_id'] = dept.id
                    session['department_code'] = dept.code
                    session['user_role'] = 'user'
                    session['logged_in'] = True
                
                # Mock the get_hazards_in_bounds function
                with patch('app.get_hazards_in_bounds', return_value=hazards):
                    response = self.client.get('/api/map/hazards')
                    
                    # Verify successful response
                    self.assertEqual(response.status_code, 200)
                    data = json.loads(response.data.decode('utf-8'))
                    
                    # Check that sensitive locations are properly masked or filtered
                    self.assertIn('hazards', data)
                    
                    # Iterate through hazards to check each one
                    found_high = False
                    found_medium = False
                    for hazard in data['hazards']:
                        if hazard['id'] == 1:  # High sensitivity
                            found_high = True
                            # High sensitivity locations should have masked details
                            self.assertNotIn('details', hazard)
                            # Coordinates might be slightly jittered
                            if 'precise_location' in hazard:
                                self.assertFalse(hazard['precise_location'])
                                
                        elif hazard['id'] == 2:  # Medium sensitivity
                            found_medium = True
                            # Medium sensitivity might have partial details
                            if 'details' in hazard:
                                self.assertNotEqual(hazard['details'], 'Chemical manufacturing with hazardous materials')
                    
                    # Depending on the implementation, high sensitivity might be filtered out
                    if not found_high:
                        # If high sensitivity is filtered, medium should still be visible
                        self.assertTrue(found_medium)

    def test_cache_control_headers(self):
        """Test proper cache control headers for sensitive data"""
        # Only test for departments with Fire Map Pro feature
        for code, dept in self.departments.items():
            if dept.features_enabled.get('fire_map_pro', False):
                response = self.client.get(f'/api/map/hazards')
                
                # Verify successful response
                self.assertEqual(response.status_code, 200)
                
                # Check for appropriate cache control headers
                self.assertIn('Cache-Control', response.headers)
                cache_control = response.headers['Cache-Control']
                
                # Should include no-store directive for sensitive data
                self.assertIn('no-store', cache_control)
                # And either no-cache or private
                self.assertTrue('no-cache' in cache_control or 'private' in cache_control)


# Run tests if executed directly
if __name__ == "__main__":
    unittest.main()