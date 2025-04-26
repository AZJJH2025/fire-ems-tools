"""
Functional test for Incident Logger form validation.

This test verifies that the Incident Logger properly validates form input
according to the rules defined in incident-validator.js.
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

class IncidentLoggerValidationTest(IncidentTestCase, BlueprintTestCase):
    """Test the Incident Logger form validation functionality."""
    
    blueprint_name = 'tools'
    fixture_name = "medium_test"
    
    def setUp(self):
        """Set up test data and helpers."""
        super().setUp()
        
        # Create a valid incident for modification in tests
        self.valid_incident = {
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
                "name": "Test Caller",
                "phone": "555-123-4567",
                "relationship": "Self"
            },
            "times": {
                "received": datetime.datetime.now().isoformat(),
                "dispatched": (datetime.datetime.now() + datetime.timedelta(minutes=1)).isoformat(),
                "first_unit_enroute": (datetime.datetime.now() + datetime.timedelta(minutes=2)).isoformat(),
                "first_unit_arrived": (datetime.datetime.now() + datetime.timedelta(minutes=8)).isoformat(),
                "last_unit_cleared": (datetime.datetime.now() + datetime.timedelta(minutes=45)).isoformat()
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
                        "enroute": (datetime.datetime.now() + datetime.timedelta(minutes=2)).isoformat(),
                        "arrived": (datetime.datetime.now() + datetime.timedelta(minutes=8)).isoformat(),
                        "cleared": (datetime.datetime.now() + datetime.timedelta(minutes=45)).isoformat()
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
                        "vitals": [
                            {
                                "time": datetime.datetime.now().isoformat(),
                                "bp": "120/80",
                                "pulse": 80,
                                "respiration": 16,
                                "spo2": 98,
                                "temperature": 98.6,
                                "gcs": 15
                            }
                        ],
                        "treatment": [
                            {
                                "time": datetime.datetime.now().isoformat(),
                                "procedure": "Vital signs",
                                "notes": "Initial assessment"
                            }
                        ]
                    }
                ]
            },
            "narrative": "This is a test narrative that is longer than the 20 character minimum required by validation.",
            "outcome": "Transported",
            "disposition": {
                "transported": True,
                "destination": "Test Hospital",
                "reason": "Evaluation"
            },
            "notes": "Test incident created for validation testing.",
            "created_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat(),
            "created_by": "Test User"
        }
    
    def test_basic_incident_validation(self):
        """Test basic incident validation for required fields."""
        with self.client as client:
            # Mock an authenticated session
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
            
            # Test with valid incident data
            response = client.post('/tools/incident/validate', json=self.valid_incident)
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            validation_result = response.json
            self.assertTrue(validation_result['isValid'])
            self.assertEqual(len(validation_result['errors']), 0)
            
            # Now test with missing required fields
            invalid_incident = self.valid_incident.copy()
            
            # Remove required fields
            invalid_incident.pop('call_number')
            invalid_incident.pop('type')
            invalid_incident.pop('location')
            
            response = client.post('/tools/incident/validate', json=invalid_incident)
            
            # Validate response shows validation errors
            self.assertEqual(response.status_code, 200)
            validation_result = response.json
            self.assertFalse(validation_result['isValid'])
            self.assertGreater(len(validation_result['errors']), 0)
            
            # Check for specific error messages
            error_fields = [error['field'] for error in validation_result['errors']]
            self.assertIn('incident_type.primary', error_fields)
            self.assertIn('location.address', error_fields)
    
    def test_time_sequence_validation(self):
        """Test validation of dispatch time sequence."""
        with self.client as client:
            # Mock an authenticated session
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
            
            # Create incident with invalid time sequence
            invalid_times_incident = self.valid_incident.copy()
            invalid_times_incident['times'] = {
                "received": datetime.datetime.now().isoformat(),
                "dispatched": (datetime.datetime.now() - datetime.timedelta(minutes=5)).isoformat(),  # Before received
                "first_unit_enroute": (datetime.datetime.now() + datetime.timedelta(minutes=2)).isoformat(),
                "first_unit_arrived": (datetime.datetime.now() + datetime.timedelta(minutes=8)).isoformat(),
                "last_unit_cleared": (datetime.datetime.now() + datetime.timedelta(minutes=45)).isoformat()
            }
            
            response = client.post('/tools/incident/validate', json=invalid_times_incident)
            
            # Validate response shows time sequence errors
            self.assertEqual(response.status_code, 200)
            validation_result = response.json
            self.assertFalse(validation_result['isValid'])
            
            # Check for specific error about time sequence
            time_errors = [error for error in validation_result['errors'] 
                           if 'dispatch' in error['field'] and 'time' in error['field']]
            self.assertGreater(len(time_errors), 0)
    
    def test_patient_vitals_validation(self):
        """Test validation of patient vital signs."""
        with self.client as client:
            # Mock an authenticated session
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
            
            # Create incident with invalid vital signs
            invalid_vitals_incident = self.valid_incident.copy()
            invalid_vitals_incident['patient_info'] = {
                "count": 1,
                "details": [
                    {
                        "age": 45,
                        "gender": "Male",
                        "chief_complaint": "Chest pain",
                        "vitals": [
                            {
                                "time": datetime.datetime.now().isoformat(),
                                "bp": "Invalid BP",  # Invalid BP format
                                "pulse": 300,  # Above max
                                "respiration": 2,  # Below min
                                "spo2": 110,  # Above max
                                "temperature": 98.6,
                                "gcs": 1  # Below min
                            }
                        ]
                    }
                ]
            }
            
            response = client.post('/tools/incident/validate', json=invalid_vitals_incident)
            
            # Validate response shows vital signs errors
            self.assertEqual(response.status_code, 200)
            validation_result = response.json
            self.assertFalse(validation_result['isValid'])
            
            # Check for specific vital sign errors
            vital_errors = [error for error in validation_result['errors'] 
                            if 'vitals' in error['field']]
            self.assertGreater(len(vital_errors), 0)
            
            # Check for specific errors for each vital sign
            error_fields = [error['field'] for error in validation_result['errors']]
            self.assertIn('patient_info.details[0].vitals[0].bp', error_fields)
            self.assertIn('patient_info.details[0].vitals[0].pulse', error_fields)
            self.assertIn('patient_info.details[0].vitals[0].respiration', error_fields)
            self.assertIn('patient_info.details[0].vitals[0].spo2', error_fields)
            self.assertIn('patient_info.details[0].vitals[0].gcs', error_fields)
    
    def test_narrative_length_validation(self):
        """Test validation of narrative minimum length."""
        with self.client as client:
            # Mock an authenticated session
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
            
            # Create incident with too-short narrative
            short_narrative_incident = self.valid_incident.copy()
            short_narrative_incident['narrative'] = "Too short"  # Less than 20 chars
            
            response = client.post('/tools/incident/validate', json=short_narrative_incident)
            
            # Validate response shows narrative length error
            self.assertEqual(response.status_code, 200)
            validation_result = response.json
            self.assertFalse(validation_result['isValid'])
            
            # Check for specific narrative error
            narrative_errors = [error for error in validation_result['errors'] 
                                if error['field'] == 'narrative']
            self.assertEqual(len(narrative_errors), 1)
            self.assertIn('20 characters', narrative_errors[0]['message'])
    
    def test_nfirs_compliance_validation(self):
        """Test NFIRS compliance validation."""
        with self.client as client:
            # Mock an authenticated session
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
            
            # Create a basic incident missing NFIRS fields
            nfirs_missing_incident = self.valid_incident.copy()
            
            # Request NFIRS validation
            response = client.post('/tools/incident/validate', json={
                'incident': nfirs_missing_incident,
                'check_nfirs': True
            })
            
            # Validate response shows NFIRS errors
            self.assertEqual(response.status_code, 200)
            validation_result = response.json
            
            # Should have NFIRS-specific errors
            nfirs_errors = [error for error in validation_result['errors'] 
                            if error.get('nfirs') == True]
            self.assertGreater(len(nfirs_errors), 0)
            
            # Now add NFIRS-required fields
            nfirs_compliant_incident = self.valid_incident.copy()
            nfirs_compliant_incident.update({
                'aid_given_received': 'None',
                'actions': [
                    {
                        "code": "01",
                        "description": "Fire Control or Extinguishment"
                    }
                ],
                'incident_type': {
                    'primary': 'FIRE',
                    'secondary': 'Structure Fire',
                    'specific': 'Single Family Dwelling',
                    'property_use': '419'  # NFIRS code for single family dwelling
                }
            })
            
            # Request NFIRS validation for compliant incident
            response = client.post('/tools/incident/validate', json={
                'incident': nfirs_compliant_incident,
                'check_nfirs': True
            })
            
            # Validation should pass or have only warnings
            validation_result = response.json
            nfirs_errors = [error for error in validation_result['errors'] 
                            if error.get('nfirs') == True]
            self.assertEqual(len(nfirs_errors), 0)
    
    def test_multiple_patients_validation(self):
        """Test validation with multiple patients."""
        with self.client as client:
            # Mock an authenticated session
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
            
            # Create incident with multiple patients, some with invalid data
            multi_patient_incident = self.valid_incident.copy()
            multi_patient_incident['patient_info'] = {
                "count": 3,
                "details": [
                    {
                        "age": 45,
                        "gender": "Male",
                        "chief_complaint": "Chest pain",
                        "vitals": [
                            {
                                "time": datetime.datetime.now().isoformat(),
                                "bp": "120/80",
                                "pulse": 80,
                                "respiration": 16,
                                "spo2": 98,
                                "temperature": 98.6,
                                "gcs": 15
                            }
                        ]
                    },
                    {
                        "age": 130,  # Invalid age
                        "gender": "Female",
                        "chief_complaint": "Fall",
                        "vitals": []  # No vitals
                    },
                    {
                        "age": 10,
                        "gender": "Male",
                        "chief_complaint": "",  # Missing complaint
                        "vitals": [
                            {
                                "time": datetime.datetime.now().isoformat(),
                                "bp": "100/60",
                                "pulse": 90,
                                "respiration": 18,
                                "spo2": 99,
                                "temperature": 98.8,
                                "gcs": 15
                            }
                        ]
                    }
                ]
            }
            
            response = client.post('/tools/incident/validate', json=multi_patient_incident)
            
            # Validate response shows multiple patient errors
            self.assertEqual(response.status_code, 200)
            validation_result = response.json
            self.assertFalse(validation_result['isValid'])
            
            # Check for patient-specific errors
            patient_errors = [error for error in validation_result['errors'] 
                              if 'patient_info.details' in error['field']]
            self.assertGreater(len(patient_errors), 0)
            
            # Specifically verify the age error for the second patient
            age_errors = [error for error in validation_result['errors'] 
                          if 'patient_info.details[1].age' in error['field']]
            self.assertEqual(len(age_errors), 1)

    def test_form_field_validation(self):
        """Test validation of specific form field formats."""
        with self.client as client:
            # Mock an authenticated session
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
            
            # Test various field formats
            field_validation_tests = [
                # Test phone format
                {
                    'field': 'caller_info.phone',
                    'valid_value': '(555) 123-4567',
                    'invalid_value': 'not-a-phone-number',
                    'error_contains': 'phone number'
                },
                # Test ZIP code format
                {
                    'field': 'location.zip',
                    'valid_value': '98101',
                    'invalid_value': 'ABC123',
                    'error_contains': 'ZIP code'
                }
            ]
            
            for test in field_validation_tests:
                # Test with valid value
                valid_test_incident = self.valid_incident.copy()
                field_parts = test['field'].split('.')
                
                # Set the nested field value for valid test
                if len(field_parts) == 1:
                    valid_test_incident[field_parts[0]] = test['valid_value']
                elif len(field_parts) == 2:
                    if field_parts[0] not in valid_test_incident:
                        valid_test_incident[field_parts[0]] = {}
                    valid_test_incident[field_parts[0]][field_parts[1]] = test['valid_value']
                
                response = client.post('/tools/incident/validate', json=valid_test_incident)
                validation_result = response.json
                
                # Field-specific validation should pass
                field_errors = [error for error in validation_result['errors'] 
                               if test['field'] in error['field']]
                self.assertEqual(len(field_errors), 0, 
                                f"Field {test['field']} with valid value '{test['valid_value']}' failed validation")
                
                # Test with invalid value
                invalid_test_incident = self.valid_incident.copy()
                
                # Set the nested field value for invalid test
                if len(field_parts) == 1:
                    invalid_test_incident[field_parts[0]] = test['invalid_value']
                elif len(field_parts) == 2:
                    if field_parts[0] not in invalid_test_incident:
                        invalid_test_incident[field_parts[0]] = {}
                    invalid_test_incident[field_parts[0]][field_parts[1]] = test['invalid_value']
                
                response = client.post('/tools/incident/validate', json=invalid_test_incident)
                validation_result = response.json
                
                # Should have field-specific error
                field_errors = [error for error in validation_result['errors'] 
                               if test['field'] in error['field']]
                self.assertEqual(len(field_errors), 1, 
                                f"Field {test['field']} with invalid value '{test['invalid_value']}' did not fail validation")
                
                # Error message should contain the expected text
                self.assertIn(test['error_contains'].lower(), 
                             field_errors[0]['message'].lower(),
                             f"Error message for {test['field']} validation doesn't contain '{test['error_contains']}'")

if __name__ == "__main__":
    unittest.main()