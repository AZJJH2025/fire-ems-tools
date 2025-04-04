import unittest
import requests
import json
import os
import sys
from datetime import datetime, timedelta

# Add the current directory to the path so we can import the app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Configuration
TEST_SERVER = "http://localhost:8080"  # Update this if your server runs on a different port
API_BASE_URL = f"{TEST_SERVER}/api/v1"

# Test department credentials
# These will be populated in the setUp method
test_dept_code = None
test_api_key = None
test_admin_email = "test_admin@example.com"
test_admin_password = "test_password"
test_user_email = "test_user@example.com"
test_user_password = "test_password"

class APITestCase(unittest.TestCase):
    """Base test case with helper methods for API testing"""
    
    @classmethod
    def setUpClass(cls):
        """Create a test department and users if they don't exist"""
        try:
            # Login as super_admin to create test department
            # Note: This assumes a super_admin account exists
            # You should create one manually if it doesn't exist
            # or adjust this code to create the department differently
            
            # Try to login as super_admin (this will need to be configured manually)
            session = requests.Session()
            super_admin_login = session.post(f"{TEST_SERVER}/login", data={
                "email": "super_admin@example.com",  # Update this with a valid super_admin account
                "password": "admin_password"  # Update this with the correct password
            })
            
            # Create a test department
            if super_admin_login.status_code == 200:
                print("Creating test department...")
                
                # Generate unique code for the test department
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                global test_dept_code
                test_dept_code = f"test{timestamp}"
                
                # Create the department
                create_dept = session.post(f"{TEST_SERVER}/admin/departments/register", data={
                    "name": f"Test Department {timestamp}",
                    "code": test_dept_code,
                    "department_type": "combined",
                    "email": "test_dept@example.com",
                    "admin_name": "Test Admin",
                    "admin_email": test_admin_email,
                    "admin_password": test_admin_password,
                    "incident_logger": "on",
                    "call_density": "on",
                    "isochrone_map": "on",
                    "dashboard": "on"
                })
                
                if create_dept.status_code == 200 or "has been registered successfully" in create_dept.text:
                    print(f"Test department created with code: {test_dept_code}")
                else:
                    print("Failed to create test department.")
                    print(f"Status code: {create_dept.status_code}")
                    # Continue anyway, the department might already exist
                
                # Login as the test department admin
                admin_login = session.post(f"{TEST_SERVER}/login", data={
                    "email": test_admin_email,
                    "password": test_admin_password
                })
                
                if admin_login.status_code == 200:
                    print("Logged in as test department admin")
                    
                    # Enable API access and generate an API key
                    settings_response = session.get(f"{TEST_SERVER}/dept/{test_dept_code}/settings")
                    if settings_response.status_code == 200:
                        # Extract the CSRF token if needed (add code here if your app uses CSRF)
                        
                        # Enable API and generate key
                        update_settings = session.post(f"{TEST_SERVER}/dept/{test_dept_code}/settings", data={
                            "name": f"Test Department {timestamp}",
                            "code": test_dept_code,
                            "department_type": "combined",
                            "api_enabled": "on",
                            "generate_api_key": "true",
                            "incident_logger": "on",
                            "call_density": "on",
                            "isochrone_map": "on",
                            "dashboard": "on"
                        })
                        
                        if update_settings.status_code == 200:
                            print("API access enabled")
                            
                            # Get the API key
                            api_docs_response = session.get(f"{TEST_SERVER}/dept/{test_dept_code}/api-docs")
                            if api_docs_response.status_code == 200:
                                # Extract API key from the page
                                import re
                                api_key_match = re.search(r'id="api-key" value="([^"]+)"', api_docs_response.text)
                                if api_key_match:
                                    global test_api_key
                                    test_api_key = api_key_match.group(1)
                                    print(f"Extracted API key: {test_api_key}")
                                else:
                                    print("Could not extract API key")
                            
                            # Create a regular (non-admin) user
                            user_response = session.post(f"{TEST_SERVER}/dept/{test_dept_code}/users/add", data={
                                "name": "Test User",
                                "email": test_user_email,
                                "password": test_user_password,
                                "role": "user",
                                "is_active": "on"
                            })
                            
                            if user_response.status_code == 200:
                                print("Test user created")
                            else:
                                print(f"Failed to create test user. Status code: {user_response.status_code}")
                
                # Create some test incidents
                cls.create_test_incidents(session)
                
                # Logout
                session.get(f"{TEST_SERVER}/logout")
            
        except Exception as e:
            print(f"Error in test setup: {str(e)}")
    
    @classmethod
    def create_test_incidents(cls, session):
        """Create test incidents for the department"""
        try:
            # Create a few test incidents
            incidents = [
                {
                    "incident_title": "Test Medical Emergency",
                    "incident_number": "TEST-001",
                    "incident_date": datetime.now().isoformat(),
                    "incident_type": "EMS",
                    "location": "123 Test St",
                    "latitude": 37.7749,
                    "longitude": -122.4194
                },
                {
                    "incident_title": "Test Structure Fire",
                    "incident_number": "TEST-002",
                    "incident_date": (datetime.now() - timedelta(days=1)).isoformat(),
                    "incident_type": "Fire",
                    "location": "456 Test Ave",
                    "latitude": 37.7750,
                    "longitude": -122.4195
                }
            ]
            
            for incident in incidents:
                response = session.post(
                    f"{TEST_SERVER}/api/dept/{test_dept_code}/incidents",
                    json=incident
                )
                
                if response.status_code == 200:
                    print(f"Created test incident: {incident['incident_title']}")
                else:
                    print(f"Failed to create test incident. Status code: {response.status_code}")
        
        except Exception as e:
            print(f"Error creating test incidents: {str(e)}")
    
    def get_session_with_login(self, email, password):
        """Helper method to get a session with a logged-in user"""
        session = requests.Session()
        login_response = session.post(f"{TEST_SERVER}/login", data={
            "email": email,
            "password": password
        })
        self.assertEqual(login_response.status_code, 200)
        return session
    
    def make_api_request(self, method, endpoint, headers=None, params=None, json_data=None):
        """Helper method to make API requests with proper error handling"""
        url = f"{API_BASE_URL}/{endpoint}"
        headers = headers or {}
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, params=params, json=json_data)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, params=params, json=json_data)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, params=params)
            else:
                self.fail(f"Unsupported HTTP method: {method}")
            
            return response
        except requests.RequestException as e:
            self.fail(f"Request failed: {str(e)}")


