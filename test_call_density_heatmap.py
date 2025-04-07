import unittest
import io
from test_departments import DepartmentTestBase
from flask import url_for, json
import logging

logger = logging.getLogger(__name__)

class CallDensityHeatmapTests(DepartmentTestBase):
    """Test cases for the Call Density Heatmap feature"""
    
    def setUp(self):
        super().setUp()
        # Set up specific test data for call density heatmap tests
        self.test_incident_data = [
            {
                "latitude": 33.4484,
                "longitude": -112.0740,
                "type": "fire",
                "date": "2023-01-01T10:30:00",
                "priority": "high"
            },
            {
                "latitude": 33.4584,
                "longitude": -112.0840,
                "type": "ems",
                "date": "2023-01-02T14:45:00",
                "priority": "medium"
            },
            {
                "latitude": 33.4684,
                "longitude": -112.0640,
                "type": "hazmat",
                "date": "2023-01-03T22:15:00",
                "priority": "high"
            }
        ]
        
        # Check if we have a department filter
        if hasattr(self, '_department_filter'):
            self.dept_codes = [self._department_filter]
        else:
            self.dept_codes = self.departments.keys()
    
    def test_call_density_page_loads(self):
        """Test that the call density heatmap page loads properly"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing call density page for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                response = client.get('/call-density-heatmap')
                self.assertEqual(response.status_code, 200)
                self.assertIn(b'Call Density Heatmap', response.data)
                self.assertIn(b'Upload Call Data', response.data)
    
    def test_data_upload_functionality(self):
        """Test the incident data upload functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing data upload for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a sample CSV file for testing
                csv_content = "latitude,longitude,type,date,priority\n"
                csv_content += "33.4484,-112.0740,fire,2023-01-01T10:30:00,high\n"
                csv_content += "33.4584,-112.0840,ems,2023-01-02T14:45:00,medium\n"
                csv_content += "33.4684,-112.0640,hazmat,2023-01-03T22:15:00,high"
                
                test_file = (io.BytesIO(csv_content.encode()), 'test_incidents.csv')
                
                response = client.post('/api/call-density/upload',
                                      data={'file': test_file},
                                      content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('incidents', response_data)
                self.assertEqual(len(response_data['incidents']), 3)
    
    def test_filter_functionality(self):
        """Test the incident filtering functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing filters for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/call-density/data', 
                                     data=json.dumps({"incidents": self.test_incident_data}),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test filtering by incident type
                filter_params = {
                    "type": "fire",
                    "time_period": "all"
                }
                
                response = client.post('/api/call-density/filter',
                                      data=json.dumps(filter_params),
                                      content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('incidents', response_data)
                self.assertEqual(len(response_data['incidents']), 1)
                self.assertEqual(response_data['incidents'][0]['type'], 'fire')
                
                # Test filtering by time of day
                filter_params = {
                    "type": "all",
                    "time_period": "hour",
                    "hour": 14
                }
                
                response = client.post('/api/call-density/filter',
                                      data=json.dumps(filter_params),
                                      content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('incidents', response_data)
                # At least one incident should be in the 14:00 hour
                found_matching_hour = False
                for incident in response_data['incidents']:
                    if "14:" in incident['date']:
                        found_matching_hour = True
                        break
                self.assertTrue(found_matching_hour)
    
    def test_hotspot_analysis(self):
        """Test the hotspot analysis functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing hotspot analysis for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/call-density/data', 
                                     data=json.dumps({"incidents": self.test_incident_data}),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Request hotspot analysis
                response = client.get('/api/call-density/hotspots')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('hotspots', response_data)
                self.assertIn('analysis', response_data)
                
                # Check if analysis contains expected fields
                self.assertIn('highest_density_area', response_data['analysis'])
                self.assertIn('incident_count', response_data['analysis'])
                self.assertIn('density_by_type', response_data['analysis'])
    
    def test_normalize_by_population(self):
        """Test the population normalization functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing population normalization for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/call-density/data', 
                                     data=json.dumps({"incidents": self.test_incident_data}),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Request normalized data
                response = client.post('/api/call-density/normalize',
                                      data=json.dumps({"normalize": True}),
                                      content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('normalized_data', response_data)
                self.assertIn('population_stats', response_data)
    
    def test_export_functionality(self):
        """Test the export functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing export for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # This might need to be a mock test as the actual export
                # is likely handled client-side with JavaScript
                response = client.get('/api/call-density/export/capabilities')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('formats', response_data)
                self.assertIn('png', response_data['formats'])
                self.assertIn('pdf', response_data['formats'])
    
    def test_real_time_updates(self):
        """Test real-time incident data updates if implemented"""
        # For each department type with real-time capabilities
        for dept_code, dept in self.departments.items():
            if dept_code in self.dept_codes and dept.get('has_real_time_data', False):
                with self.subTest(f"Testing real-time updates for department {dept_code}"):
                    client = self.create_authenticated_client(dept_code)
                    
                    # Test subscribing to real-time updates
                    response = client.post('/api/call-density/realtime/subscribe',
                                         data=json.dumps({"enable": True}),
                                         content_type='application/json')
                    
                    self.assertEqual(response.status_code, 200)
                    response_data = json.loads(response.data)
                    self.assertIn('subscription', response_data)
                    self.assertTrue(response_data['subscription']['active'])
                    
                    # Check for most recent incidents
                    response = client.get('/api/call-density/realtime/recent')
                    
                    self.assertEqual(response.status_code, 200)
                    response_data = json.loads(response.data)
                    self.assertIn('incidents', response_data)
    
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