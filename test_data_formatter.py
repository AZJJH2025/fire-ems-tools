import unittest
import io
import json
import csv
from test_departments import DepartmentTestBase
from flask import url_for

class DataFormatterTests(DepartmentTestBase):
    """Test cases for the Data Formatter feature"""
    
    def setUp(self):
        super().setUp()
        
        # Sample CSV incident data for testing
        self.sample_csv_content = "IncidentNumber,IncidentDate,DispatchTime,EnRouteTime,ArrivalTime,IncidentType,Priority,Lat,Lon\n"
        self.sample_csv_content += "2023-001,1/1/2023,10:15:00 AM,10:17:30 AM,10:22:45 AM,Structure Fire,High,33.4484,-112.0740\n"
        self.sample_csv_content += "2023-002,1/2/2023,2:30:00 PM,2:31:15 PM,2:37:00 PM,Medical,Medium,33.4584,-112.0840\n"
        self.sample_csv_content += "2023-003,1/3/2023,8:45:00 PM,8:46:30 PM,8:53:15 PM,Hazmat,High,33.4684,-112.0640\n"
        
        # Sample JSON station data for testing
        self.sample_json_content = {
            "stations": [
                {
                    "id": "STA001",
                    "name": "Main Street Fire Station",
                    "address": "123 Main St, Phoenix, AZ",
                    "coordinates": {
                        "lat": 33.4484,
                        "lng": -112.0740
                    },
                    "units": ["Engine 1", "Ladder 1", "BC1"]
                },
                {
                    "id": "STA002",
                    "name": "Westside Fire Station",
                    "address": "456 West Ave, Phoenix, AZ",
                    "coordinates": {
                        "lat": 33.4584,
                        "lng": -112.0840
                    },
                    "units": ["Engine 2", "Ambulance 2"]
                }
            ]
        }
        
        # Check if we have a department filter
        if hasattr(self, '_department_filter'):
            self.dept_codes = [self._department_filter]
        else:
            self.dept_codes = self.departments.keys()
    
    def test_data_formatter_page_loads(self):
        """Test that the data formatter page loads properly"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing data formatter page for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                response = client.get('/data-formatter')
                self.assertEqual(response.status_code, 200)
                self.assertIn(b'Data Formatter', response.data)
                self.assertIn(b'Transform', response.data)
    
    def test_csv_upload_and_detection(self):
        """Test CSV file upload and format detection"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing CSV upload for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a test CSV file
                test_file = (io.BytesIO(self.sample_csv_content.encode()), 'test_incidents.csv')
                
                response = client.post('/api/data-formatter/upload',
                                     data={'file': test_file},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('fileType', response_data)
                self.assertEqual(response_data['fileType'], 'csv')
                self.assertIn('headers', response_data)
                expected_headers = ['IncidentNumber', 'IncidentDate', 'DispatchTime', 'EnRouteTime', 
                                  'ArrivalTime', 'IncidentType', 'Priority', 'Lat', 'Lon']
                self.assertEqual(response_data['headers'], expected_headers)
    
    def test_json_upload_and_detection(self):
        """Test JSON file upload and format detection"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing JSON upload for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a test JSON file
                test_file = (io.BytesIO(json.dumps(self.sample_json_content).encode()), 'test_stations.json')
                
                response = client.post('/api/data-formatter/upload',
                                     data={'file': test_file},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('fileType', response_data)
                self.assertEqual(response_data['fileType'], 'json')
                self.assertIn('structure', response_data)
                # Should detect stations array
                self.assertIn('stations', response_data['structure'])
    
    def test_data_transformation_for_response_time(self):
        """Test data transformation for the Response Time Analyzer tool"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing data transformation for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a test CSV file
                test_file = (io.BytesIO(self.sample_csv_content.encode()), 'test_incidents.csv')
                
                # First upload the file
                response = client.post('/api/data-formatter/upload',
                                     data={'file': test_file},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                upload_data = json.loads(response.data)
                session_id = upload_data.get('sessionId')
                
                # Now transform the data for response time analyzer
                transform_request = {
                    'sessionId': session_id,
                    'targetTool': 'response-time',
                    'fieldMapping': {
                        'Incident ID': 'IncidentNumber',
                        'Incident Date': 'IncidentDate',
                        'Dispatch Time': 'DispatchTime',
                        'En Route Time': 'EnRouteTime',
                        'On Scene Time': 'ArrivalTime',
                        'Incident Type': 'IncidentType',
                        'Priority': 'Priority',
                        'Latitude': 'Lat',
                        'Longitude': 'Lon'
                    },
                    'options': {
                        'dateFormat': 'MM/DD/YYYY',
                        'timeFormat': '12h',
                        'missingValues': 'auto-fill',
                        'coordinateFormat': 'decimal'
                    }
                }
                
                response = client.post('/api/data-formatter/transform',
                                     data=json.dumps(transform_request),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                transform_data = json.loads(response.data)
                self.assertIn('success', transform_data)
                self.assertTrue(transform_data['success'])
                self.assertIn('transformedData', transform_data)
                self.assertIn('records', transform_data)
                self.assertEqual(transform_data['records'], 3)  # Should have 3 records
                
                # Check output format
                transformed_rows = transform_data['transformedData']
                self.assertEqual(len(transformed_rows), 3)
                first_row = transformed_rows[0]
                
                # Should have standardized field names
                self.assertIn('Incident ID', first_row)
                self.assertIn('Incident Date', first_row)
                self.assertIn('Dispatch Time', first_row)
                self.assertIn('En Route Time', first_row)
                self.assertIn('On Scene Time', first_row)
                
                # Should have standardized date format
                self.assertEqual(first_row['Incident Date'], '2023-01-01')
    
    def test_data_transformation_for_isochrone_map(self):
        """Test data transformation for the Isochrone Map tool"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing isochrone transformation for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a test JSON file
                test_file = (io.BytesIO(json.dumps(self.sample_json_content).encode()), 'test_stations.json')
                
                # First upload the file
                response = client.post('/api/data-formatter/upload',
                                     data={'file': test_file},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                upload_data = json.loads(response.data)
                session_id = upload_data.get('sessionId')
                
                # Now transform the data for isochrone map
                transform_request = {
                    'sessionId': session_id,
                    'targetTool': 'isochrone',
                    'fieldMapping': {
                        'Station ID': 'stations.id',
                        'Station Name': 'stations.name',
                        'Station Address': 'stations.address',
                        'Latitude': 'stations.coordinates.lat',
                        'Longitude': 'stations.coordinates.lng',
                        'Unit Types': 'stations.units'
                    },
                    'options': {
                        'coordinateFormat': 'decimal',
                        'flattenArrays': True
                    }
                }
                
                response = client.post('/api/data-formatter/transform',
                                     data=json.dumps(transform_request),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                transform_data = json.loads(response.data)
                self.assertIn('success', transform_data)
                self.assertTrue(transform_data['success'])
                self.assertIn('transformedData', transform_data)
                self.assertIn('records', transform_data)
                self.assertEqual(transform_data['records'], 2)  # Should have 2 station records
                
                # Check output format
                transformed_rows = transform_data['transformedData']
                self.assertEqual(len(transformed_rows), 2)
                first_row = transformed_rows[0]
                
                # Should have standardized field names
                self.assertIn('Station ID', first_row)
                self.assertIn('Station Name', first_row)
                self.assertIn('Station Address', first_row)
                self.assertIn('Latitude', first_row)
                self.assertIn('Longitude', first_row)
                self.assertIn('Unit Types', first_row)
                
                # Check actual values
                self.assertEqual(first_row['Station ID'], 'STA001')
                self.assertEqual(first_row['Station Name'], 'Main Street Fire Station')
                self.assertEqual(first_row['Latitude'], 33.4484)
                self.assertEqual(first_row['Longitude'], -112.0740)
                # Units should be flattened to a string
                self.assertIn('Engine 1', first_row['Unit Types'])
    
    def test_transformed_data_download(self):
        """Test downloading the transformed data"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing data download for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a test CSV file
                test_file = (io.BytesIO(self.sample_csv_content.encode()), 'test_incidents.csv')
                
                # First upload the file
                response = client.post('/api/data-formatter/upload',
                                     data={'file': test_file},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                upload_data = json.loads(response.data)
                session_id = upload_data.get('sessionId')
                
                # Transform the data
                transform_request = {
                    'sessionId': session_id,
                    'targetTool': 'call-density',
                    'fieldMapping': {
                        'Incident ID': 'IncidentNumber',
                        'Incident Date': 'IncidentDate',
                        'Incident Time': 'DispatchTime',
                        'Latitude': 'Lat',
                        'Longitude': 'Lon',
                        'Incident Type': 'IncidentType',
                        'Priority': 'Priority'
                    },
                    'options': {
                        'dateFormat': 'MM/DD/YYYY',
                        'timeFormat': '12h'
                    }
                }
                
                response = client.post('/api/data-formatter/transform',
                                     data=json.dumps(transform_request),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Now try to download the transformed data as CSV
                response = client.get(f'/api/data-formatter/download?sessionId={session_id}&format=csv')
                
                self.assertEqual(response.status_code, 200)
                self.assertIn('text/csv', response.content_type.lower())
                
                # Parse the CSV data
                csv_data = response.data.decode('utf-8')
                csv_reader = csv.reader(csv_data.splitlines())
                headers = next(csv_reader)
                
                # Check headers
                expected_headers = ['Incident ID', 'Incident Date', 'Incident Time', 
                                  'Latitude', 'Longitude', 'Incident Type', 'Priority']
                for header in expected_headers:
                    self.assertIn(header, headers)
                
                # Check row count
                rows = list(csv_reader)
                self.assertEqual(len(rows), 3)  # Should have 3 data rows
    
    def test_sending_transformed_data_to_tool(self):
        """Test sending transformed data to target tool"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing send to tool for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a test CSV file
                test_file = (io.BytesIO(self.sample_csv_content.encode()), 'test_incidents.csv')
                
                # First upload the file
                response = client.post('/api/data-formatter/upload',
                                     data={'file': test_file},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                upload_data = json.loads(response.data)
                session_id = upload_data.get('sessionId')
                
                # Transform the data for the call density tool
                transform_request = {
                    'sessionId': session_id,
                    'targetTool': 'call-density',
                    'fieldMapping': {
                        'Incident ID': 'IncidentNumber',
                        'Incident Date': 'IncidentDate',
                        'Incident Time': 'DispatchTime',
                        'Latitude': 'Lat',
                        'Longitude': 'Lon',
                        'Incident Type': 'IncidentType',
                        'Priority': 'Priority'
                    }
                }
                
                response = client.post('/api/data-formatter/transform',
                                     data=json.dumps(transform_request),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                
                # Test sending to target tool
                response = client.post('/api/data-formatter/send-to-tool',
                                     data=json.dumps({
                                         'sessionId': session_id,
                                         'targetTool': 'call-density'
                                     }),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                response_data = json.loads(response.data)
                self.assertIn('success', response_data)
                self.assertTrue(response_data['success'])
                self.assertIn('redirectUrl', response_data)
                self.assertEqual(response_data['redirectUrl'], '/call-density-heatmap')
    
    def test_field_mapping_suggestions(self):
        """Test field mapping suggestion functionality"""
        # For each department type
        for dept_code in self.dept_codes:
            with self.subTest(f"Testing field mapping suggestions for department {dept_code}"):
                client = self.create_authenticated_client(dept_code)
                
                # Create a test CSV file with common field names
                csv_content = "incident_id,incident_date,dispatch_time,en_route_time,arrival_time,type,latitude,longitude\n"
                csv_content += "2023-001,1/1/2023,10:15:00,10:17:30,10:22:45,Fire,33.4484,-112.0740\n"
                test_file = (io.BytesIO(csv_content.encode()), 'common_fields.csv')
                
                # Upload the file
                response = client.post('/api/data-formatter/upload',
                                     data={'file': test_file},
                                     content_type='multipart/form-data')
                
                self.assertEqual(response.status_code, 200)
                upload_data = json.loads(response.data)
                session_id = upload_data.get('sessionId')
                
                # Request field mapping suggestions for response time analyzer
                response = client.post('/api/data-formatter/suggest-mapping',
                                     data=json.dumps({
                                         'sessionId': session_id,
                                         'targetTool': 'response-time',
                                         'headers': ['incident_id', 'incident_date', 'dispatch_time', 
                                                 'en_route_time', 'arrival_time', 'type', 
                                                 'latitude', 'longitude']
                                     }),
                                     content_type='application/json')
                
                self.assertEqual(response.status_code, 200)
                suggestions = json.loads(response.data)
                self.assertIn('suggestions', suggestions)
                
                # Check that it correctly mapped common fields
                field_mappings = suggestions['suggestions']
                self.assertEqual(field_mappings['Incident ID'], 'incident_id')
                self.assertEqual(field_mappings['Incident Date'], 'incident_date')
                self.assertEqual(field_mappings['Dispatch Time'], 'dispatch_time')
                self.assertEqual(field_mappings['En Route Time'], 'en_route_time')
                self.assertEqual(field_mappings['On Scene Time'], 'arrival_time')
                self.assertEqual(field_mappings['Incident Type'], 'type')
                self.assertEqual(field_mappings['Latitude'], 'latitude')
                self.assertEqual(field_mappings['Longitude'], 'longitude')
    
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