class APIAuthenticationTests(APITestCase):
    """Tests for API authentication"""
    
    def test_api_no_authentication(self):
        """Test API access without authentication"""
        # Try to access the department info endpoint without authentication
        response = self.make_api_request("GET", "department")
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.json())
        self.assertIn("API key is required", response.json()["error"])
    
    def test_api_invalid_key(self):
        """Test API access with an invalid API key"""
        # Try to access with an invalid API key
        headers = {"X-API-Key": "invalid_key_12345"}
        response = self.make_api_request("GET", "department", headers=headers)
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.json())
        self.assertIn("Invalid or disabled API key", response.json()["error"])
    
    def test_api_valid_key_header(self):
        """Test API access with a valid API key in header"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        # Access with valid API key in header
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("GET", "department", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        self.assertIn("department", response.json())
        self.assertEqual(response.json()["department"]["code"], test_dept_code)
    
    def test_api_valid_key_query_param(self):
        """Test API access with a valid API key as query parameter"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        # Access with valid API key as query parameter
        response = self.make_api_request("GET", "department", params={"api_key": test_api_key})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        self.assertIn("department", response.json())
    

class APIDepartmentTests(APITestCase):
    """Tests for the department API endpoint"""
    
    def test_get_department_info(self):
        """Test getting department information"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("GET", "department", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        # Verify response contents
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("department", data)
        self.assertEqual(data["department"]["code"], test_dept_code)
        
        # Verify the expected fields exist
        expected_fields = [
            "id", "code", "name", "email", "phone", "website", "logo_url",
            "primary_color", "secondary_color", "department_type",
            "num_stations", "num_personnel", "service_area", "population_served",
            "api_enabled", "features_enabled"
        ]
        
        for field in expected_fields:
            self.assertIn(field, data["department"])


class APIIncidentTests(APITestCase):
    """Tests for the incidents API endpoints"""
    
    def test_get_incidents(self):
        """Test getting all incidents"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("GET", "incidents", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        # Verify response contents
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("incidents", data)
        self.assertIsInstance(data["incidents"], list)
        
        # There should be at least the test incidents we created
        self.assertGreaterEqual(len(data["incidents"]), 2)
        
        # Verify incident structure
        if data["incidents"]:
            incident = data["incidents"][0]
            expected_fields = [
                "id", "department_id", "title", "incident_number",
                "incident_date", "incident_type", "location",
                "latitude", "longitude", "data"
            ]
            for field in expected_fields:
                self.assertIn(field, incident)
    
    def test_get_incidents_with_date_filter(self):
        """Test getting incidents with date filtering"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        # Get incidents for the last 3 days
        start_date = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")
        end_date = datetime.now().strftime("%Y-%m-%d")
        
        headers = {"X-API-Key": test_api_key}
        params = {"start_date": start_date, "end_date": end_date}
        
        response = self.make_api_request("GET", "incidents", headers=headers, params=params)
        self.assertEqual(response.status_code, 200)
        
        # Verify response contents
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("incidents", data)
        
        # All incidents should be within the date range
        for incident in data["incidents"]:
            if incident["incident_date"]:
                incident_date = datetime.fromisoformat(incident["incident_date"].replace("Z", "+00:00"))
                start_datetime = datetime.fromisoformat(f"{start_date}T00:00:00")
                end_datetime = datetime.fromisoformat(f"{end_date}T23:59:59")
                self.assertTrue(start_datetime <= incident_date <= end_datetime)
    
    def test_create_incident(self):
        """Test creating a new incident"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        # Prepare test incident data
        incident_data = {
            "incident_title": "API Test Incident",
            "incident_number": f"API-TEST-{datetime.now().strftime('%H%M%S')}",
            "incident_date": datetime.now().isoformat(),
            "incident_type": "Other",
            "location": "API Test Location",
            "latitude": 37.7751,
            "longitude": -122.4196,
            "test_field": "This is a test field",
            "patient_info": {
                "age": 30,
                "gender": "Female",
                "chief_complaint": "API Test"
            }
        }
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("POST", "incidents", headers=headers, json_data=incident_data)
        self.assertEqual(response.status_code, 200)
        
        # Verify response contents
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("message", data)
        self.assertIn("incident_id", data)
        
        # Verify the incident was created by retrieving it using the new endpoint
        incident_id = data["incident_id"]
        get_response = self.make_api_request("GET", f"incidents/{incident_id}", headers=headers)
        self.assertEqual(get_response.status_code, 200)
        
        # Verify the retrieved incident has the correct data
        get_data = get_response.json()
        self.assertTrue(get_data["success"])
        self.assertIn("incident", get_data)
        self.assertEqual(get_data["incident"]["id"], incident_id)
        self.assertEqual(get_data["incident"]["title"], incident_data["incident_title"])
        self.assertEqual(get_data["incident"]["incident_number"], incident_data["incident_number"])
        
    def test_get_incident_by_id(self):
        """Test getting a specific incident by ID"""
        if not test_api_key:
            self.skipTest("No valid API key available")
            
        # First get all incidents to find a valid ID
        headers = {"X-API-Key": test_api_key}
        all_response = self.make_api_request("GET", "incidents", headers=headers)
        self.assertEqual(all_response.status_code, 200)
        
        # Get the first incident ID
        all_data = all_response.json()
        if not all_data["incidents"]:
            self.skipTest("No incidents available for testing")
            
        incident_id = all_data["incidents"][0]["id"]
        
        # Now get the specific incident
        get_response = self.make_api_request("GET", f"incidents/{incident_id}", headers=headers)
        self.assertEqual(get_response.status_code, 200)
        
        # Verify the response
        get_data = get_response.json()
        self.assertTrue(get_data["success"])
        self.assertIn("incident", get_data)
        self.assertEqual(get_data["incident"]["id"], incident_id)
        
    def test_get_nonexistent_incident(self):
        """Test getting a nonexistent incident ID"""
        if not test_api_key:
            self.skipTest("No valid API key available")
            
        # Use a very large ID that shouldn't exist
        incident_id = 999999
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("GET", f"incidents/{incident_id}", headers=headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.json())


