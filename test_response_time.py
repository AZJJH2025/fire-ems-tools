import unittest
import io
from test_departments import DepartmentTestBase
from flask import url_for, json
import logging

logger = logging.getLogger(__name__)

class ResponseTimeAnalyzerTests(DepartmentTestBase):
    """Test cases for the Response Time Analyzer feature"""
    
    def setUp(self):
        super().setUp()
        # Set up specific test data for response time analyzer tests
        self.test_response_data = [
            {
                "incident_id": "INC-2023-001",
                "station_id": "STA-001",
                "dispatch_time": "2023-01-01T10:15:00",
                "en_route_time": "2023-01-01T10:17:30",
                "arrival_time": "2023-01-01T10:22:45",
                "incident_type": "structure_fire",
                "priority": "high",
                "location": {
                    "latitude": 33.4484,
                    "longitude": -112.0740
                }
            },
            {
                "incident_id": "INC-2023-002",
                "station_id": "STA-002",
                "dispatch_time": "2023-01-02T14:30:00",
                "en_route_time": "2023-01-02T14:31:15",
                "arrival_time": "2023-01-02T14:37:00",
                "incident_type": "medical",
                "priority": "medium",
                "location": {
                    "latitude": 33.4584,
                    "longitude": -112.0840
                }
            },
            {
                "incident_id": "INC-2023-003",
                "station_id": "STA-001",
                "dispatch_time": "2023-01-03T20:45:00",
                "en_route_time": "2023-01-03T20:46:30",
                "arrival_time": "2023-01-03T20:53:15",
                "incident_type": "hazmat",
                "priority": "high",
                "location": {
                    "latitude": 33.4684,
                    "longitude": -112.0640
                }
            }
        ]
        
        # Check if we have a department filter
        if hasattr(self, '_department_filter'):
            self.dept_codes = [self._department_filter]
        else:
            self.dept_codes = self.departments.keys()
    
    def test_response_time_page_loads(self):
        """Test that the response time analyzer page loads properly"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing response time page for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                response = client.get('/fire-ems-dashboard')
                self.assertEqual(response.status_code, 200)
                self.assertIn(b'Response Time Analyzer', response.data)
                # Check for key components in the page
                self.assertIn(b'Time Trends', response.data)
                self.assertIn(b'Response Statistics', response.data)
    
    def test_response_time_data_upload(self):
        """Test the response time data upload functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing data upload for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a sample CSV file for testing
                csv_content = "incident_id,station_id,dispatch_time,en_route_time,arrival_time,incident_type,priority,latitude,longitude\n"
                csv_content += "INC-2023-001,STA-001,2023-01-01T10:15:00,2023-01-01T10:17:30,2023-01-01T10:22:45,structure_fire,high,33.4484,-112.0740\n"
                csv_content += "INC-2023-002,STA-002,2023-01-02T14:30:00,2023-01-02T14:31:15,2023-01-02T14:37:00,medical,medium,33.4584,-112.0840\n"
                csv_content += "INC-2023-003,STA-001,2023-01-03T20:45:00,2023-01-03T20:46:30,2023-01-03T20:53:15,hazmat,high,33.4684,-112.0640"
                
                test_file = (io.BytesIO(csv_content.encode()), 'test_response_times.csv')
                
                response = client.post('/api/response-time/upload',
                                     data={'file': test_file},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('incidents', response_data)
                self.assertEqual(len(response_data['incidents']), 3)
    
    def test_response_time_calculation(self):
        """Test the response time calculation functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing response time calculation for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/response-time/data', 
                                     data=json.dumps({"incidents": self.test_response_data}),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test time calculation endpoint
                response = client.get('/api/response-time/calculate')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('calculations', response_data)
                
                # Validate calculation results
                calculations = response_data['calculations']
                self.assertIn('average_turnout_time', calculations)
                self.assertIn('average_travel_time', calculations)
                self.assertIn('average_total_response_time', calculations)
                
                # Verify the calculation for the first incident
                # Turnout time (en_route - dispatch): 2:30 minutes
                # Travel time (arrival - en_route): 5:15 minutes
                # Total response time (arrival - dispatch): 7:45 minutes
                incident_calculations = next((calc for calc in calculations.get('by_incident', []) 
                                           if calc['incident_id'] == 'INC-2023-001'), None)
                
                self.assertIsNotNone(incident_calculations)
                self.assertAlmostEqual(incident_calculations['turnout_time'], 2.5, delta=0.1)  # 2.5 minutes
                self.assertAlmostEqual(incident_calculations['travel_time'], 5.25, delta=0.1)  # 5.25 minutes
                self.assertAlmostEqual(incident_calculations['total_response_time'], 7.75, delta=0.1)  # 7.75 minutes
    
    def test_response_time_filtering(self):
        """Test the response time filtering functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing response time filtering for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/response-time/data', 
                                     data=json.dumps({"incidents": self.test_response_data}),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test filtering by incident type
                filter_params = {
                    "incident_type": "structure_fire",
                    "time_period": "all"
                }
                
                response = client.post('/api/response-time/filter',
                                     data=json.dumps(filter_params),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('incidents', response_data)
                self.assertEqual(len(response_data['incidents']), 1)
                self.assertEqual(response_data['incidents'][0]['incident_type'], 'structure_fire')
                
                # Test filtering by station
                filter_params = {
                    "station_id": "STA-001",
                    "time_period": "all"
                }
                
                response = client.post('/api/response-time/filter',
                                     data=json.dumps(filter_params),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('incidents', response_data)
                self.assertEqual(len(response_data['incidents']), 2)
                # All incidents should be from station STA-001
                for incident in response_data['incidents']:
                    self.assertEqual(incident['station_id'], 'STA-001')
    
    def test_response_time_trends(self):
        """Test the response time trends analysis functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing response time trends for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/response-time/data', 
                                     data=json.dumps({"incidents": self.test_response_data}),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test trends analysis
                response = client.get('/api/response-time/trends')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('trends', response_data)
                
                # Check for expected trend data
                trends = response_data['trends']
                self.assertIn('by_month', trends)
                self.assertIn('by_day_of_week', trends)
                self.assertIn('by_hour_of_day', trends)
                self.assertIn('by_incident_type', trends)
    
    def test_response_time_statistics(self):
        """Test the response time statistics functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing response time statistics for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/response-time/data', 
                                     data=json.dumps({"incidents": self.test_response_data}),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test statistics endpoint
                response = client.get('/api/response-time/statistics')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('statistics', response_data)
                
                # Check for expected statistical measures
                statistics = response_data['statistics']
                self.assertIn('mean', statistics)
                self.assertIn('median', statistics)
                self.assertIn('percentile_90th', statistics)
                self.assertIn('min', statistics)
                self.assertIn('max', statistics)
                self.assertIn('standard_deviation', statistics)
    
    def test_response_time_export(self):
        """Test the response time data export functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing data export for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/response-time/data', 
                                     data=json.dumps({"incidents": self.test_response_data}),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test export endpoint
                response = client.get('/api/response-time/export?format=csv')
                
                self.assertEqual(response.status_code, 200)
                self.assertIn('text/csv', response.content_type.lower())
                
                # Check that the CSV contains headers and data
                csv_data = response.data.decode('utf-8')
                self.assertIn('incident_id', csv_data)
                self.assertIn('turnout_time', csv_data)
                self.assertIn('travel_time', csv_data)
                self.assertIn('total_response_time', csv_data)
                
                # Test PDF export if available
                response = client.get('/api/response-time/export?format=pdf')
                
                # This might need to be mocked if PDF generation is complex
                self.assertEqual(response.status_code, 200)
                self.assertIn('application/pdf', response.content_type.lower())
    
    def test_response_time_compliance(self):
        """Test the response time compliance analysis functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing compliance analysis for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/response-time/data', 
                                     data=json.dumps({"incidents": self.test_response_data}),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Set compliance targets
                compliance_targets = {
                    "turnout_time": {
                        "fire": 80,        # 80 seconds
                        "ems": 60          # 60 seconds
                    },
                    "travel_time": {
                        "urban": 240,      # 4 minutes
                        "suburban": 360,   # 6 minutes
                        "rural": 480       # 8 minutes
                    },
                    "total_response_time": {
                        "urban": 320,      # 5 minutes 20 seconds
                        "suburban": 440,   # 7 minutes 20 seconds
                        "rural": 560       # 9 minutes 20 seconds
                    }
                }
                
                response = client.post('/api/response-time/compliance/targets',
                                     data=json.dumps(compliance_targets),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test compliance analysis
                response = client.get('/api/response-time/compliance/analysis')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('compliance', response_data)
                
                # Check for compliance metrics
                compliance = response_data['compliance']
                self.assertIn('turnout_time_compliance', compliance)
                self.assertIn('travel_time_compliance', compliance)
                self.assertIn('total_response_time_compliance', compliance)
                
                # Metrics should include percentages
                self.assertIn('percentage', compliance['turnout_time_compliance'])
                self.assertIn('percentage', compliance['travel_time_compliance'])
                self.assertIn('percentage', compliance['total_response_time_compliance'])
    
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