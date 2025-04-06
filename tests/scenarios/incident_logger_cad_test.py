"""
Functional test for Incident Logger CAD integration.

This test verifies that the Incident Logger properly integrates with 
Computer-Aided Dispatch (CAD) systems for receiving and processing incident data.
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

class IncidentLoggerCADTest(IncidentTestCase, BlueprintTestCase):
    """Test the Incident Logger CAD integration functionality."""
    
    blueprint_name = 'tools'
    fixture_name = "medium_test"
    
    def setUp(self):
        """Set up test data and helpers."""
        super().setUp()
        
        # Sample CAD data in different formats to test integration
        self.sample_cad_data = {
            # Generic CAD format
            "generic": {
                "call_number": "CAD-2025-12345",
                "call_type": "EMS",
                "call_details": "Chest Pain",
                "priority": "1",
                "location": {
                    "address": "123 Main St",
                    "city": "Seattle",
                    "state": "WA",
                    "zip": "98101",
                    "latitude": 47.6062,
                    "longitude": -122.3321
                },
                "caller": {
                    "name": "John Doe",
                    "phone": "555-123-4567"
                },
                "units": ["E1", "M7"],
                "times": {
                    "call_received": datetime.datetime.now().isoformat(),
                    "dispatched": (datetime.datetime.now() + datetime.timedelta(minutes=1)).isoformat()
                }
            },
            
            # Zoll CAD format
            "zoll": {
                "inc_number": "I2025-5678",
                "nature": "MEDICAL",
                "complaint": "CHEST PAIN",
                "priority": "P1",
                "address": "456 Oak Ave",
                "city": "Bellevue",
                "state": "WA",
                "postal": "98004",
                "lat": "47.6101",
                "lon": "-122.2015",
                "reporting_party": "Jane Smith",
                "callback": "555-987-6543",
                "units_assigned": "ENG3,MED2",
                "received": datetime.datetime.now().isoformat(),
                "dispatch": (datetime.datetime.now() + datetime.timedelta(minutes=1)).isoformat()
            },
            
            # ESO CAD format
            "eso": {
                "IncidentNumber": "ESO-2025-1234",
                "IncidentType": "Medical Emergency",
                "NatureOfCall": "Difficulty Breathing",
                "ResponseLevel": "ECHO",
                "Location": {
                    "StreetAddress": "789 Pine Dr",
                    "City": "Redmond",
                    "State": "WA",
                    "PostalCode": "98052",
                    "Latitude": 47.6740,
                    "Longitude": -122.1215
                },
                "Caller": {
                    "CallerName": "Robert Johnson",
                    "ContactNumber": "555-555-1212"
                },
                "RespondingUnits": ["E5", "A3", "M1"],
                "Timestamps": {
                    "CallReceived": datetime.datetime.now().isoformat(),
                    "Dispatched": (datetime.datetime.now() + datetime.timedelta(minutes=1)).isoformat(),
                    "Enroute": (datetime.datetime.now() + datetime.timedelta(minutes=3)).isoformat()
                }
            }
        }
        
    def test_cad_integration_endpoints(self):
        """Test CAD integration API endpoints."""
        with self.client as client:
            # Mock an authenticated session with API access
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_api'] = True
            
            # Test the CAD system status endpoint
            response = client.get('/tools/cad/status')
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            status_data = response.json
            self.assertIn('status', status_data)
            self.assertIn('supported_systems', status_data)
            self.assertIn('connected_systems', status_data)
    
    def test_generic_cad_data_processing(self):
        """Test processing of generic CAD data format."""
        with self.client as client:
            # Mock an authenticated session with API access
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_api'] = True
            
            # Send generic CAD data
            response = client.post('/tools/cad/incident', json={
                'cad_system': 'generic',
                'department_id': self.department['id'] if self.department else 'dept-1',
                'data': self.sample_cad_data['generic']
            })
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            result = response.json
            self.assertTrue(result['success'])
            self.assertIn('incident_id', result)
            
            # Verify the incident was created with the correct CAD data
            incident_id = result['incident_id']
            response = client.get(f'/tools/incident/{incident_id}')
            
            incident_data = response.json
            self.assertEqual(incident_data['call_number'], self.sample_cad_data['generic']['call_number'])
            self.assertEqual(incident_data['category'], 'EMS')
            self.assertEqual(incident_data['type'], 'Chest Pain')
            self.assertEqual(incident_data['priority'], 1)
            
            # Verify location data
            self.assertEqual(incident_data['location']['address'], 
                          self.sample_cad_data['generic']['location']['address'])
            
            # Verify units were assigned
            self.assertEqual(len(incident_data['units']), 2)
            unit_ids = [unit['unit_id'] for unit in incident_data['units']]
            self.assertIn('E1', unit_ids)
            self.assertIn('M7', unit_ids)
    
    def test_zoll_cad_format_conversion(self):
        """Test conversion of Zoll CAD format to internal format."""
        with self.client as client:
            # Mock an authenticated session with API access
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_api'] = True
            
            # Send Zoll format CAD data
            response = client.post('/tools/cad/incident', json={
                'cad_system': 'zoll',
                'department_id': self.department['id'] if self.department else 'dept-1',
                'data': self.sample_cad_data['zoll']
            })
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            result = response.json
            self.assertTrue(result['success'])
            self.assertIn('incident_id', result)
            
            # Verify the incident was created with the correct converted data
            incident_id = result['incident_id']
            response = client.get(f'/tools/incident/{incident_id}')
            
            incident_data = response.json
            self.assertEqual(incident_data['call_number'], self.sample_cad_data['zoll']['inc_number'])
            self.assertEqual(incident_data['category'], 'EMS')  # Converted from MEDICAL
            self.assertEqual(incident_data['type'], 'CHEST PAIN')
            self.assertEqual(incident_data['priority'], 1)  # Converted from P1
            
            # Verify address was properly converted
            self.assertEqual(incident_data['location']['address'], self.sample_cad_data['zoll']['address'])
            self.assertEqual(incident_data['location']['city'], self.sample_cad_data['zoll']['city'])
            
            # Verify units were correctly split and assigned
            self.assertEqual(len(incident_data['units']), 2)
            unit_ids = [unit['unit_id'] for unit in incident_data['units']]
            self.assertIn('ENG3', unit_ids)
            self.assertIn('MED2', unit_ids)
    
    def test_eso_cad_format_conversion(self):
        """Test conversion of ESO CAD format to internal format."""
        with self.client as client:
            # Mock an authenticated session with API access
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_api'] = True
            
            # Send ESO format CAD data
            response = client.post('/tools/cad/incident', json={
                'cad_system': 'eso',
                'department_id': self.department['id'] if self.department else 'dept-1',
                'data': self.sample_cad_data['eso']
            })
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            result = response.json
            self.assertTrue(result['success'])
            self.assertIn('incident_id', result)
            
            # Verify the incident was created with the correct converted data
            incident_id = result['incident_id']
            response = client.get(f'/tools/incident/{incident_id}')
            
            incident_data = response.json
            self.assertEqual(incident_data['call_number'], self.sample_cad_data['eso']['IncidentNumber'])
            self.assertEqual(incident_data['category'], 'EMS')  # Inferred from Medical Emergency
            self.assertEqual(incident_data['type'], 'Difficulty Breathing')
            self.assertEqual(incident_data['priority'], 1)  # ECHO converts to priority 1
            
            # Verify location data was correctly mapped
            self.assertEqual(incident_data['location']['address'], 
                          self.sample_cad_data['eso']['Location']['StreetAddress'])
            self.assertEqual(incident_data['location']['city'], 
                          self.sample_cad_data['eso']['Location']['City'])
            
            # Verify all units were assigned
            self.assertEqual(len(incident_data['units']), 3)
            unit_ids = [unit['unit_id'] for unit in incident_data['units']]
            self.assertIn('E5', unit_ids)
            self.assertIn('A3', unit_ids)
            self.assertIn('M1', unit_ids)
    
    def test_cad_update_existing_incident(self):
        """Test updating an existing incident with new CAD data."""
        with self.client as client:
            # Mock an authenticated session with API access
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_api'] = True
            
            # First create an incident with initial CAD data
            response = client.post('/tools/cad/incident', json={
                'cad_system': 'generic',
                'department_id': self.department['id'] if self.department else 'dept-1',
                'data': self.sample_cad_data['generic']
            })
            
            # Get the incident ID
            result = response.json
            incident_id = result['incident_id']
            
            # Now update the incident with new CAD data
            updated_cad_data = self.sample_cad_data['generic'].copy()
            updated_cad_data['priority'] = "2"  # Changed priority
            updated_cad_data['units'] = ["E1", "M7", "B3"]  # Added battalion chief
            updated_cad_data['times']['enroute'] = datetime.datetime.now().isoformat()  # Added en route time
            
            response = client.post('/tools/cad/incident/update', json={
                'cad_system': 'generic',
                'incident_id': incident_id,
                'data': updated_cad_data
            })
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            result = response.json
            self.assertTrue(result['success'])
            
            # Verify the incident was updated with the new data
            response = client.get(f'/tools/incident/{incident_id}')
            
            incident_data = response.json
            self.assertEqual(incident_data['priority'], 2)  # Updated priority
            
            # Verify units were updated
            self.assertEqual(len(incident_data['units']), 3)  # Now 3 units
            unit_ids = [unit['unit_id'] for unit in incident_data['units']]
            self.assertIn('B3', unit_ids)  # New unit added
            
            # Verify times were updated
            self.assertIn('enroute', incident_data['times'])
    
    def test_cad_webhook_processing(self):
        """Test processing CAD updates via webhook."""
        with self.client as client:
            # Mock an authenticated session to configure webhook
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_api'] = True
            
            # Configure CAD webhook
            response = client.post('/tools/cad/webhook/configure', json={
                'department_id': self.department['id'] if self.department else 'dept-1',
                'cad_system': 'generic',
                'enabled': True,
                'secret_key': 'test-webhook-secret'
            })
            
            # Validate webhook configuration
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json['success'])
            
            # Now simulate a webhook call from the CAD system
            webhook_payload = {
                'secret_key': 'test-webhook-secret',
                'event_type': 'new_incident',
                'data': self.sample_cad_data['generic']
            }
            
            response = client.post('/tools/cad/webhook', json=webhook_payload)
            
            # Validate webhook processing
            self.assertEqual(response.status_code, 200)
            result = response.json
            self.assertTrue(result['success'])
            self.assertIn('incident_id', result)
            
            # Verify the incident was created
            incident_id = result['incident_id']
            response = client.get(f'/tools/incident/{incident_id}')
            
            incident_data = response.json
            self.assertEqual(incident_data['call_number'], self.sample_cad_data['generic']['call_number'])
    
    def test_cad_api_key_authentication(self):
        """Test CAD API authentication with API keys."""
        with self.client as client:
            # First, create an API key for CAD integration
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.dept_users else '12345'
                session['authorized_for_api'] = True
            
            response = client.post('/tools/cad/api-key/create', json={
                'department_id': self.department['id'] if self.department else 'dept-1',
                'name': 'Test CAD Integration',
                'expiration': (datetime.datetime.now() + datetime.timedelta(days=30)).isoformat()
            })
            
            # Get the API key
            self.assertEqual(response.status_code, 200)
            api_key = response.json['api_key']
            
            # Now test API access with the key
            headers = {
                'X-API-Key': api_key
            }
            
            response = client.post('/tools/cad/incident', 
                              json={
                                  'cad_system': 'generic',
                                  'department_id': self.department['id'] if self.department else 'dept-1',
                                  'data': self.sample_cad_data['generic']
                              }, 
                              headers=headers)
            
            # Validate response with valid API key
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json['success'])
            
            # Test with invalid API key
            headers = {
                'X-API-Key': 'invalid-api-key'
            }
            
            response = client.post('/tools/cad/incident', 
                              json={
                                  'cad_system': 'generic',
                                  'department_id': self.department['id'] if self.department else 'dept-1',
                                  'data': self.sample_cad_data['generic']
                              }, 
                              headers=headers)
            
            # Validate unauthorized response with invalid API key
            self.assertEqual(response.status_code, 401)
    
    def test_multiple_cad_systems_coordination(self):
        """Test coordination between multiple CAD systems for the same incident."""
        with self.client as client:
            # Mock an authenticated session with API access
            with client.session_transaction() as session:
                session['user_id'] = self.dept_users[0]['id'] if self.department else '12345'
                session['authorized_for_api'] = True
            
            # Create an incident with Zoll CAD data
            response = client.post('/tools/cad/incident', json={
                'cad_system': 'zoll',
                'department_id': self.department['id'] if self.department else 'dept-1',
                'external_id': 'shared-incident-123',  # External ID to link systems
                'data': self.sample_cad_data['zoll']
            })
            
            # Get the incident ID
            zoll_result = response.json
            incident_id = zoll_result['incident_id']
            
            # Now add ESO CAD data to the same incident using the external ID
            response = client.post('/tools/cad/incident/link', json={
                'cad_system': 'eso',
                'department_id': self.department['id'] if self.department else 'dept-1',
                'external_id': 'shared-incident-123',
                'data': self.sample_cad_data['eso']
            })
            
            # Validate response
            self.assertEqual(response.status_code, 200)
            eso_result = response.json
            self.assertTrue(eso_result['success'])
            self.assertEqual(eso_result['incident_id'], incident_id)  # Should link to the same incident
            
            # Verify the incident has combined data from both systems
            response = client.get(f'/tools/incident/{incident_id}')
            
            incident_data = response.json
            self.assertIn('cad_integrations', incident_data)
            self.assertEqual(len(incident_data['cad_integrations']), 2)
            
            # Verify CAD system names are in the integration data
            cad_systems = [integration['system'] for integration in incident_data['cad_integrations']]
            self.assertIn('zoll', cad_systems)
            self.assertIn('eso', cad_systems)
            
            # Verify units from both systems are present
            units = [unit['unit_id'] for unit in incident_data['units']]
            # Units from Zoll
            self.assertIn('ENG3', units)
            self.assertIn('MED2', units)
            # Units from ESO
            self.assertIn('E5', units)
            self.assertIn('A3', units)
            self.assertIn('M1', units)


if __name__ == "__main__":
    unittest.main()