"""
Integration tests for Incident Logger functionality.
"""

import json
import os
import datetime
from pathlib import Path
import sys

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from integration.test_integration_base import IncidentTestCase


class IncidentLoggerTests(IncidentTestCase):
    """Integration tests for the incident logger functionality."""
    
    fixture_name = "medium_test"  # Use medium test fixture for more data
    
    def test_incident_creation(self):
        """Test creating a new incident."""
        # Example test using our test data
        if not self.department:
            self.skipTest("No department available for testing")
        
        # Create a new incident using test data
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
            "notes": "Test incident created through integration test",
            "created_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat()
        }
        
        # Insert the incident into the database
        cursor = self.db_conn.cursor()
        
        # Convert nested objects to JSON strings
        location_json = json.dumps(new_incident["location"])
        caller_info_json = json.dumps(new_incident["caller_info"])
        times_json = json.dumps(new_incident["times"])
        units_json = json.dumps(new_incident["units"])
        
        # Generate a new ID for the incident
        import uuid
        incident_id = str(uuid.uuid4())
        
        # Insert the incident
        cursor.execute(
            """
            INSERT INTO incidents (
                id, department_id, call_number, type, category, priority,
                location, caller_info, times, units, outcome, notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                incident_id,
                new_incident["department_id"],
                new_incident["call_number"],
                new_incident["type"],
                new_incident["category"],
                new_incident["priority"],
                location_json,
                caller_info_json,
                times_json,
                units_json,
                new_incident["outcome"],
                new_incident["notes"],
                new_incident["created_at"],
                new_incident["updated_at"]
            )
        )
        
        # Commit the changes
        self.db_conn.commit()
        
        # Verify the incident was created
        cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
        row = cursor.fetchone()
        
        self.assertIsNotNone(row, "Incident should exist in the database")
        
        # Verify the incident data
        self.assertEqual(row[1], new_incident["department_id"])
        self.assertEqual(row[2], new_incident["call_number"])
        self.assertEqual(row[3], new_incident["type"])
        self.assertEqual(row[4], new_incident["category"])
        self.assertEqual(row[5], new_incident["priority"])
    
    def test_incident_update(self):
        """Test updating an existing incident."""
        if not self.incident:
            self.skipTest("No incident available for testing")
        
        # Update the incident
        cursor = self.db_conn.cursor()
        
        # Change the outcome
        new_outcome = "Fire Extinguished"
        
        cursor.execute(
            "UPDATE incidents SET outcome = ? WHERE id = ?",
            (new_outcome, self.incident["id"])
        )
        
        # Commit the changes
        self.db_conn.commit()
        
        # Verify the incident was updated
        cursor.execute("SELECT outcome FROM incidents WHERE id = ?", (self.incident["id"],))
        row = cursor.fetchone()
        
        self.assertEqual(row[0], new_outcome)
    
    def test_incident_query_by_type(self):
        """Test querying incidents by type."""
        if not self.dept_incidents:
            self.skipTest("No incidents available for testing")
        
        # Query incidents by type
        cursor = self.db_conn.cursor()
        
        if self.ems_incidents:
            # Test EMS incidents query
            cursor.execute(
                "SELECT COUNT(*) FROM incidents WHERE category = ? AND department_id = ?",
                ("EMS", self.department["id"])
            )
            count = cursor.fetchone()[0]
            
            self.assertEqual(count, len(self.ems_incidents))
        
        if self.fire_incidents:
            # Test Fire incidents query
            cursor.execute(
                "SELECT COUNT(*) FROM incidents WHERE category = ? AND department_id = ?",
                ("Fire", self.department["id"])
            )
            count = cursor.fetchone()[0]
            
            self.assertEqual(count, len(self.fire_incidents))
    
    def test_incident_deletion(self):
        """Test deleting an incident."""
        if not self.dept_incidents or len(self.dept_incidents) < 2:
            self.skipTest("Not enough incidents available for testing")
        
        # Choose an incident to delete (not the first one, which is used in other tests)
        incident_to_delete = self.dept_incidents[1]
        
        # Delete the incident
        cursor = self.db_conn.cursor()
        
        cursor.execute(
            "DELETE FROM incidents WHERE id = ?",
            (incident_to_delete["id"],)
        )
        
        # Commit the changes
        self.db_conn.commit()
        
        # Verify the incident was deleted
        cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_to_delete["id"],))
        row = cursor.fetchone()
        
        self.assertIsNone(row, "Incident should be deleted from the database")


if __name__ == "__main__":
    import unittest
    unittest.main()