class APIStationTests(APITestCase):
    """Tests for the stations API endpoints"""
    
    def test_get_stations(self):
        """Test getting all stations"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("GET", "stations", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        # Verify response contents
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("stations", data)
        self.assertIsInstance(data["stations"], list)
        
        # Verify station structure if any stations exist
        if data["stations"]:
            station = data["stations"][0]
            expected_fields = [
                "id", "name", "station_number", "address", "city", "state", 
                "zip_code", "latitude", "longitude", "personnel_count", 
                "apparatus", "created_at"
            ]
            for field in expected_fields:
                self.assertIn(field, station)
    
    def test_get_station_by_id(self):
        """Test getting a specific station by ID"""
        if not test_api_key:
            self.skipTest("No valid API key available")
            
        # First get all stations to find a valid ID
        headers = {"X-API-Key": test_api_key}
        all_response = self.make_api_request("GET", "stations", headers=headers)
        self.assertEqual(all_response.status_code, 200)
        
        # Get the first station ID
        all_data = all_response.json()
        if not all_data["stations"]:
            # Create a test station if no stations exist
            self.create_test_station()
            
            # Get stations again
            all_response = self.make_api_request("GET", "stations", headers=headers)
            self.assertEqual(all_response.status_code, 200)
            all_data = all_response.json()
            
            if not all_data["stations"]:
                self.skipTest("No stations available for testing")
            
        station_id = all_data["stations"][0]["id"]
        
        # Now get the specific station
        get_response = self.make_api_request("GET", f"stations/{station_id}", headers=headers)
        self.assertEqual(get_response.status_code, 200)
        
        # Verify the response
        get_data = get_response.json()
        self.assertTrue(get_data["success"])
        self.assertIn("station", get_data)
        self.assertEqual(get_data["station"]["id"], station_id)
    
    def test_create_station(self):
        """Test creating a new station"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        # Generate a unique station number
        station_number = f"TEST-{int(time.time())}"
        
        # Prepare test station data
        station_data = {
            "name": "API Test Station",
            "station_number": station_number,
            "address": "123 Test Ave",
            "city": "Testville",
            "state": "TS",
            "zip_code": "12345",
            "latitude": 35.1234,
            "longitude": -115.5678,
            "personnel_count": 10,
            "apparatus": {
                "engine": 1,
                "ambulance": 1,
                "brush": 1
            }
        }
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("POST", "stations", headers=headers, json_data=station_data)
        self.assertEqual(response.status_code, 200)
        
        # Verify response contents
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("message", data)
        self.assertIn("station_id", data)
        
        # Verify the station was created by retrieving it
        station_id = data["station_id"]
        get_response = self.make_api_request("GET", f"stations/{station_id}", headers=headers)
        self.assertEqual(get_response.status_code, 200)
        
        # Verify the retrieved station has the correct data
        get_data = get_response.json()
        self.assertTrue(get_data["success"])
        self.assertIn("station", get_data)
        self.assertEqual(get_data["station"]["id"], station_id)
        self.assertEqual(get_data["station"]["name"], station_data["name"])
        self.assertEqual(get_data["station"]["station_number"], station_data["station_number"])
    
    def test_create_station_duplicate_number(self):
        """Test creating a station with a duplicate station number"""
        if not test_api_key:
            self.skipTest("No valid API key available")
            
        # First create a station
        station_number = f"DUPLICATE-{int(time.time())}"
        station_data = {
            "name": "Original Station",
            "station_number": station_number,
            "address": "123 Test Ave",
            "city": "Testville",
            "state": "TS",
            "zip_code": "12345"
        }
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("POST", "stations", headers=headers, json_data=station_data)
        self.assertEqual(response.status_code, 200)
        
        # Now try to create another station with the same number
        duplicate_data = {
            "name": "Duplicate Station",
            "station_number": station_number,
            "address": "456 Test Blvd",
            "city": "Testville",
            "state": "TS",
            "zip_code": "12345"
        }
        
        response = self.make_api_request("POST", "stations", headers=headers, json_data=duplicate_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertIn("already exists", response.json()["error"])
    
    def test_create_station_invalid_data(self):
        """Test creating a station with invalid data"""
        if not test_api_key:
            self.skipTest("No valid API key available")
            
        # Missing required fields
        station_data = {
            "address": "123 Test Ave",
            "city": "Testville"
        }
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("POST", "stations", headers=headers, json_data=station_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertIn("Missing required fields", response.json()["error"])
        
        # Invalid latitude value
        station_data = {
            "name": "Invalid Station",
            "station_number": "INVALID-1",
            "latitude": 100,  # Out of range
            "longitude": -115.5678
        }
        
        response = self.make_api_request("POST", "stations", headers=headers, json_data=station_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertIn("Latitude must be between", response.json()["error"])
        
        # Invalid apparatus data
        station_data = {
            "name": "Invalid Station",
            "station_number": "INVALID-2",
            "apparatus": "not-an-object"  # Should be a dictionary
        }
        
        response = self.make_api_request("POST", "stations", headers=headers, json_data=station_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertIn("Apparatus must be a dictionary", response.json()["error"])
    
    def test_get_nonexistent_station(self):
        """Test getting a nonexistent station ID"""
        if not test_api_key:
            self.skipTest("No valid API key available")
            
        # Use a very large ID that shouldn't exist
        station_id = 999999
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("GET", f"stations/{station_id}", headers=headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.json())
    
    def create_test_station(self):
        """Helper method to create a test station"""
        if not test_api_key:
            return None
            
        # Generate a unique station number
        station_number = f"TEST-{int(time.time())}"
        
        # Prepare test station data
        station_data = {
            "name": "API Test Station",
            "station_number": station_number,
            "address": "123 Test Ave",
            "city": "Testville",
            "state": "TS",
            "zip_code": "12345"
        }
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("POST", "stations", headers=headers, json_data=station_data)
        
        if response.status_code == 200:
            return response.json().get("station_id")
        
        return None


class APILoadTesting(APITestCase):
    """Load testing for API endpoints"""
    
    def test_api_concurrent_requests(self):
        """Test the API with multiple concurrent requests"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        # Use concurrent.futures to make multiple requests
        import concurrent.futures
        
        def make_request():
            headers = {"X-API-Key": test_api_key}
            response = requests.get(f"{API_BASE_URL}/department", headers=headers)
            return response.status_code
        
        # Make 10 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(make_request, range(10)))
        
        # All requests should succeed
        for status_code in results:
            self.assertEqual(status_code, 200)
    
    def test_rate_limit_headers(self):
        """Test that rate limit headers are present in API responses"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("GET", "department", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        # Check for rate limit headers
        self.assertIn("X-RateLimit-Limit", response.headers)
        self.assertIn("X-RateLimit-Remaining", response.headers)
        self.assertIn("X-RateLimit-Reset", response.headers)
        
        # Verify header values are valid
        remaining = int(response.headers["X-RateLimit-Remaining"])
        self.assertGreaterEqual(remaining, 0)
    
    def test_rate_limit_enforcement(self):
        """Test that rate limits are enforced (warning: may get your IP temporarily limited)"""
        # This test is commented out by default because it will intentionally hit rate limits
        # Uncomment it for testing rate limiting functionality
        """
        if not test_api_key:
            self.skipTest("No valid API key available")
            
        # We'll use a specific endpoint that has a lower limit
        endpoint = "incidents"
        headers = {"X-API-Key": test_api_key}
        
        # Find out the current limit
        response = self.make_api_request("GET", endpoint, headers=headers)
        self.assertEqual(response.status_code, 200)
        
        # Get the current limit
        limit = int(response.headers["X-RateLimit-Remaining"])
        
        # Make requests until we reach the limit
        for i in range(limit + 2):  # +2 to exceed the limit
            response = self.make_api_request("GET", endpoint, headers=headers)
            if response.status_code == 429:
                # We've hit the rate limit, which is what we want
                self.assertIn("X-RateLimit-Reset", response.headers)
                return
                
        # If we got here without a 429, the rate limit wasn't hit or isn't working
        self.fail("Rate limit was not enforced")
        """


class APIUserTests(APITestCase):
    """Tests for user API endpoints"""
    
    def test_get_users(self):
        """Test getting all users for a department"""
        response = self.make_api_request('GET', '/api/v1/users')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertTrue(data['success'])
        self.assertEqual(data['department_id'], self.department.id)
        self.assertIn('users', data)
        self.assertIn('user_count', data)
        self.assertGreaterEqual(data['user_count'], 2)  # Admin and regular user
        
        # Check user structure
        user = data['users'][0]
        self.assertIn('id', user)
        self.assertIn('email', user)
        self.assertIn('name', user)
        self.assertIn('role', user)
        
    def test_get_user(self):
        """Test getting a specific user by ID"""
        response = self.make_api_request('GET', f'/api/v1/users/{self.admin_user.id}')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertTrue(data['success'])
        self.assertIn('user', data)
        self.assertEqual(data['user']['id'], self.admin_user.id)
        self.assertEqual(data['user']['email'], self.admin_user.email)
        self.assertEqual(data['user']['role'], self.admin_user.role)
        
    def test_get_nonexistent_user(self):
        """Test getting a user that doesn't exist"""
        response = self.make_api_request('GET', '/api/v1/users/999999')
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn('error', data)
        
    def test_create_user(self):
        """Test creating a new user"""
        new_user_data = {
            "email": "newuser@test.com",
            "name": "New Test User",
            "password": "securepassword",
            "role": "user",
            "is_active": True
        }
        
        response = self.make_api_request('POST', '/api/v1/users', new_user_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertTrue(data['success'])
        self.assertIn('user_id', data)
        
        # Verify user was created
        user_id = data['user_id']
        response = self.make_api_request('GET', f'/api/v1/users/{user_id}')
        self.assertEqual(response.status_code, 200)
        user_data = response.json()['user']
        self.assertEqual(user_data['email'], new_user_data['email'])
        self.assertEqual(user_data['name'], new_user_data['name'])
        self.assertEqual(user_data['role'], new_user_data['role'])
        
    def test_create_user_missing_fields(self):
        """Test creating a user with missing required fields"""
        incomplete_user = {
            "email": "incomplete@test.com",
            "name": "Incomplete User"
            # Missing password and role
        }
        
        response = self.make_api_request('POST', '/api/v1/users', incomplete_user)
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('required_fields', data)
        
    def test_create_user_invalid_email(self):
        """Test creating a user with an invalid email format"""
        invalid_email_user = {
            "email": "not-an-email",
            "name": "Invalid Email User",
            "password": "securepassword",
            "role": "user"
        }
        
        response = self.make_api_request('POST', '/api/v1/users', invalid_email_user)
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('email', data['error'].lower())
        
    def test_create_user_duplicate_email(self):
        """Test creating a user with an email that already exists"""
        duplicate_user = {
            "email": self.admin_user.email,  # Already exists
            "name": "Duplicate User",
            "password": "securepassword",
            "role": "user"
        }
        
        response = self.make_api_request('POST', '/api/v1/users', duplicate_user)
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('already exists', data['error'])
        
    def test_create_user_invalid_role(self):
        """Test creating a user with an invalid role"""
        invalid_role_user = {
            "email": "invalidrole@test.com",
            "name": "Invalid Role User",
            "password": "securepassword",
            "role": "superuser"  # Not a valid role
        }
        
        response = self.make_api_request('POST', '/api/v1/users', invalid_role_user)
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('role', data['error'].lower())
        
    def test_update_user(self):
        """Test updating an existing user"""
        # First create a user to update
        create_response = self.make_api_request(
            'POST', 
            '/api/v1/users', 
            {
                "email": "updateme@test.com",
                "name": "Update Me",
                "password": "oldpassword",
                "role": "user"
            }
        )
        self.assertEqual(create_response.status_code, 200)
        user_id = create_response.json()['user_id']
        
        # Now update the user
        update_data = {
            "name": "Updated Name",
            "role": "manager",
            "is_active": False
        }
        
        response = self.make_api_request('PUT', f'/api/v1/users/{user_id}', update_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        
        # Verify the update worked
        response = self.make_api_request('GET', f'/api/v1/users/{user_id}')
        self.assertEqual(response.status_code, 200)
        user_data = response.json()['user']
        self.assertEqual(user_data['name'], update_data['name'])
        self.assertEqual(user_data['role'], update_data['role'])
        self.assertEqual(user_data['is_active'], update_data['is_active'])
        
    def test_update_nonexistent_user(self):
        """Test updating a user that doesn't exist"""
        response = self.make_api_request(
            'PUT', 
            '/api/v1/users/999999', 
            {"name": "Won't Update"}
        )
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn('error', data)
        
    def test_update_user_invalid_email(self):
        """Test updating a user with an invalid email format"""
        response = self.make_api_request(
            'PUT', 
            f'/api/v1/users/{self.regular_user.id}', 
            {"email": "not-an-email"}
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('email', data['error'].lower())
        
    def test_update_user_duplicate_email(self):
        """Test updating a user with an email that already exists"""
        response = self.make_api_request(
            'PUT', 
            f'/api/v1/users/{self.regular_user.id}', 
            {"email": self.admin_user.email}  # Already exists
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('already exists', data['error'])


class APIErrorHandlingTests(APITestCase):
    """Tests for API error handling"""
    
    def test_invalid_endpoint(self):
        """Test accessing an invalid endpoint"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        headers = {"X-API-Key": test_api_key}
        response = requests.get(f"{API_BASE_URL}/nonexistent_endpoint", headers=headers)
        self.assertEqual(response.status_code, 404)
    
    def test_invalid_method(self):
        """Test using an invalid HTTP method"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        headers = {"X-API-Key": test_api_key}
        response = requests.delete(f"{API_BASE_URL}/department", headers=headers)
        self.assertNotEqual(response.status_code, 200)
    
    def test_create_incident_invalid_data(self):
        """Test creating an incident with invalid data"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        # Missing required fields
        incident_data = {
            "location": "Invalid Test"
        }
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("POST", "incidents", headers=headers, json_data=incident_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertIn("Missing required fields", response.json()["error"])
        self.assertIn("required_fields", response.json())
        
    def test_create_incident_invalid_date(self):
        """Test creating an incident with invalid date format"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        # Invalid date format
        incident_data = {
            "incident_title": "Invalid Date Test",
            "incident_number": "INV-DATE-001",
            "incident_date": "not-a-date",
            "incident_type": "Test"
        }
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("POST", "incidents", headers=headers, json_data=incident_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertIn("Invalid incident_date format", response.json()["error"])
        
    def test_create_incident_invalid_coordinates(self):
        """Test creating an incident with invalid coordinates"""
        if not test_api_key:
            self.skipTest("No valid API key available")
        
        # Invalid latitude value
        incident_data = {
            "incident_title": "Invalid Coordinates Test",
            "incident_number": "INV-COORD-001",
            "incident_date": datetime.now().isoformat(),
            "incident_type": "Test",
            "latitude": 100,  # Out of range
            "longitude": -122.4194
        }
        
        headers = {"X-API-Key": test_api_key}
        response = self.make_api_request("POST", "incidents", headers=headers, json_data=incident_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertIn("Latitude must be between", response.json()["error"])
        
        # Invalid longitude value
        incident_data = {
            "incident_title": "Invalid Coordinates Test",
            "incident_number": "INV-COORD-002",
            "incident_date": datetime.now().isoformat(),
            "incident_type": "Test",
            "latitude": 37.7749,
            "longitude": 200  # Out of range
        }
        
        response = self.make_api_request("POST", "incidents", headers=headers, json_data=incident_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertIn("Longitude must be between", response.json()["error"])
        
        # Non-numeric latitude
        incident_data = {
            "incident_title": "Invalid Coordinates Test",
            "incident_number": "INV-COORD-003",
            "incident_date": datetime.now().isoformat(),
            "incident_type": "Test",
            "latitude": "not-a-number",
            "longitude": -122.4194
        }
        
        response = self.make_api_request("POST", "incidents", headers=headers, json_data=incident_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertIn("Latitude must be a valid number", response.json()["error"])


def main():
    unittest.main()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--setup-only":
        # Just run the setup to create test data
        APITestCase.setUpClass()
        print("Setup complete. Test data has been created.")
    else:
        main()