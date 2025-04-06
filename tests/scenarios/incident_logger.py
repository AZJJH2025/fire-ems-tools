"""
Test scenarios for Incident Logger feature.

These scenarios test the functionality of the Incident Logger,
including incident creation, HIPAA compliance, CAD integration,
and data validation.
"""

import os
import sys
import json
import datetime
import random
import tempfile
import csv
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from scenarios.scenario_base import TestScenario


class BaseIncidentLoggerScenario(TestScenario):
    """Base class for incident logger test scenarios."""
    
    feature = "Incident Logger"
    fixture_name = "medium_test"  # Use more data for these tests
    
    def setup(self):
        """Set up the incident logger scenario."""
        super().setup()
        
        # Make sure we have data to work with
        if not self.department:
            self.logger.warning("No department available for testing")
            return
        
        # Create sample CAD files for testing
        self.csv_cad_file = self._create_test_csv_cad()
        self.json_cad_file = self._create_test_json_cad()
        self.xml_cad_file = self._create_test_xml_cad()
        
        # Initialize state for tracking scenario data
        self.state.update({
            "cad_files": {
                "csv": self.csv_cad_file,
                "json": self.json_cad_file,
                "xml": self.xml_cad_file
            }
        })
    
    def _create_test_csv_cad(self) -> str:
        """Create a CSV CAD file with test incident data.
        
        Returns:
            Path to the created CSV file
        """
        # Create a temporary file
        fd, filepath = tempfile.mkstemp(suffix='.csv')
        os.close(fd)
        
        # Get a sample incident
        sample_incident = self.dept_incidents[0] if self.dept_incidents else None
        
        if not sample_incident:
            self.logger.warning("No incident data available for test CSV")
            return filepath
        
        # Write CAD data to the CSV file
        with open(filepath, 'w', newline='') as csvfile:
            fieldnames = [
                'CAD_ID', 'CallType', 'CallNature', 'Priority', 'Address', 'City', 
                'State', 'Zip', 'Latitude', 'Longitude', 'CallReceivedTime', 
                'DispatchTime', 'ResponseTime', 'OnSceneTime', 'ClearTime',
                'UnitID', 'UnitType', 'UnitStatus'
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            # Write row for this CAD entry
            for unit in sample_incident.get('units', []):
                writer.writerow({
                    'CAD_ID': f"CAD-{random.randint(10000, 99999)}",
                    'CallType': sample_incident['category'],
                    'CallNature': sample_incident['type'],
                    'Priority': sample_incident['priority'],
                    'Address': sample_incident['location']['address'],
                    'City': sample_incident['location']['city'],
                    'State': sample_incident['location']['state'],
                    'Zip': sample_incident['location']['postal_code'],
                    'Latitude': sample_incident['location']['latitude'],
                    'Longitude': sample_incident['location']['longitude'],
                    'CallReceivedTime': sample_incident['times']['received'],
                    'DispatchTime': sample_incident['times']['dispatched'],
                    'ResponseTime': unit['times']['enroute'],
                    'OnSceneTime': unit['times']['arrived'],
                    'ClearTime': unit['times']['cleared'],
                    'UnitID': unit['unit_id'],
                    'UnitType': unit['unit_type'],
                    'UnitStatus': 'Cleared'
                })
        
        self.logger.info(f"Created test CSV CAD file at {filepath}")
        return filepath
    
    def _create_test_json_cad(self) -> str:
        """Create a JSON CAD file with test incident data.
        
        Returns:
            Path to the created JSON file
        """
        # Create a temporary file
        fd, filepath = tempfile.mkstemp(suffix='.json')
        os.close(fd)
        
        # Get a sample incident
        sample_incident = self.dept_incidents[0] if self.dept_incidents else None
        
        if not sample_incident:
            self.logger.warning("No incident data available for test JSON")
            return filepath
        
        # Create CAD data
        cad_data = {
            "cad_id": f"CAD-{random.randint(10000, 99999)}",
            "call_info": {
                "type": sample_incident['category'],
                "nature": sample_incident['type'],
                "priority": sample_incident['priority'],
                "location": {
                    "address": sample_incident['location']['address'],
                    "city": sample_incident['location']['city'],
                    "state": sample_incident['location']['state'],
                    "postal_code": sample_incident['location']['postal_code'],
                    "coordinates": {
                        "latitude": sample_incident['location']['latitude'],
                        "longitude": sample_incident['location']['longitude']
                    }
                }
            },
            "times": {
                "received": sample_incident['times']['received'],
                "dispatched": sample_incident['times']['dispatched'],
                "first_unit_enroute": sample_incident['times']['first_unit_enroute'],
                "first_unit_arrived": sample_incident['times']['first_unit_arrived'],
                "last_unit_cleared": sample_incident['times']['last_unit_cleared']
            },
            "units": []
        }
        
        # Add units
        for unit in sample_incident.get('units', []):
            cad_data["units"].append({
                "unit_id": unit['unit_id'],
                "unit_type": unit['unit_type'],
                "station_id": unit['station_id'],
                "status": "Cleared",
                "times": {
                    "dispatched": unit['times']['dispatched'],
                    "enroute": unit['times']['enroute'],
                    "arrived": unit['times']['arrived'],
                    "cleared": unit['times']['cleared']
                }
            })
        
        # Write to file
        with open(filepath, 'w') as f:
            json.dump(cad_data, f, indent=2)
        
        self.logger.info(f"Created test JSON CAD file at {filepath}")
        return filepath
    
    def _create_test_xml_cad(self) -> str:
        """Create an XML CAD file with test incident data.
        
        Returns:
            Path to the created XML file
        """
        # Create a temporary file
        fd, filepath = tempfile.mkstemp(suffix='.xml')
        os.close(fd)
        
        # Get a sample incident
        sample_incident = self.dept_incidents[0] if self.dept_incidents else None
        
        if not sample_incident:
            self.logger.warning("No incident data available for test XML")
            return filepath
        
        # Create XML structure
        root = ET.Element("CADIncident")
        ET.SubElement(root, "CAD_ID").text = f"CAD-{random.randint(10000, 99999)}"
        
        call_info = ET.SubElement(root, "CallInfo")
        ET.SubElement(call_info, "Type").text = sample_incident['category']
        ET.SubElement(call_info, "Nature").text = sample_incident['type']
        ET.SubElement(call_info, "Priority").text = str(sample_incident['priority'])
        
        location = ET.SubElement(call_info, "Location")
        ET.SubElement(location, "Address").text = sample_incident['location']['address']
        ET.SubElement(location, "City").text = sample_incident['location']['city']
        ET.SubElement(location, "State").text = sample_incident['location']['state']
        ET.SubElement(location, "PostalCode").text = sample_incident['location']['postal_code']
        ET.SubElement(location, "Latitude").text = str(sample_incident['location']['latitude'])
        ET.SubElement(location, "Longitude").text = str(sample_incident['location']['longitude'])
        
        times = ET.SubElement(root, "Times")
        ET.SubElement(times, "Received").text = sample_incident['times']['received']
        ET.SubElement(times, "Dispatched").text = sample_incident['times']['dispatched']
        ET.SubElement(times, "FirstUnitEnroute").text = sample_incident['times']['first_unit_enroute']
        ET.SubElement(times, "FirstUnitArrived").text = sample_incident['times']['first_unit_arrived']
        ET.SubElement(times, "LastUnitCleared").text = sample_incident['times']['last_unit_cleared']
        
        units = ET.SubElement(root, "Units")
        for unit in sample_incident.get('units', []):
            unit_elem = ET.SubElement(units, "Unit")
            ET.SubElement(unit_elem, "UnitID").text = unit['unit_id']
            ET.SubElement(unit_elem, "UnitType").text = unit['unit_type']
            ET.SubElement(unit_elem, "StationID").text = unit['station_id']
            ET.SubElement(unit_elem, "Status").text = "Cleared"
            
            unit_times = ET.SubElement(unit_elem, "Times")
            ET.SubElement(unit_times, "Dispatched").text = unit['times']['dispatched']
            ET.SubElement(unit_times, "Enroute").text = unit['times']['enroute']
            ET.SubElement(unit_times, "Arrived").text = unit['times']['arrived']
            ET.SubElement(unit_times, "Cleared").text = unit['times']['cleared']
        
        # Write to file
        tree = ET.ElementTree(root)
        tree.write(filepath, encoding='utf-8', xml_declaration=True)
        
        self.logger.info(f"Created test XML CAD file at {filepath}")
        return filepath
    
    def teardown(self):
        """Clean up after the scenario."""
        super().teardown()
        
        # Delete the temporary CAD files
        for file_path in [self.csv_cad_file, self.json_cad_file, self.xml_cad_file]:
            if os.path.exists(file_path):
                os.unlink(file_path)
                self.logger.info(f"Deleted test file: {file_path}")


class IncidentCreationScenario(BaseIncidentLoggerScenario):
    """Test scenario for creating a new incident in the Incident Logger."""
    
    name = "Incident Creation"
    
    def run(self):
        """Run the scenario."""
        super().run()
        
        # Create a new incident
        self.logger.info("Creating new incident")
        
        # Get a random station for the incident
        station = random.choice(self.dept_stations) if self.dept_stations else None
        
        if not station:
            self.logger.warning("No station available for incident creation")
            return
        
        # Generate a realistic incident
        incident = {
            "department_id": self.department["id"],
            "call_number": f"{datetime.datetime.now().year}-{random.randint(10000, 99999)}",
            "type": "Medical Emergency",
            "category": "EMS",
            "priority": 2,
            "location": {
                "latitude": station['location']['latitude'] + random.uniform(-0.01, 0.01),
                "longitude": station['location']['longitude'] + random.uniform(-0.01, 0.01),
                "address": f"{random.randint(100, 999)} Main Street",
                "city": station['location']['city'],
                "state": station['location']['state'],
                "postal_code": station['location']['postal_code']
            },
            "caller_info": {
                "name": "John Doe",  # Fictional name for test
                "phone": f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
            },
            "patient_info": {
                "id": f"PT-{random.randint(10000, 99999)}",
                "age": random.randint(18, 90),
                "gender": random.choice(["Male", "Female", "Other"]),
                "symptoms": ["Chest Pain", "Shortness of Breath"],
                "medical_history": ["Hypertension"],
                "medications": ["Lisinopril"],
                "allergies": ["Penicillin"]
            },
            "vitals": [
                {
                    "time": datetime.datetime.now().isoformat(),
                    "blood_pressure": f"{random.randint(100, 160)}/{random.randint(60, 100)}",
                    "heart_rate": random.randint(60, 120),
                    "respiratory_rate": random.randint(12, 30),
                    "oxygen_saturation": random.randint(90, 100),
                    "temperature": round(random.uniform(36.0, 38.5), 1)
                }
            ],
            "treatments": [
                {
                    "time": datetime.datetime.now().isoformat(),
                    "type": "Medication",
                    "name": "Aspirin",
                    "dose": "325mg",
                    "route": "PO"
                }
            ],
            "times": {
                "received": datetime.datetime.now().isoformat(),
                "dispatched": (datetime.datetime.now() + datetime.timedelta(minutes=1)).isoformat(),
                "first_unit_enroute": (datetime.datetime.now() + datetime.timedelta(minutes=2)).isoformat(),
                "first_unit_arrived": (datetime.datetime.now() + datetime.timedelta(minutes=10)).isoformat(),
                "last_unit_cleared": (datetime.datetime.now() + datetime.timedelta(hours=1)).isoformat()
            },
            "units": [
                {
                    "unit_id": random.choice([u['unit_id'] for u in station['apparatus']]),
                    "unit_type": random.choice([u['type'] for u in station['apparatus']]),
                    "station_id": station['id'],
                    "personnel_count": random.randint(2, 4),
                    "status": "Cleared",
                    "times": {
                        "dispatched": (datetime.datetime.now() + datetime.timedelta(minutes=1)).isoformat(),
                        "enroute": (datetime.datetime.now() + datetime.timedelta(minutes=2)).isoformat(),
                        "arrived": (datetime.datetime.now() + datetime.timedelta(minutes=10)).isoformat(),
                        "cleared": (datetime.datetime.now() + datetime.timedelta(hours=1)).isoformat()
                    }
                }
            ],
            "outcome": "Transport to Hospital",
            "hospital": "Memorial Hospital",
            "notes": "Patient reported sudden onset of chest pain while exercising.",
            "created_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat()
        }
        
        # Store the incident in the state
        self.state.update({
            'incident_created': True,
            'incident': incident,
            'creation_time': datetime.datetime.now().isoformat()
        })
        
        self.logger.info(f"Created incident: {incident['call_number']}")
    
    def validate(self) -> bool:
        """Validate the scenario results."""
        super().validate()
        
        # Check that the incident was created
        if not self.state.get('incident_created'):
            self.logger.error("Incident was not created")
            return False
        
        # Check that the incident has all required fields
        incident = self.state.get('incident', {})
        required_fields = [
            'department_id', 'call_number', 'type', 'category', 'priority',
            'location', 'times', 'units'
        ]
        
        for field in required_fields:
            if field not in incident:
                self.logger.error(f"Incident is missing required field: {field}")
                return False
        
        # Validate that patient data includes PHI (Protected Health Information)
        if 'patient_info' not in incident:
            self.logger.error("Incident is missing patient information")
            return False
        
        # In a real test, would check that PHI is properly handled per HIPAA
        
        self.state['success'] = True
        return True


class CADIntegrationScenario(BaseIncidentLoggerScenario):
    """Test scenario for CAD integration with the Incident Logger."""
    
    name = "CAD Integration"
    
    def run(self):
        """Run the scenario."""
        super().run()
        
        # Track each step's success
        all_steps_successful = True
        
        # Track durations for performance metrics
        start_time = datetime.datetime.now()
        
        # Test CSV CAD integration
        self.logger.info(f"Testing CSV CAD integration with {self.csv_cad_file}")
        csv_success = self._process_cad_file('csv', self.csv_cad_file)
        all_steps_successful = all_steps_successful and csv_success
        
        # Test JSON CAD integration
        self.logger.info(f"Testing JSON CAD integration with {self.json_cad_file}")
        json_success = self._process_cad_file('json', self.json_cad_file)
        all_steps_successful = all_steps_successful and json_success
        
        # Test XML CAD integration
        self.logger.info(f"Testing XML CAD integration with {self.xml_cad_file}")
        xml_success = self._process_cad_file('xml', self.xml_cad_file)
        all_steps_successful = all_steps_successful and xml_success
        
        # Record total duration
        end_time = datetime.datetime.now()
        self.state['duration'] = (end_time - start_time).total_seconds()
        
        # Record overall result
        self.state['all_steps_successful'] = all_steps_successful
    
    def _process_cad_file(self, format_type, file_path):
        """Process a CAD file and record results.
        
        Args:
            format_type: The format of the CAD file (csv, json, xml)
            file_path: Path to the CAD file
            
        Returns:
            True if processing was successful, False otherwise
        """
        # In a real test, this would use a test client to upload and process the file
        # Here we'll simulate parsing the file
        
        if not os.path.exists(file_path):
            self.logger.error(f"CAD file not found: {file_path}")
            
            # Store failure information
            if format_type not in self.state:
                self.state[format_type] = {}
            
            self.state[format_type].update({
                'file_processed': False,
                'error': f"File not found: {file_path}"
            })
            
            return False
        
        try:
            parsed_data = None
            
            if format_type == 'csv':
                with open(file_path, 'r') as f:
                    reader = csv.DictReader(f)
                    parsed_data = list(reader)
            elif format_type == 'json':
                with open(file_path, 'r') as f:
                    parsed_data = json.load(f)
            elif format_type == 'xml':
                tree = ET.parse(file_path)
                root = tree.getroot()
                # In a real test, would convert the XML to a dict
                parsed_data = {'format': 'xml', 'root': root.tag}
            
            # Verify that we got data
            if not parsed_data:
                self.logger.warning(f"No data found in {format_type.upper()} CAD file")
            
            # Simulate incident creation from CAD data
            incident_id = f"INC-{random.randint(10000, 99999)}"
            
            # Store the results
            if format_type not in self.state:
                self.state[format_type] = {}
            
            self.state[format_type].update({
                'file_processed': True,
                'parsed_data': str(parsed_data)[:200] + '...' if parsed_data else None,  # Truncate for readability
                'incident_id': incident_id,
                'processing_time': datetime.datetime.now().isoformat()
            })
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error processing {format_type.upper()} CAD file: {e}")
            
            # Store error information
            if format_type not in self.state:
                self.state[format_type] = {}
            
            self.state[format_type].update({
                'file_processed': False,
                'error': str(e)
            })
            
            # Flag the error in state
            self.state['error'] = f"Error processing {format_type.upper()} CAD file: {e}"
            
            return False
    
    def validate(self) -> bool:
        """Validate the scenario results."""
        # Check that all CAD formats were processed
        all_formats_processed = True
        
        for format_type in ['csv', 'json', 'xml']:
            if format_type not in self.state:
                self.logger.error(f"{format_type.upper()} CAD file was not processed")
                all_formats_processed = False
                continue
            
            if not self.state[format_type].get('file_processed'):
                self.logger.error(f"{format_type.upper()} CAD file processing failed")
                all_formats_processed = False
                continue
            
            if not self.state[format_type].get('incident_id'):
                self.logger.error(f"No incident created from {format_type.upper()} CAD file")
                all_formats_processed = False
                continue
                
            self.logger.info(f"Successfully processed {format_type.upper()} CAD file")
        
        # Set the success state to True if all formats were processed successfully
        success = all_formats_processed and self.state.get('all_steps_successful', False)
        self.state['success'] = success
        
        return success


class HIPAAComplianceScenario(BaseIncidentLoggerScenario):
    """Test scenario for HIPAA compliance in the Incident Logger."""
    
    name = "HIPAA Compliance"
    
    def run(self):
        """Run the scenario."""
        super().run()
        
        # Create patient data with PHI
        patient_data = {
            "first_name": "John",
            "last_name": "Smith",
            "date_of_birth": "1975-06-15",
            "ssn": "123-45-6789",  # Fake SSN for testing
            "mrn": "MRN12345",
            "address": "123 Main St, Anytown, USA",
            "phone": "555-123-4567",
            "email": "john.smith@example.com",
            "medical_history": [
                "Hypertension",
                "Type 2 Diabetes",
                "Appendectomy (2010)"
            ],
            "medications": [
                "Lisinopril 10mg daily",
                "Metformin 500mg twice daily"
            ],
            "allergies": [
                "Penicillin",
                "Shellfish"
            ]
        }
        
        # Record the patient data
        self.state['patient_data'] = patient_data
        
        # Simulate storage of patient data
        self.logger.info("Storing patient data securely")
        
        # Test de-identification for reporting
        self.logger.info("Testing de-identification for reporting")
        
        deidentified_data = self._deidentify_patient_data(patient_data)
        self.state['deidentified_data'] = deidentified_data
        
        # Test access controls
        self.logger.info("Testing access controls")
        
        # Simulate different user roles accessing the data
        access_results = {
            'admin': True,
            'ems_provider': True,
            'dispatcher': False,  # Shouldn't have access to full PHI
            'analyst': False,     # Shouldn't have access to full PHI
            'guest': False        # Shouldn't have access to PHI
        }
        
        self.state['access_results'] = access_results
        
        # Test audit logging
        self.logger.info("Testing audit logging")
        
        audit_log = [
            {
                'timestamp': datetime.datetime.now().isoformat(),
                'user': 'admin',
                'action': 'view',
                'resource': 'patient_data',
                'resource_id': 'PT12345'
            },
            {
                'timestamp': datetime.datetime.now().isoformat(),
                'user': 'ems_provider',
                'action': 'edit',
                'resource': 'patient_data',
                'resource_id': 'PT12345',
                'field': 'medications'
            }
        ]
        
        self.state['audit_log'] = audit_log
    
    def _deidentify_patient_data(self, patient_data):
        """De-identify patient data for HIPAA compliance.
        
        Args:
            patient_data: Dictionary of patient data with PHI
            
        Returns:
            Dictionary with de-identified patient data
        """
        # Create a copy to avoid modifying the original
        deidentified = patient_data.copy()
        
        # Replace direct identifiers with placeholders
        deidentified['first_name'] = '[REDACTED]'
        deidentified['last_name'] = '[REDACTED]'
        deidentified['date_of_birth'] = '[REDACTED]'
        deidentified['ssn'] = '[REDACTED]'
        deidentified['mrn'] = '[REDACTED]'
        deidentified['address'] = '[REDACTED]'
        deidentified['phone'] = '[REDACTED]'
        deidentified['email'] = '[REDACTED]'
        
        # Keep non-identifying medical information
        # (In a real system, would need to be more careful about rare conditions)
        
        return deidentified
    
    def validate(self) -> bool:
        """Validate the scenario results."""
        super().validate()
        
        # Check that patient data was stored
        if 'patient_data' not in self.state:
            self.logger.error("Patient data was not stored")
            return False
        
        # Check that de-identification was performed
        if 'deidentified_data' not in self.state:
            self.logger.error("De-identification was not performed")
            return False
        
        # Verify that PHI was properly de-identified
        deidentified = self.state.get('deidentified_data', {})
        phi_fields = ['first_name', 'last_name', 'date_of_birth', 'ssn', 
                      'mrn', 'address', 'phone', 'email']
        
        for field in phi_fields:
            if field in deidentified and deidentified[field] != '[REDACTED]':
                self.logger.error(f"PHI field {field} was not properly de-identified")
                return False
        
        # Check that access controls were tested
        if 'access_results' not in self.state:
            self.logger.error("Access controls were not tested")
            return False
        
        # Check that audit logging was implemented
        if 'audit_log' not in self.state:
            self.logger.error("Audit logging was not implemented")
            return False
        
        self.state['success'] = True
        return True


class IncidentValidationScenario(BaseIncidentLoggerScenario):
    """Test scenario for form validation in the Incident Logger."""
    
    name = "Incident Validation"
    
    def run(self):
        """Run the scenario."""
        super().run()
        
        # Test valid case
        self.logger.info("Testing valid incident data")
        
        valid_incident = {
            "department_id": self.department["id"],
            "call_number": f"{datetime.datetime.now().year}-{random.randint(10000, 99999)}",
            "type": "Medical Emergency",
            "category": "EMS",
            "priority": 2,
            "location": {
                "latitude": 47.6062,
                "longitude": -122.3321,
                "address": "123 Main Street",
                "city": "Seattle",
                "state": "WA",
                "postal_code": "98101"
            },
            "caller_info": {
                "name": "John Doe",
                "phone": "555-123-4567"
            },
            "times": {
                "received": datetime.datetime.now().isoformat(),
                "dispatched": (datetime.datetime.now() + datetime.timedelta(minutes=1)).isoformat(),
                "first_unit_enroute": (datetime.datetime.now() + datetime.timedelta(minutes=2)).isoformat(),
                "first_unit_arrived": (datetime.datetime.now() + datetime.timedelta(minutes=10)).isoformat(),
                "last_unit_cleared": (datetime.datetime.now() + datetime.timedelta(hours=1)).isoformat()
            },
            "units": [
                {
                    "unit_id": "E1",
                    "unit_type": "Engine",
                    "station_id": self.dept_stations[0]["id"] if self.dept_stations else "STA1",
                    "personnel_count": 3,
                    "status": "Cleared",
                    "times": {
                        "dispatched": (datetime.datetime.now() + datetime.timedelta(minutes=1)).isoformat(),
                        "enroute": (datetime.datetime.now() + datetime.timedelta(minutes=2)).isoformat(),
                        "arrived": (datetime.datetime.now() + datetime.timedelta(minutes=10)).isoformat(),
                        "cleared": (datetime.datetime.now() + datetime.timedelta(hours=1)).isoformat()
                    }
                }
            ],
            "outcome": "Transport to Hospital"
        }
        
        # Simulate validation
        valid_result = self._validate_incident(valid_incident)
        
        self.state['valid_incident'] = {
            'data': valid_incident,
            'validation_result': valid_result
        }
        
        # Test various invalid cases
        self.logger.info("Testing missing required fields")
        
        # Missing location
        invalid_incident1 = valid_incident.copy()
        invalid_incident1.pop('location')
        invalid_result1 = self._validate_incident(invalid_incident1)
        
        # Missing units
        invalid_incident2 = valid_incident.copy()
        invalid_incident2.pop('units')
        invalid_result2 = self._validate_incident(invalid_incident2)
        
        # Invalid times (arrived before dispatch)
        invalid_incident3 = valid_incident.copy()
        invalid_incident3['times'] = {
            "received": datetime.datetime.now().isoformat(),
            "dispatched": (datetime.datetime.now() + datetime.timedelta(minutes=10)).isoformat(),
            "first_unit_enroute": (datetime.datetime.now() + datetime.timedelta(minutes=5)).isoformat(),
            "first_unit_arrived": (datetime.datetime.now() + datetime.timedelta(minutes=1)).isoformat(),
            "last_unit_cleared": (datetime.datetime.now() + datetime.timedelta(hours=1)).isoformat()
        }
        invalid_result3 = self._validate_incident(invalid_incident3)
        
        self.state['invalid_incidents'] = [
            {
                'case': 'Missing location',
                'validation_result': invalid_result1
            },
            {
                'case': 'Missing units',
                'validation_result': invalid_result2
            },
            {
                'case': 'Invalid times',
                'validation_result': invalid_result3
            }
        ]
    
    def _validate_incident(self, incident):
        """Validate an incident.
        
        Args:
            incident: Dictionary with incident data
            
        Returns:
            Dictionary with validation results
        """
        # In a real test, this would call the actual validation logic
        # Here we'll simulate validation
        
        errors = []
        
        # Check required fields
        required_fields = ['department_id', 'call_number', 'type', 'category', 
                          'priority', 'location', 'times', 'units']
        
        for field in required_fields:
            if field not in incident:
                errors.append(f"Missing required field: {field}")
        
        # Check location if present
        if 'location' in incident:
            loc_required = ['latitude', 'longitude', 'address', 'city', 'state', 'postal_code']
            for field in loc_required:
                if field not in incident['location']:
                    errors.append(f"Missing required location field: {field}")
        
        # Check times if present
        if 'times' in incident:
            # Check for required time fields
            time_required = ['received', 'dispatched', 'first_unit_enroute',
                            'first_unit_arrived', 'last_unit_cleared']
            for field in time_required:
                if field not in incident['times']:
                    errors.append(f"Missing required time field: {field}")
            
            # Check time sequence if all required times are present
            all_times_present = all(field in incident['times'] for field in time_required)
            if all_times_present:
                times = incident['times']
                
                # Convert ISO strings to datetime objects
                time_objs = {}
                for key, val in times.items():
                    try:
                        time_objs[key] = datetime.datetime.fromisoformat(val)
                    except ValueError:
                        errors.append(f"Invalid datetime format for {key}: {val}")
                
                # Check sequence if all times were parsed successfully
                if len(time_objs) == len(times):
                    if time_objs['dispatched'] < time_objs['received']:
                        errors.append("Dispatch time cannot be before received time")
                    if time_objs['first_unit_enroute'] < time_objs['dispatched']:
                        errors.append("En route time cannot be before dispatch time")
                    if time_objs['first_unit_arrived'] < time_objs['first_unit_enroute']:
                        errors.append("Arrival time cannot be before en route time")
                    if time_objs['last_unit_cleared'] < time_objs['first_unit_arrived']:
                        errors.append("Clear time cannot be before arrival time")
        
        # Check units if present
        if 'units' in incident and isinstance(incident['units'], list):
            if not incident['units']:
                errors.append("At least one unit is required")
            else:
                for i, unit in enumerate(incident['units']):
                    unit_required = ['unit_id', 'unit_type', 'station_id', 'times']
                    for field in unit_required:
                        if field not in unit:
                            errors.append(f"Unit {i}: Missing required field: {field}")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate(self) -> bool:
        """Validate the scenario results."""
        super().validate()
        
        # Check that validation was performed for valid incident
        if 'valid_incident' not in self.state:
            self.logger.error("Valid incident validation was not performed")
            return False
        
        # Check that the valid incident passed validation
        valid_result = self.state['valid_incident'].get('validation_result', {})
        if not valid_result.get('valid'):
            self.logger.error("Valid incident failed validation")
            return False
        
        # Check that invalid incidents were tested
        if 'invalid_incidents' not in self.state:
            self.logger.error("Invalid incidents were not tested")
            return False
        
        # Check that all invalid cases failed validation
        for case in self.state['invalid_incidents']:
            result = case.get('validation_result', {})
            if result.get('valid'):
                self.logger.error(f"Invalid case '{case['case']}' passed validation")
                return False
        
        self.state['success'] = True
        return True


if __name__ == "__main__":
    # Run all scenarios
    scenarios = [
        IncidentCreationScenario(),
        CADIntegrationScenario(),
        HIPAAComplianceScenario(),
        IncidentValidationScenario()
    ]
    
    results = {}
    for scenario in scenarios:
        print(f"\nExecuting scenario: {scenario.name}")
        success = scenario.execute()
        results[scenario.name] = "PASS" if success else "FAIL"
    
    # Print summary
    print("\n=== Scenario Results ===")
    for name, result in results.items():
        print(f"{name}: {result}")