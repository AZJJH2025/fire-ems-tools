"""
API tests for Incident endpoints.
"""

import json
import datetime
import uuid
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from api.test_api_base import IncidentAPITestCase


class IncidentAPITests(IncidentAPITestCase):
    """API tests for the incident endpoints."""
    
    fixture_name = "medium_test"  # Use medium test fixture for more data
    
    def test_get_incidents(self):
        """Test the GET /api/incidents endpoint."""
        if not self.department:
            self.skipTest("No department available for testing")
        
        # Make the API request
        response = self.client.get('/api/incidents')
        
        # Check the response
        self.assert200(response)
        data = json.loads(response.data)
        
        # Verify the response contains incidents
        self.assertIn('incidents', data)
        self.assertIsInstance(data['incidents'], list)
        
        # Should match the number of incidents in our test data
        # Note: This assumes the API returns all incidents. If it's paginated,
        # this check would need to be adjusted.
        self.assertEqual(len(data['incidents']), len(self.incidents))
    
    def test_get_incident_by_id(self):
        """Test the GET /api/incidents/<id> endpoint."""
        if not self.incident:
            self.skipTest("No incident available for testing")
        
        # Make the API request
        response = self.client.get(f'/api/incidents/{self.incident["id"]}')
        
        # Check the response
        self.assert200(response)
        data = json.loads(response.data)
        
        # Verify the response contains the incident
        self.assertIn('incident', data)
        self.assertEqual(data['incident']['id'], self.incident["id"])
        self.assertEqual(data['incident']['type'], self.incident["type"])
        self.assertEqual(data['incident']['category'], self.incident["category"])
    
    def test_get_incidents_by_department(self):
        """Test the GET /api/departments/<id>/incidents endpoint."""
        if not self.department or not self.dept_incidents:
            self.skipTest("No department or incidents available for testing")
        
        # Make the API request
        response = self.client.get(f'/api/departments/{self.department["id"]}/incidents')
        
        # Check the response
        self.assert200(response)
        data = json.loads(response.data)
        
        # Verify the response contains incidents for the department
        self.assertIn('incidents', data)
        self.assertIsInstance(data['incidents'], list)
        
        # Should match the number of incidents for this department
        self.assertEqual(len(data['incidents']), len(self.dept_incidents))
    
    def test_create_incident(self):
        """Test the POST /api/incidents endpoint."""
        if not self.department:
            self.skipTest("No department available for testing")
        
        # Create a new incident
        new_incident = {
            "department_id": self.department["id"],
            "call_number": f"{datetime.datetime.now().year}-{12345}",
            "type": "Medical Emergency",
            "category": "EMS",
            "priority": 2,
            "location": {
                "latitude": 47.6062,
                "longitude": -122.3321,
                "address": "123 Test Street",
                "city": "Seattle",
                "state": "WA",
                "postal_code": "98101"
            },
            "caller_info": {
                "name": "Test Caller",
                "phone": "555-123-4567"
            },
            "times": {
                "received": datetime.datetime.now().isoformat(),
                "dispatched": datetime.datetime.now().isoformat(),
                "first_unit_enroute": datetime.datetime.now().isoformat(),
                "first_unit_arrived": datetime.datetime.now().isoformat(),
                "last_unit_cleared": datetime.datetime.now().isoformat()
            },
            "units": [
                {
                    "unit_id": "E-1",
                    "unit_type": "Engine",
                    "station_id": self.dept_stations[0]["id"] if self.dept_stations else "STA-1",
                    "personnel_count": 4,
                    "status": "Cleared",
                    "times": {
                        "dispatched": datetime.datetime.now().isoformat(),
                        "enroute": datetime.datetime.now().isoformat(),
                        "arrived": datetime.datetime.now().isoformat(),
                        "cleared": datetime.datetime.now().isoformat()
                    }
                }
            ],
            "outcome": "Treated and Released",
            "notes": "Test incident created through API test"
        }
        
        # Make the API request
        response = self.client.post(
            '/api/incidents',
            data=json.dumps(new_incident),
            content_type='application/json'
        )
        
        # Check the response
        self.assertStatus(response, 201)
        data = json.loads(response.data)
        
        # Verify the response contains the created incident
        self.assertIn('incident', data)
        self.assertEqual(data['incident']['type'], new_incident["type"])
        self.assertEqual(data['incident']['category'], new_incident["category"])
        
        # Verify the incident was created in the database
        response = self.client.get(f'/api/incidents/{data["incident"]["id"]}')
        self.assert200(response)
    
    def test_update_incident(self):
        """Test the PUT /api/incidents/<id> endpoint."""
        if not self.incident:
            self.skipTest("No incident available for testing")
        
        # Update the incident
        update_data = {
            "outcome": "Fire Extinguished",
            "notes": "Updated through API test"
        }
        
        # Make the API request
        response = self.client.put(
            f'/api/incidents/{self.incident["id"]}',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        
        # Check the response
        self.assert200(response)
        data = json.loads(response.data)
        
        # Verify the response contains the updated incident
        self.assertIn('incident', data)
        self.assertEqual(data['incident']['outcome'], update_data["outcome"])
        self.assertEqual(data['incident']['notes'], update_data["notes"])
        
        # Verify the incident was updated in the database
        response = self.client.get(f'/api/incidents/{self.incident["id"]}')
        self.assert200(response)
        data = json.loads(response.data)
        self.assertEqual(data['incident']['outcome'], update_data["outcome"])
    
    def test_delete_incident(self):
        """Test the DELETE /api/incidents/<id> endpoint."""
        if not self.dept_incidents or len(self.dept_incidents) < 2:
            self.skipTest("Not enough incidents available for testing")
        
        # Choose an incident to delete (not the first one, which is used in other tests)
        incident_to_delete = self.dept_incidents[1]
        
        # Make the API request
        response = self.client.delete(f'/api/incidents/{incident_to_delete["id"]}')
        
        # Check the response
        self.assert200(response)
        
        # Verify the incident was deleted
        response = self.client.get(f'/api/incidents/{incident_to_delete["id"]}')
        self.assert404(response)
    
    def test_filter_incidents_by_category(self):
        """Test filtering incidents by category."""
        if not self.department or not self.dept_incidents:
            self.skipTest("No department or incidents available for testing")
        
        if self.ems_incidents:
            # Test EMS incidents filter
            response = self.client.get(f'/api/incidents?category=EMS')
            self.assert200(response)
            data = json.loads(response.data)
            
            # All incidents in the response should be of category EMS
            for incident in data['incidents']:
                self.assertEqual(incident['category'], 'EMS')
        
        if self.fire_incidents:
            # Test Fire incidents filter
            response = self.client.get(f'/api/incidents?category=Fire')
            self.assert200(response)
            data = json.loads(response.data)
            
            # All incidents in the response should be of category Fire
            for incident in data['incidents']:
                self.assertEqual(incident['category'], 'Fire')
    
    def test_search_incidents(self):
        """Test searching incidents."""
        if not self.department or not self.dept_incidents:
            self.skipTest("No department or incidents available for testing")
        
        # Test search by type (assuming there are Medical Emergency incidents)
        response = self.client.get(f'/api/incidents?search=Medical')
        self.assert200(response)
        
        # Test search by address
        if self.incident and 'location' in self.incident and 'address' in self.incident['location']:
            # Extract a word from the address to search for
            address_word = self.incident['location']['address'].split()[0]
            response = self.client.get(f'/api/incidents?search={address_word}')
            self.assert200(response)


if __name__ == "__main__":
    import unittest
    unittest.main()