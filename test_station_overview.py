import unittest
import io
import json
from test_departments import DepartmentTestBase
from flask import url_for

class StationOverviewTests(DepartmentTestBase):
    """Test cases for the Station Overview feature"""
    
    def setUp(self):
        super().setUp()
        # Set up specific test data for station overview tests
        self.test_station_data = [
            {
                "station_id": "STA-001",
                "name": "Main Street Fire Station",
                "address": "123 Main Street",
                "city": "Phoenix",
                "state": "AZ",
                "latitude": 33.4484,
                "longitude": -112.0740,
                "units": ["E1", "L1", "BC1"],
                "personnel": 12
            },
            {
                "station_id": "STA-002",
                "name": "Westside Fire Station",
                "address": "456 West Avenue",
                "city": "Phoenix",
                "state": "AZ",
                "latitude": 33.4584,
                "longitude": -112.0840,
                "units": ["E2", "A2"],
                "personnel": 8
            },
            {
                "station_id": "STA-003",
                "name": "Eastside Fire Station",
                "address": "789 East Boulevard",
                "city": "Phoenix",
                "state": "AZ",
                "latitude": 33.4684,
                "longitude": -112.0640,
                "units": ["E3", "A3", "HM3"],
                "personnel": 10
            }
        ]
        
        self.test_incident_data = [
            {
                "incident_id": "INC-001",
                "station_id": "STA-001",
                "unit_id": "E1",
                "dispatch_time": "2023-01-01T10:15:00",
                "en_route_time": "2023-01-01T10:17:30",
                "arrival_time": "2023-01-01T10:22:45",
                "clear_time": "2023-01-01T11:05:30",
                "incident_type": "FIRE",
                "priority": "HIGH",
                "latitude": 33.4494,
                "longitude": -112.0750
            },
            {
                "incident_id": "INC-002",
                "station_id": "STA-002",
                "unit_id": "A2",
                "dispatch_time": "2023-01-02T14:30:00",
                "en_route_time": "2023-01-02T14:31:15",
                "arrival_time": "2023-01-02T14:37:00",
                "clear_time": "2023-01-02T15:12:45",
                "incident_type": "EMS",
                "priority": "MEDIUM",
                "latitude": 33.4594,
                "longitude": -112.0850
            },
            {
                "incident_id": "INC-003",
                "station_id": "STA-003",
                "unit_id": "HM3",
                "dispatch_time": "2023-01-03T20:45:00",
                "en_route_time": "2023-01-03T20:46:30",
                "arrival_time": "2023-01-03T20:53:15",
                "clear_time": "2023-01-03T21:35:20",
                "incident_type": "HAZMAT",
                "priority": "HIGH",
                "latitude": 33.4694,
                "longitude": -112.0650
            },
            {
                "incident_id": "INC-004",
                "station_id": "STA-001",
                "unit_id": "L1",
                "dispatch_time": "2023-01-04T08:20:00",
                "en_route_time": "2023-01-04T08:22:00",
                "arrival_time": "2023-01-04T08:28:30",
                "clear_time": "2023-01-04T09:45:15",
                "incident_type": "RESCUE",
                "priority": "HIGH",
                "latitude": 33.4484,
                "longitude": -112.0760
            }
        ]
        
        # Check if we have a department filter
        if hasattr(self, '_department_filter'):
            self.dept_codes = [self._department_filter]
        else:
            self.dept_codes = self.departments.keys()
    
    def test_station_overview_page_loads(self):
        """Test that the station overview page loads properly"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing station overview page for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                response = client.get('/station-overview')
                self.assertEqual(response.status_code, 200)
                self.assertIn(b'Station Overview Dashboard', response.data)
                self.assertIn(b'Upload Station Data', response.data)
    
    def test_station_data_upload(self):
        """Test the station data upload functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing station data upload for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a sample CSV file for testing
                csv_content = "station_id,name,address,city,state,latitude,longitude,units,personnel\n"
                csv_content += "STA-001,Main Street Fire Station,123 Main Street,Phoenix,AZ,33.4484,-112.0740,\"E1,L1,BC1\",12\n"
                csv_content += "STA-002,Westside Fire Station,456 West Avenue,Phoenix,AZ,33.4584,-112.0840,\"E2,A2\",8\n"
                csv_content += "STA-003,Eastside Fire Station,789 East Boulevard,Phoenix,AZ,33.4684,-112.0640,\"E3,A3,HM3\",10"
                
                test_file = (io.BytesIO(csv_content.encode()), 'test_stations.csv')
                
                response = client.post('/api/station-overview/upload',
                                     data={'file': test_file},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('stations', response_data)
                self.assertEqual(len(response_data['stations']), 3)
    
    def test_station_data_api(self):
        """Test the station data API endpoints"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing station data API for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/station-overview/data', 
                                     data=json.dumps({
                                         "stations": self.test_station_data,
                                         "incidents": self.test_incident_data
                                     }),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test getting all stations
                response = client.get('/api/station-overview/stations')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('stations', response_data)
                self.assertEqual(len(response_data['stations']), 3)
                
                # Test getting a specific station
                response = client.get('/api/station-overview/stations/STA-001')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('station', response_data)
                self.assertEqual(response_data['station']['station_id'], 'STA-001')
                self.assertEqual(response_data['station']['name'], 'Main Street Fire Station')
    
    def test_station_metrics_calculation(self):
        """Test the station metrics calculation functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing station metrics for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/station-overview/data', 
                                     data=json.dumps({
                                         "stations": self.test_station_data,
                                         "incidents": self.test_incident_data
                                     }),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test metrics for all stations
                response = client.get('/api/station-overview/metrics')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('metrics', response_data)
                
                # Check for expected metrics
                metrics = response_data['metrics']
                self.assertIn('response_times', metrics)
                self.assertIn('call_volume', metrics)
                self.assertIn('unit_utilization', metrics)
                
                # Test metrics for a specific station
                response = client.get('/api/station-overview/metrics/STA-001')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('metrics', response_data)
                self.assertEqual(response_data['station_id'], 'STA-001')
                
                # Verify station has 2 incidents in our test data
                self.assertEqual(response_data['metrics']['call_volume']['total'], 2)
    
    def test_station_filtering(self):
        """Test the station filtering functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing station filtering for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/station-overview/data', 
                                     data=json.dumps({
                                         "stations": self.test_station_data,
                                         "incidents": self.test_incident_data
                                     }),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test filtering by date range
                filter_params = {
                    "dateFrom": "2023-01-01",
                    "dateTo": "2023-01-02",
                    "station": "all",
                    "callType": "all"
                }
                
                response = client.post('/api/station-overview/filter',
                                     data=json.dumps(filter_params),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('incidents', response_data)
                self.assertEqual(len(response_data['incidents']), 2)  # Should have first 2 incidents
                
                # Test filtering by call type
                filter_params = {
                    "dateFrom": "2023-01-01",
                    "dateTo": "2023-01-04",
                    "station": "all",
                    "callType": "FIRE"
                }
                
                response = client.post('/api/station-overview/filter',
                                     data=json.dumps(filter_params),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('incidents', response_data)
                self.assertEqual(len(response_data['incidents']), 1)  # Should have 1 FIRE incident
                
                # Test filtering by station
                filter_params = {
                    "dateFrom": "2023-01-01",
                    "dateTo": "2023-01-04",
                    "station": "STA-001",
                    "callType": "all"
                }
                
                response = client.post('/api/station-overview/filter',
                                     data=json.dumps(filter_params),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('incidents', response_data)
                self.assertEqual(len(response_data['incidents']), 2)  # Should have 2 incidents from STA-001
    
    def test_unit_utilization(self):
        """Test the unit utilization calculation functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing unit utilization for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/station-overview/data', 
                                     data=json.dumps({
                                         "stations": self.test_station_data,
                                         "incidents": self.test_incident_data
                                     }),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test unit utilization endpoint
                response = client.get('/api/station-overview/utilization')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('units', response_data)
                
                # Check for unit data
                units = response_data['units']
                self.assertTrue(len(units) >= 5)  # We have 5 units in our test data
                
                # Check individual unit
                e1_data = next((unit for unit in units if unit['unit_id'] == 'E1'), None)
                self.assertIsNotNone(e1_data)
                self.assertEqual(e1_data['station_id'], 'STA-001')
                self.assertIn('utilization_percentage', e1_data)
                self.assertIn('total_time', e1_data)
                self.assertIn('total_incidents', e1_data)
    
    def test_response_time_analysis(self):
        """Test the response time analysis functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing response time analysis for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/station-overview/data', 
                                     data=json.dumps({
                                         "stations": self.test_station_data,
                                         "incidents": self.test_incident_data
                                     }),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test response time analysis endpoint
                response = client.get('/api/station-overview/response-times')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('response_times', response_data)
                
                # Check for response time data structure
                response_times = response_data['response_times']
                self.assertIn('average', response_times)
                self.assertIn('by_station', response_times)
                self.assertIn('by_priority', response_times)
                self.assertIn('by_call_type', response_times)
                
                # Verify specific data
                station_times = response_times['by_station']
                self.assertTrue(len(station_times) >= 3)  # We have 3 stations
                
                # Check times for a specific station
                sta001_times = next((item for item in station_times if item['station_id'] == 'STA-001'), None)
                self.assertIsNotNone(sta001_times)
                self.assertIn('turnout_time', sta001_times)
                self.assertIn('travel_time', sta001_times)
                self.assertIn('total_response_time', sta001_times)
    
    def test_station_map_data(self):
        """Test the station map data functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing station map data for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/station-overview/data', 
                                     data=json.dumps({
                                         "stations": self.test_station_data,
                                         "incidents": self.test_incident_data
                                     }),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test map data endpoint
                response = client.get('/api/station-overview/map-data')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('stations', response_data)
                self.assertIn('incidents', response_data)
                
                # Check map data structure
                stations = response_data['stations']
                self.assertEqual(len(stations), 3)  # We have 3 stations
                
                # Verify station data includes coordinates
                for station in stations:
                    self.assertIn('latitude', station)
                    self.assertIn('longitude', station)
                    self.assertIn('name', station)
                    self.assertIn('station_id', station)
    
    def test_export_functionality(self):
        """Test the data export functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing data export for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # First upload test data
                response = client.post('/api/station-overview/data', 
                                     data=json.dumps({
                                         "stations": self.test_station_data,
                                         "incidents": self.test_incident_data
                                     }),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test export endpoint for CSV
                response = client.get('/api/station-overview/export?format=csv&type=metrics')
                
                self.assertEqual(response.status_code, 200)
                self.assertIn('text/csv', response.content_type.lower())
                
                # Check that the CSV contains expected headers
                csv_data = response.data.decode('utf-8')
                self.assertIn('station_id', csv_data)
                self.assertIn('name', csv_data)
                self.assertIn('total_incidents', csv_data)
                self.assertIn('average_response_time', csv_data)
                
                # Test export endpoint for Excel
                response = client.get('/api/station-overview/export?format=excel&type=metrics')
                
                self.assertEqual(response.status_code, 200)
                self.assertIn('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                            response.content_type.lower())
    
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