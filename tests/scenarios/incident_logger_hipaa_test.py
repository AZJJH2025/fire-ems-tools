"""
Comprehensive functional test for the Incident Logger HIPAA compliance.

This test validates that the Incident Logger properly handles sensitive patient 
information according to HIPAA requirements.
"""

import unittest
import json
import datetime
import uuid
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent.parent))

from tests.integration.test_integration_base import IncidentTestCase
from tests.routes.base import BlueprintTestCase
from static.js.components.hipaa_compliance import HIPAAComplianceTest

class IncidentLoggerHIPAATest(IncidentTestCase, BlueprintTestCase):
    """Test the Incident Logger's HIPAA compliance functionality."""
    
    blueprint_name = 'tools'
    fixture_name = "medium_test"  # Use medium test fixture for more data
    
    def setUp(self):
        """Set up test data and helpers."""
        super().setUp()
        
        # Create a test incident with PHI (Protected Health Information)
        self.test_phi_data = {
            "department_id": self.department["id"] if self.department else str(uuid.uuid4()),
            "call_number": f"{datetime.datetime.now().year}-{12345}",
            "type": "Medical Emergency",
            "category": "EMS",
            "priority": 1,
            "location": {
                "latitude": 47.6062,
                "longitude": -122.3321,
                "address": "123 Test Street",
                "city": "Seattle",
                "state": "WA",
                "postal_code": "98101"
            },
            "caller_info": {
                "name": "John Smith",  # PHI - Name
                "phone": "555-123-4567",  # PHI - Contact info
                "relationship": "Self"
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
                    "unit_id": "M-1",
                    "unit_type": "Medic",
                    "station_id": self.dept_stations[0]["id"] if self.dept_stations else "STA-1",
                    "personnel_count": 2,
                    "status": "Cleared",
                    "times": {
                        "dispatched": datetime.datetime.now().isoformat(),
                        "enroute": datetime.datetime.now().isoformat(),
                        "arrived": datetime.datetime.now().isoformat(),
                        "cleared": datetime.datetime.now().isoformat()
                    }
                }
            ],
            "patient_info": {
                "count": 1,
                "details": [
                    {
                        "age": 45,
                        "gender": "Male",
                        "chief_complaint": "Chest pain",
                        "medical_history": "Hypertension, diabetes",  # PHI - Medical history
                        "medications": "Metformin, Lisinopril",  # PHI - Medications
                        "allergies": "Penicillin",  # PHI - Allergies
                        "vitals": [
                            {
                                "time": datetime.datetime.now().isoformat(),
                                "bp": "145/95",
                                "pulse": 96,
                                "respiration": 18,
                                "spo2": 98,
                                "temperature": 98.6,
                                "gcs": 15
                            }
                        ],
                        "treatment": [
                            {
                                "time": datetime.datetime.now().isoformat(),
                                "procedure": "12-lead EKG",
                                "notes": "Possible anterior MI"
                            }
                        ]
                    }
                ]
            },
            "narrative": "45-year-old male with history of hypertension and diabetes complaining of chest pain. Patient states pain is 8/10, radiating to left arm. Vitals as noted. 12-lead EKG shows possible anterior MI. Patient transported to Seattle Medical Center.",
            "outcome": "Transported",
            "disposition": {
                "transported": True,
                "destination": "Seattle Medical Center",
                "reason": "Possible MI"
            },
            "notes": "Patient given aspirin and nitroglycerin prior to transport.",
            "created_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat(),
            "created_by": "Test User"
        }
        
        # Insert the incident into the database
        self.test_incident_id = self.create_test_incident(self.test_phi_data)
        
    def create_test_incident(self, incident_data):
        """Create a test incident in the database."""
        cursor = self.db_conn.cursor()
        
        # Convert nested objects to JSON strings
        location_json = json.dumps(incident_data["location"])
        caller_info_json = json.dumps(incident_data["caller_info"])
        times_json = json.dumps(incident_data["times"])
        units_json = json.dumps(incident_data["units"])
        patient_info_json = json.dumps(incident_data["patient_info"])
        disposition_json = json.dumps(incident_data["disposition"])
        
        # Generate a new ID for the incident
        incident_id = str(uuid.uuid4())
        
        # Insert the incident
        cursor.execute(
            """
            INSERT INTO incidents (
                id, department_id, call_number, type, category, priority,
                location, caller_info, times, units, patient_info, narrative,
                outcome, disposition, notes, created_at, updated_at, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                incident_id,
                incident_data["department_id"],
                incident_data["call_number"],
                incident_data["type"],
                incident_data["category"],
                incident_data["priority"],
                location_json,
                caller_info_json,
                times_json,
                units_json,
                patient_info_json,
                incident_data["narrative"],
                incident_data["outcome"],
                disposition_json,
                incident_data["notes"],
                incident_data["created_at"],
                incident_data["updated_at"],
                incident_data["created_by"]
            )
        )
        
        # Commit the changes
        self.db_conn.commit()
        
        return incident_id
    
    def test_hipaa_compliant_data_access(self):
        """Test that HIPAA-related data is properly accessed with authorization."""
        with self.client as client:
            # Mock an authenticated session
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_phi'] = True
            
            # Request the incident details
            response = client.get(f'/tools/incident/{self.test_incident_id}')
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            self.assertIn('patient_info', response.json)
            self.assertIn('details', response.json['patient_info'])
            
            # Validate PHI data is present
            patient = response.json['patient_info']['details'][0]
            self.assertIn('medical_history', patient)
            self.assertEqual(patient['medical_history'], 'Hypertension, diabetes')
            self.assertIn('medications', patient)
            self.assertEqual(patient['medications'], 'Metformin, Lisinopril')
    
    def test_hipaa_access_restriction(self):
        """Test that HIPAA-related data is restricted for unauthorized users."""
        with self.client as client:
            # Mock an authenticated session without PHI authorization
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_phi'] = False
            
            # Request the incident details
            response = client.get(f'/tools/incident/{self.test_incident_id}')
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            
            # Validate PHI data is redacted
            self.assertIn('patient_info', response.json)
            patient = response.json['patient_info']['details'][0]
            
            # Check PHI fields are redacted
            self.assertIn('medical_history', patient)
            self.assertEqual(patient['medical_history'], '[REDACTED]')
            self.assertIn('medications', patient)
            self.assertEqual(patient['medications'], '[REDACTED]')
            
            # Age is not directly identifiable so may be present
            self.assertIn('age', patient)
            
    def test_hipaa_audit_trail(self):
        """Test that PHI access creates an audit trail."""
        with patch('static.js.components.hipaa_compliance.log_phi_access') as mock_log:
            with self.client as client:
                # Mock an authenticated session
                with client.session_transaction() as session:
                    session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                    session['authorized_for_phi'] = True
                
                # Request the incident details
                response = client.get(f'/tools/incident/{self.test_incident_id}')
                
                # Verify audit log was created
                mock_log.assert_called_once()
                log_args = mock_log.call_args[0]
                self.assertEqual(log_args[0], session['user_id'])
                self.assertEqual(log_args[1], self.test_incident_id)
    
    def test_hipaa_export_functionality(self):
        """Test that exports properly manage PHI according to authorization."""
        with self.client as client:
            # Test with authorized user
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_phi'] = True
            
            # Request an export with full PHI
            response = client.post('/tools/incident/export', json={
                'incident_id': self.test_incident_id,
                'format': 'json',
                'include_phi': True
            })
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            export_data = response.json
            
            # Verify PHI is included
            self.assertIn('patient_info', export_data)
            patient = export_data['patient_info']['details'][0]
            self.assertEqual(patient['medical_history'], 'Hypertension, diabetes')
            
            # Now test with unauthorized user
            with client.session_transaction() as session:
                session['authorized_for_phi'] = False
            
            # Request an export
            response = client.post('/tools/incident/export', json={
                'incident_id': self.test_incident_id,
                'format': 'json',
                'include_phi': True  # Should be ignored since user is not authorized
            })
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            export_data = response.json
            
            # Verify PHI is redacted
            self.assertIn('patient_info', export_data)
            patient = export_data['patient_info']['details'][0]
            self.assertEqual(patient['medical_history'], '[REDACTED]')
    
    def test_hipaa_data_encryption(self):
        """Test that PHI is stored encrypted in the database."""
        # This would typically mock the encryption/decryption layer
        # Since we can't directly test encryption, we'll verify the function calls
        
        with patch('static.js.components.hipaa_compliance.encrypt_phi') as mock_encrypt:
            mock_encrypt.return_value = "ENCRYPTED_DATA"
            
            # Create a new incident which should trigger PHI encryption
            new_phi_data = self.test_phi_data.copy()
            new_phi_data['call_number'] = f"{datetime.datetime.now().year}-{54321}"
            
            # Create the incident through the API
            with self.client as client:
                # Mock an authenticated session
                with client.session_transaction() as session:
                    session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                    session['authorized_for_phi'] = True
                
                response = client.post('/tools/incident/create', json=new_phi_data)
                
                # Verify encryption was called
                mock_encrypt.assert_called()
                
                # The first argument to encrypt_phi should be the patient_info
                encrypted_data = mock_encrypt.call_args[0][0]
                self.assertIn('medical_history', str(encrypted_data))
    
    def test_hipaa_de_identification(self):
        """Test that de-identification works properly for reports."""
        with self.client as client:
            # Mock an authenticated session
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_phi'] = True
            
            # Request a de-identified report
            response = client.post('/tools/reports/create', json={
                'report_type': 'department_summary',
                'date_range': {
                    'start': (datetime.datetime.now() - datetime.timedelta(days=30)).isoformat(),
                    'end': datetime.datetime.now().isoformat()
                },
                'department_id': self.department['id'] if self.department else 'dept-1',
                'de_identify': True
            })
            
            # Check response
            self.assertEqual(response.status_code, 200)
            report_data = response.json
            
            # Verify the report doesn't contain PHI
            report_text = json.dumps(report_data)
            self.assertNotIn('John Smith', report_text)
            self.assertNotIn('Hypertension', report_text)
            self.assertNotIn('Metformin', report_text)
            
            # But it should contain anonymized incident data
            self.assertIn('incident_count', report_text)
            self.assertIn('ems_count', report_text)

    def test_hipaa_patient_consent_tracking(self):
        """Test that patient consent for information sharing is properly tracked."""
        consent_data = {
            'incident_id': self.test_incident_id,
            'patient_index': 0,  # First patient
            'consent_given': True,
            'consent_type': 'verbal',
            'consent_notes': 'Patient verbally agreed to share information with family members.',
            'witness': 'Paramedic Jane Smith'
        }
        
        with self.client as client:
            # Mock an authenticated session
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_phi'] = True
            
            # Record consent
            response = client.post('/tools/incident/patient/consent', json=consent_data)
            
            # Verify response
            self.assertEqual(response.status_code, 200)
            
            # Verify consent was recorded by retrieving incident
            response = client.get(f'/tools/incident/{self.test_incident_id}')
            
            incident_data = response.json
            patient = incident_data['patient_info']['details'][0]
            
            self.assertIn('consent', patient)
            self.assertEqual(patient['consent']['consent_given'], True)
            self.assertEqual(patient['consent']['consent_type'], 'verbal')


if __name__ == "__main__":
    unittest.main()