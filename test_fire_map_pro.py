import unittest
import io
import json
from test_departments import DepartmentTestBase
from flask import url_for

class FireMapProTests(DepartmentTestBase):
    """Test cases for the Fire Map Pro feature"""
    
    def setUp(self):
        super().setUp()
        # Set up specific test data for Fire Map Pro tests
        self.test_map_data = {
            "name": "Test Fire Plan",
            "description": "Test map for fire planning",
            "center": {
                "latitude": 33.4484,
                "longitude": -112.0740
            },
            "zoom": 13,
            "base_layer": "street",
            "features": [
                {
                    "type": "marker",
                    "latitude": 33.4484,
                    "longitude": -112.0740,
                    "title": "Fire Station 1",
                    "description": "Main headquarters",
                    "icon": "fire-station",
                    "properties": {
                        "category": "infrastructure",
                        "status": "active"
                    }
                },
                {
                    "type": "polygon",
                    "coordinates": [
                        [33.4484, -112.0740],
                        [33.4584, -112.0840],
                        [33.4684, -112.0640],
                        [33.4484, -112.0740]
                    ],
                    "title": "Response Area 1",
                    "description": "Primary response zone",
                    "style": {
                        "color": "#FF0000",
                        "weight": 2,
                        "fillColor": "#FF9999",
                        "fillOpacity": 0.3
                    },
                    "properties": {
                        "category": "operational",
                        "priority": "high"
                    }
                },
                {
                    "type": "polyline",
                    "coordinates": [
                        [33.4484, -112.0740],
                        [33.4584, -112.0840],
                        [33.4684, -112.0640]
                    ],
                    "title": "Evacuation Route A",
                    "description": "Primary evacuation path",
                    "style": {
                        "color": "#0000FF",
                        "weight": 3,
                        "dashArray": "5,5"
                    },
                    "properties": {
                        "category": "planning",
                        "type": "evacuation"
                    }
                }
            ],
            "layers": [
                {
                    "name": "Infrastructure",
                    "visible": true,
                    "features": ["Fire Station 1"]
                },
                {
                    "name": "Response Areas",
                    "visible": true,
                    "features": ["Response Area 1"]
                },
                {
                    "name": "Evacuation Routes",
                    "visible": true,
                    "features": ["Evacuation Route A"]
                }
            ]
        }
        
        # Check if we have a department filter
        if hasattr(self, '_department_filter'):
            self.dept_codes = [self._department_filter]
        else:
            self.dept_codes = self.departments.keys()
    
    def test_fire_map_pro_page_loads(self):
        """Test that the Fire Map Pro page loads properly"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing Fire Map Pro page for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                response = client.get('/fire-map-pro')
                self.assertEqual(response.status_code, 200)
                self.assertIn(b'FireMapPro', response.data)
                # Check for key map controls
                self.assertIn(b'Map Controls', response.data)
                self.assertIn(b'Draw Tools', response.data)
    
    def test_map_creation_and_saving(self):
        """Test the map creation and saving functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing map creation for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Test creating a new map
                response = client.post('/api/fire-map-pro/maps',
                                     data=json.dumps(self.test_map_data),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('map_id', response_data)
                
                # Store the map ID for subsequent tests
                map_id = response_data['map_id']
                
                # Test retrieving the created map
                response = client.get(f'/api/fire-map-pro/maps/{map_id}')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('map', response_data)
                self.assertEqual(response_data['map']['name'], 'Test Fire Plan')
                self.assertEqual(len(response_data['map']['features']), 3)
    
    def test_map_listing(self):
        """Test the map listing functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing map listing for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First create a test map
                response = client.post('/api/fire-map-pro/maps',
                                     data=json.dumps(self.test_map_data),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test listing all maps
                response = client.get('/api/fire-map-pro/maps')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('maps', response_data)
                self.assertTrue(len(response_data['maps']) >= 1)
                
                # Verify our test map is in the list
                test_map = next((m for m in response_data['maps'] if m['name'] == 'Test Fire Plan'), None)
                self.assertIsNotNone(test_map)
    
    def test_map_feature_editing(self):
        """Test the map feature editing functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing feature editing for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First create a test map
                response = client.post('/api/fire-map-pro/maps',
                                     data=json.dumps(self.test_map_data),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                map_id = json.loads(response.data)['map_id']
                
                # Get the feature ID from the created map
                response = client.get(f'/api/fire-map-pro/maps/{map_id}')
                self.assertEqual(response.status_code, 200)
                map_data = json.loads(response.data)['map']
                feature_id = map_data['features'][0]['id']  # First feature (marker)
                
                # Test editing a feature
                edit_data = {
                    "title": "Updated Fire Station 1",
                    "description": "Updated headquarters",
                    "icon": "fire-station-2",
                    "properties": {
                        "category": "infrastructure",
                        "status": "under-construction"
                    }
                }
                
                response = client.put(f'/api/fire-map-pro/maps/{map_id}/features/{feature_id}',
                                    data=json.dumps(edit_data),
                                    content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                
                # Verify the edit was applied
                response = client.get(f'/api/fire-map-pro/maps/{map_id}')
                map_data = json.loads(response.data)['map']
                edited_feature = next((f for f in map_data['features'] if f['id'] == feature_id), None)
                self.assertEqual(edited_feature['title'], 'Updated Fire Station 1')
                self.assertEqual(edited_feature['properties']['status'], 'under-construction')
    
    def test_map_layer_management(self):
        """Test the map layer management functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing layer management for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First create a test map
                response = client.post('/api/fire-map-pro/maps',
                                     data=json.dumps(self.test_map_data),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                map_id = json.loads(response.data)['map_id']
                
                # Get the layer ID from the created map
                response = client.get(f'/api/fire-map-pro/maps/{map_id}')
                self.assertEqual(response.status_code, 200)
                map_data = json.loads(response.data)['map']
                layer_id = map_data['layers'][0]['id']  # First layer
                
                # Test adding a new layer
                new_layer = {
                    "name": "Critical Infrastructure",
                    "visible": true,
                    "features": []
                }
                
                response = client.post(f'/api/fire-map-pro/maps/{map_id}/layers',
                                     data=json.dumps(new_layer),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('layer_id', response_data)
                
                # Test editing a layer
                edit_data = {
                    "name": "Emergency Infrastructure",
                    "visible": false
                }
                
                response = client.put(f'/api/fire-map-pro/maps/{map_id}/layers/{layer_id}',
                                    data=json.dumps(edit_data),
                                    content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Verify the edit was applied
                response = client.get(f'/api/fire-map-pro/maps/{map_id}')
                map_data = json.loads(response.data)['map']
                edited_layer = next((l for l in map_data['layers'] if l['id'] == layer_id), None)
                self.assertEqual(edited_layer['name'], 'Emergency Infrastructure')
                self.assertFalse(edited_layer['visible'])
    
    def test_map_import_export(self):
        """Test the map import and export functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing map import/export for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First create a test map
                response = client.post('/api/fire-map-pro/maps',
                                     data=json.dumps(self.test_map_data),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                map_id = json.loads(response.data)['map_id']
                
                # Test exporting the map as GeoJSON
                response = client.get(f'/api/fire-map-pro/maps/{map_id}/export?format=geojson')
                
                self.assertEqual(response.status_code, 200)
                self.assertIn('application/json', response.content_type.lower())
                
                geojson_data = json.loads(response.data)
                self.assertIn('type', geojson_data)
                self.assertEqual(geojson_data['type'], 'FeatureCollection')
                self.assertIn('features', geojson_data)
                
                # Test exporting the map as KML
                response = client.get(f'/api/fire-map-pro/maps/{map_id}/export?format=kml')
                
                self.assertEqual(response.status_code, 200)
                self.assertIn('application/vnd.google-earth.kml+xml', response.content_type.lower())
                
                # Test importing a GeoJSON file
                geojson_content = {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [-112.0950, 33.4550]
                            },
                            "properties": {
                                "name": "Imported Point",
                                "description": "This was imported"
                            }
                        }
                    ]
                }
                
                test_file = (io.BytesIO(json.dumps(geojson_content).encode()), 'test_import.geojson')
                
                response = client.post('/api/fire-map-pro/import',
                                     data={'file': test_file, 'map_id': map_id},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('features_added', response_data)
                self.assertEqual(response_data['features_added'], 1)
    
    def test_icon_library(self):
        """Test the icon library functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing icon library for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Test retrieving all available icons
                response = client.get('/api/fire-map-pro/icons')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('icons', response_data)
                self.assertIn('categories', response_data)
                
                # Verify icon data structure
                icons = response_data['icons']
                self.assertTrue(len(icons) > 0)
                
                # Check first icon has required properties
                first_icon = icons[0]
                self.assertIn('id', first_icon)
                self.assertIn('name', first_icon)
                self.assertIn('category', first_icon)
                self.assertIn('url', first_icon)
                
                # Test retrieving icons by category
                categories = response_data['categories']
                if len(categories) > 0:
                    first_category = categories[0]
                    response = client.get(f'/api/fire-map-pro/icons?category={first_category}')
                    
                    self.assertEqual(response.status_code, 200)
                    category_icons = json.loads(response.data)['icons']
                    self.assertTrue(len(category_icons) > 0)
                    # All icons should be in the requested category
                    for icon in category_icons:
                        self.assertEqual(icon['category'], first_category)
    
    def test_map_sharing(self):
        """Test the map sharing functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing map sharing for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First create a test map
                response = client.post('/api/fire-map-pro/maps',
                                     data=json.dumps(self.test_map_data),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                map_id = json.loads(response.data)['map_id']
                
                # Test generating a share link
                response = client.post(f'/api/fire-map-pro/maps/{map_id}/share',
                                     data=json.dumps({
                                         "permission": "view",
                                         "expiration": "2023-12-31T23:59:59"
                                     }),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('share_url', response_data)
                self.assertIn('token', response_data)
                
                # Test viewing shared map permissions
                response = client.get(f'/api/fire-map-pro/maps/{map_id}/share')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('shares', response_data)
                shares = response_data['shares']
                self.assertTrue(len(shares) > 0)
                
                # Find our recently created share
                share = shares[0]
                self.assertIn('token', share)
                self.assertIn('permission', share)
                self.assertEqual(share['permission'], 'view')
    
    def test_image_overlay(self):
        """Test the image overlay functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing image overlay for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First create a test map
                response = client.post('/api/fire-map-pro/maps',
                                     data=json.dumps(self.test_map_data),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                map_id = json.loads(response.data)['map_id']
                
                # Create a simple PNG image for testing
                from PIL import Image
                img = Image.new('RGB', (100, 100), color = 'red')
                img_io = io.BytesIO()
                img.save(img_io, 'PNG')
                img_io.seek(0)
                
                test_image = (img_io, 'test_overlay.png')
                
                # Test adding an image overlay
                overlay_data = {
                    "name": "Test Overlay",
                    "bounds": [
                        [33.4484, -112.0740],
                        [33.4684, -112.0540]
                    ],
                    "opacity": 0.7
                }
                
                response = client.post(f'/api/fire-map-pro/maps/{map_id}/overlays',
                                     data={
                                         'data': json.dumps(overlay_data),
                                         'image': test_image
                                     },
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('overlay_id', response_data)
                
                # Test listing all overlays
                response = client.get(f'/api/fire-map-pro/maps/{map_id}/overlays')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('overlays', response_data)
                overlays = response_data['overlays']
                self.assertEqual(len(overlays), 1)
                
                # Check overlay properties
                overlay = overlays[0]
                self.assertEqual(overlay['name'], 'Test Overlay')
                self.assertIn('url', overlay)
                self.assertIn('bounds', overlay)
    
    def create_authenticated_client(self, dept_code):
        """
        Create an authenticated client for the given department
        
        Args:
            dept_code (str): Department code to create client for
            
        Returns:
            flask.testing.FlaskClient: Authenticated test client
        """
        return self.get_admin_client(dept_code)

if __name__ == '__main__':
    unittest.main()