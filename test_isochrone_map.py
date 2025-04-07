import unittest
import io
from test_departments import DepartmentTestBase
from flask import url_for, json
import logging

logger = logging.getLogger(__name__)

class IsochroneMapTests(DepartmentTestBase):
    """Test cases for the Isochrone Map feature"""
    
    def setUp(self):
        super().setUp()
        # Set up specific test data for isochrone map tests
        self.test_station = {
            "name": "Test Station 1",
            "latitude": 33.4484,
            "longitude": -112.0740,
            "address": "123 Test Street",
            "city": "Phoenix",
            "state": "AZ",
            "zip": "85001"
        }
        
        # Check if we have a department filter
        if hasattr(self, '_department_filter'):
            self.dept_codes = [self._department_filter]
        else:
            self.dept_codes = self.departments.keys()
    
    def test_isochrone_map_page_loads(self):
        """Test that the isochrone map page loads properly"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing isochrone map page for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                response = client.get('/isochrone-map')
                self.assertEqual(response.status_code, 200)
                self.assertIn(b'Isochrone Map Generator', response.data)
                self.assertIn(b'Generate Isochrone Map', response.data)
    
    def test_isochrone_api_endpoint(self):
        """Test the isochrone generation API endpoint"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing isochrone API for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Sample request to generate isochrones for a station
                data = {
                    "latitude": self.test_station["latitude"],
                    "longitude": self.test_station["longitude"],
                    "intervals": [4, 8, 12],
                    "vehicle_type": "engine",
                    "time_of_day": "average"
                }
                
                response = client.post('/api/isochrones/generate', 
                                      data=json.dumps(data),
                                      content_type='application/json')
                
                # This test might need adjustment based on actual API response
                # It could be modified to mock the API response if the endpoint
                # makes external calls to routing services
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('isochrones', response_data)
    
    def test_isochrone_map_station_management(self):
        """Test station management functionality for isochrone map"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing station management for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Test adding a station
                data = {
                    "station": self.test_station
                }
                
                response = client.post('/api/isochrone/stations/add', 
                                      data=json.dumps(data),
                                      content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                
                # Test retrieving stations
                response = client.get('/api/isochrone/stations')
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('stations', response_data)
                self.assertTrue(len(response_data['stations']) > 0)

    def test_isochrone_coverage_analysis(self):
        """Test the coverage analysis functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing coverage analysis for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Sample request for coverage analysis
                data = {
                    "isochrones": [
                        {
                            "interval": 4,
                            "polygon": [
                                [33.4484, -112.0740],
                                [33.4584, -112.0840],
                                [33.4684, -112.0640],
                                [33.4484, -112.0740]
                            ]
                        },
                        {
                            "interval": 8,
                            "polygon": [
                                [33.4384, -112.0640],
                                [33.4684, -112.0940],
                                [33.4884, -112.0540],
                                [33.4384, -112.0640]
                            ]
                        }
                    ]
                }
                
                response = client.post('/api/isochrones/analyze', 
                                      data=json.dumps(data),
                                      content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('coverage', response_data)
                self.assertIn('area', response_data['coverage'])
                self.assertIn('population', response_data['coverage'])
    
    def test_isochrone_map_file_upload(self):
        """Test file upload functionality for the isochrone map"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing file upload for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a sample CSV file for testing
                csv_content = "name,latitude,longitude\nStation 1,33.4484,-112.0740\nStation 2,33.5484,-112.1740"
                test_file = (io.BytesIO(csv_content.encode()), 'test_stations.csv')
                
                response = client.post('/api/isochrone/upload/stations',
                                     data={'file': test_file},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('stations', response_data)
                self.assertEqual(len(response_data['stations']), 2)
    
    def test_map_export_functionality(self):
        """Test the map export functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing map export for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # This might need to be a mock test as the actual export
                # is likely handled client-side with JavaScript
                response = client.get('/api/isochrone/export/capabilities')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('formats', response_data)
                self.assertIn('png', response_data['formats'])
                self.assertIn('pdf', response_data['formats'])
    
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