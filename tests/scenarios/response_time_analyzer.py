"""
Test scenarios for Response Time Analyzer feature.

These scenarios test the functionality of the Response Time Analyzer,
including data uploading, processing, visualizations, and analytics.
"""

import os
import sys
import json
import datetime
import random
import tempfile
import csv
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from scenarios.scenario_base import TestScenario


class BaseResponseTimeScenario(TestScenario):
    """Base class for response time analyzer test scenarios."""
    
    feature = "Response Time Analyzer"
    
    def setup(self):
        """Set up the response time analyzer scenario."""
        super().setup()
        
        # Make sure we have incidents to work with
        if not self.dept_incidents:
            self.logger.warning("No incidents available for testing")
            return
        
        # Create a CSV file with incident data
        self.csv_file = self._create_test_csv()
        
        # Initialize state for tracking scenario data
        self.state.update({
            "data_uploaded": False,
            "data_processed": False,
            "visualizations_generated": False,
            "filters_applied": False,
            "exports_created": False,
            "data_file": self.csv_file
        })
    
    def _create_test_csv(self) -> str:
        """Create a CSV file with test incident data.
        
        Returns:
            Path to the created CSV file
        """
        # Create a temporary file
        fd, filepath = tempfile.mkstemp(suffix='.csv')
        os.close(fd)
        
        # Write incident data to the CSV file
        with open(filepath, 'w', newline='') as csvfile:
            fieldnames = [
                'IncidentID', 'Type', 'Priority', 'Address', 'City', 'State', 'Postal',
                'Latitude', 'Longitude', 'ReceivedTime', 'DispatchTime', 'EnRouteTime',
                'ArrivalTime', 'ClearTime', 'UnitID', 'UnitType', 'StationID'
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            # Write data for each incident
            for incident in self.dept_incidents:
                for unit in incident.get('units', []):
                    # Parse times
                    received = incident['times']['received']
                    dispatched = incident['times']['dispatched']
                    enroute = unit['times']['enroute']
                    arrived = unit['times']['arrived']
                    cleared = unit['times']['cleared']
                    
                    # Write row for this unit's response
                    writer.writerow({
                        'IncidentID': incident['id'],
                        'Type': incident['type'],
                        'Priority': incident['priority'],
                        'Address': incident['location']['address'],
                        'City': incident['location']['city'],
                        'State': incident['location']['state'],
                        'Postal': incident['location']['postal_code'],
                        'Latitude': incident['location']['latitude'],
                        'Longitude': incident['location']['longitude'],
                        'ReceivedTime': received,
                        'DispatchTime': dispatched,
                        'EnRouteTime': enroute,
                        'ArrivalTime': arrived,
                        'ClearTime': cleared,
                        'UnitID': unit['unit_id'],
                        'UnitType': unit['unit_type'],
                        'StationID': unit['station_id']
                    })
        
        self.logger.info(f"Created test CSV file at {filepath}")
        return filepath
    
    def teardown(self):
        """Clean up after the scenario."""
        super().teardown()
        
        # Delete the temporary CSV file
        if hasattr(self, 'csv_file') and os.path.exists(self.csv_file):
            os.unlink(self.csv_file)
            self.logger.info(f"Deleted test CSV file: {self.csv_file}")


class ResponseTimeDataUploadScenario(BaseResponseTimeScenario):
    """Test scenario for uploading data to the Response Time Analyzer."""
    
    name = "Response Time Data Upload"
    
    def run(self):
        """Run the scenario."""
        super().run()
        
        # Simulate uploading the CSV file
        self.logger.info(f"Uploading CSV file: {self.csv_file}")
        
        # In a real test, this would use a test client to actually upload the file
        # Here we'll just simulate it for the example
        with open(self.csv_file, 'r') as f:
            data = list(csv.DictReader(f))
            
            # Check that we have data
            if not data:
                self.logger.error("No data in the CSV file")
                self.state['data_uploaded'] = False
                return
            
            # Process the data
            self.state.update({
                'data_uploaded': True,
                'upload_time': datetime.datetime.now().isoformat(),
                'record_count': len(data),
                'data_preview': data[:5] if len(data) > 5 else data
            })
            
            self.logger.info(f"Uploaded {len(data)} records")
    
    def validate(self) -> bool:
        """Validate the scenario results."""
        super().validate()
        
        # Check that data was uploaded successfully
        if not self.state.get('data_uploaded'):
            self.logger.error("Data was not uploaded successfully")
            return False
        
        # Check that we have a reasonable number of records
        if self.state.get('record_count', 0) < 10:
            self.logger.warning("Very few records were uploaded")
        
        # Additional validation could check data quality, field mappings, etc.
        
        self.state['success'] = True
        return True


class ResponseTimeVisualizationScenario(BaseResponseTimeScenario):
    """Test scenario for Response Time Analyzer visualizations."""
    
    name = "Response Time Visualizations"
    
    def run(self):
        """Run the scenario."""
        super().run()
        
        # First upload data
        with open(self.csv_file, 'r') as f:
            data = list(csv.DictReader(f))
            self.state['data_uploaded'] = True
            self.state['record_count'] = len(data)
        
        # Simulate generating visualizations
        self.logger.info("Generating visualizations")
        
        # Create simulated visualization data
        visualizations = {
            'incident_map': {
                'type': 'map',
                'data_points': len(data),
                'center': [
                    sum(float(d['Latitude']) for d in data if d['Latitude']) / len(data),
                    sum(float(d['Longitude']) for d in data if d['Longitude']) / len(data)
                ],
                'zoom': 12
            },
            'time_chart': {
                'type': 'line_chart',
                'metrics': ['dispatch_time', 'turnout_time', 'travel_time', 'total_time'],
                'data_points': len(data)
            },
            'unit_activity': {
                'type': 'gantt_chart',
                'units': list(set(d['UnitID'] for d in data)),
                'time_windows': len(data)
            },
            'location_charts': {
                'type': 'heatmap',
                'data_points': len(data),
                'grid_size': 50
            }
        }
        
        self.state.update({
            'visualizations_generated': True,
            'visualizations': visualizations,
            'generation_time': datetime.datetime.now().isoformat()
        })
        
        # Simulate applying filters
        self.logger.info("Applying filters to visualizations")
        
        filters = {
            'time_period': {
                'start': '2023-01-01T00:00:00',
                'end': '2023-12-31T23:59:59'
            },
            'incident_types': ['Medical Emergency', 'Fire', 'Rescue'],
            'priorities': [1, 2, 3],
            'units': list(set(d['UnitID'] for d in data))[:3]  # First 3 units
        }
        
        self.state.update({
            'filters_applied': True,
            'filters': filters,
            'filtered_record_count': int(len(data) * 0.7)  # Simulate that 70% match filters
        })
    
    def validate(self) -> bool:
        """Validate the scenario results."""
        super().validate()
        
        # Check that data was uploaded successfully
        if not self.state.get('data_uploaded'):
            self.logger.error("Data was not uploaded successfully")
            return False
        
        # Check that visualizations were generated
        if not self.state.get('visualizations_generated'):
            self.logger.error("Visualizations were not generated")
            return False
        
        # Check that filters were applied
        if not self.state.get('filters_applied'):
            self.logger.error("Filters were not applied")
            return False
        
        # Check that we have the expected visualizations
        visualizations = self.state.get('visualizations', {})
        expected_types = ['incident_map', 'time_chart', 'unit_activity', 'location_charts']
        for viz_type in expected_types:
            if viz_type not in visualizations:
                self.logger.error(f"Missing visualization: {viz_type}")
                return False
        
        self.state['success'] = True
        return True


class ResponseTimeAnalyticsScenario(BaseResponseTimeScenario):
    """Test scenario for Response Time Analyzer analytics."""
    
    name = "Response Time Analytics"
    
    def run(self):
        """Run the scenario."""
        super().run()
        
        # First upload data
        with open(self.csv_file, 'r') as f:
            data = list(csv.DictReader(f))
            self.state['data_uploaded'] = True
            self.state['record_count'] = len(data)
        
        # Simulate calculating analytics
        self.logger.info("Calculating response time analytics")
        
        # Calculate simulated analytics
        analytics = {
            'average_times': {
                'dispatch_time': round(random.uniform(0.5, 2.0), 2),  # minutes
                'turnout_time': round(random.uniform(1.0, 3.0), 2),   # minutes
                'travel_time': round(random.uniform(4.0, 8.0), 2),    # minutes
                'total_time': round(random.uniform(6.0, 12.0), 2)     # minutes
            },
            'percentiles': {
                '90th_percentile': {
                    'dispatch_time': round(random.uniform(1.0, 3.0), 2),  # minutes
                    'turnout_time': round(random.uniform(2.0, 5.0), 2),   # minutes
                    'travel_time': round(random.uniform(8.0, 15.0), 2),   # minutes
                    'total_time': round(random.uniform(10.0, 20.0), 2)    # minutes
                }
            },
            'by_incident_type': {
                'Medical Emergency': {
                    'count': int(len(data) * 0.6),
                    'average_total_time': round(random.uniform(5.0, 10.0), 2)
                },
                'Fire': {
                    'count': int(len(data) * 0.3),
                    'average_total_time': round(random.uniform(7.0, 12.0), 2)
                },
                'Rescue': {
                    'count': int(len(data) * 0.1),
                    'average_total_time': round(random.uniform(8.0, 15.0), 2)
                }
            },
            'by_priority': {
                '1': {
                    'count': int(len(data) * 0.2),
                    'average_total_time': round(random.uniform(5.0, 8.0), 2)
                },
                '2': {
                    'count': int(len(data) * 0.5),
                    'average_total_time': round(random.uniform(7.0, 12.0), 2)
                },
                '3': {
                    'count': int(len(data) * 0.3),
                    'average_total_time': round(random.uniform(10.0, 15.0), 2)
                }
            },
            'by_unit_type': {
                'Engine': {
                    'count': int(len(data) * 0.4),
                    'average_total_time': round(random.uniform(6.0, 10.0), 2)
                },
                'Ambulance/Medic': {
                    'count': int(len(data) * 0.5),
                    'average_total_time': round(random.uniform(5.0, 9.0), 2)
                },
                'Battalion Chief': {
                    'count': int(len(data) * 0.1),
                    'average_total_time': round(random.uniform(8.0, 12.0), 2)
                }
            }
        }
        
        self.state.update({
            'analytics_calculated': True,
            'analytics': analytics,
            'calculation_time': datetime.datetime.now().isoformat()
        })
        
        # Simulate exporting results
        export_formats = ['csv', 'json', 'xlsx']
        exports = {}
        
        for format in export_formats:
            # In a real test, this would create actual files
            exports[format] = f"response_time_analytics.{format}"
        
        self.state.update({
            'exports_created': True,
            'export_formats': export_formats,
            'exports': exports
        })
    
    def validate(self) -> bool:
        """Validate the scenario results."""
        super().validate()
        
        # Check that data was uploaded successfully
        if not self.state.get('data_uploaded'):
            self.logger.error("Data was not uploaded successfully")
            return False
        
        # Check that analytics were calculated
        if not self.state.get('analytics_calculated'):
            self.logger.error("Analytics were not calculated")
            return False
        
        # Check that exports were created
        if not self.state.get('exports_created'):
            self.logger.error("Exports were not created")
            return False
        
        # Check that we have the expected analytics
        analytics = self.state.get('analytics', {})
        expected_sections = ['average_times', 'percentiles', 'by_incident_type', 
                            'by_priority', 'by_unit_type']
        for section in expected_sections:
            if section not in analytics:
                self.logger.error(f"Missing analytics section: {section}")
                return False
        
        self.state['success'] = True
        return True


if __name__ == "__main__":
    # Run all scenarios
    scenarios = [
        ResponseTimeDataUploadScenario(),
        ResponseTimeVisualizationScenario(),
        ResponseTimeAnalyticsScenario()
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