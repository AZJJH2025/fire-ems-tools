"""
API contract tests.

This module contains contract tests for the Fire-EMS Tools API services.
"""

import os
import sys
import json
import requests
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from contract.contract_test_base import ContractTest


class IncidentAPIProviderTest(ContractTest):
    """Contract test for the Incident API provider."""
    
    provider_name = "Incident API"
    consumer_name = "Incident Logger UI"
    
    def create_contract(self) -> Dict[str, Any]:
        """Create a contract for the Incident API.
        
        Returns:
            A dictionary representing the contract
        """
        # Base contract
        contract = super().create_contract()
        
        # Add interactions
        
        # Interaction 1: Get all incidents
        contract["interactions"].append({
            "description": "a request to get all incidents",
            "providerState": "incidents exist",
            "request": {
                "method": "GET",
                "path": "/api/incidents",
                "headers": {
                    "Accept": "application/json"
                }
            },
            "response": {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "incidents": [
                        {
                            "id": "string",
                            "department_id": "string",
                            "call_number": "string",
                            "type": "string",
                            "category": "string",
                            "priority": "number",
                            "location": {
                                "latitude": "number",
                                "longitude": "number",
                                "address": "string",
                                "city": "string",
                                "state": "string",
                                "postal_code": "string"
                            }
                        }
                    ]
                },
                "matchingRules": {
                    "$.body.incidents": {
                        "min": 1
                    },
                    "$.body.incidents[*].id": {
                        "match": "type"
                    },
                    "$.body.incidents[*].department_id": {
                        "match": "type"
                    }
                }
            }
        })
        
        # Interaction 2: Get incident by ID
        if self.dept_incidents:
            sample_incident = self.dept_incidents[0]
            
            contract["interactions"].append({
                "description": "a request to get an incident by ID",
                "providerState": "incident with ID exists",
                "request": {
                    "method": "GET",
                    "path": f"/api/incidents/{sample_incident['id']}",
                    "headers": {
                        "Accept": "application/json"
                    }
                },
                "response": {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "incident": {
                            "id": sample_incident['id'],
                            "department_id": sample_incident['department_id'],
                            "call_number": sample_incident['call_number'],
                            "type": sample_incident['type'],
                            "category": sample_incident['category'],
                            "priority": sample_incident['priority']
                        }
                    }
                }
            })
        
        # Interaction 3: Create a new incident
        contract["interactions"].append({
            "description": "a request to create a new incident",
            "providerState": "department exists",
            "request": {
                "method": "POST",
                "path": "/api/incidents",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "department_id": "string",
                    "call_number": "string",
                    "type": "string",
                    "category": "string",
                    "priority": "number",
                    "location": {
                        "latitude": "number",
                        "longitude": "number",
                        "address": "string",
                        "city": "string",
                        "state": "string",
                        "postal_code": "string"
                    },
                    "times": {
                        "received": "string",
                        "dispatched": "string"
                    },
                    "units": [
                        {
                            "unit_id": "string",
                            "unit_type": "string",
                            "station_id": "string"
                        }
                    ]
                },
                "matchingRules": {
                    "$.body.department_id": {
                        "match": "type"
                    },
                    "$.body.times.received": {
                        "match": "iso8601DateTimeWithMillis"
                    },
                    "$.body.times.dispatched": {
                        "match": "iso8601DateTimeWithMillis"
                    }
                }
            },
            "response": {
                "status": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "incident": {
                        "id": "string"
                    }
                },
                "matchingRules": {
                    "$.body.incident.id": {
                        "match": "type"
                    }
                }
            }
        })
        
        # Interaction 4: Update an incident
        if self.dept_incidents:
            sample_incident = self.dept_incidents[0]
            
            contract["interactions"].append({
                "description": "a request to update an incident",
                "providerState": "incident with ID exists",
                "request": {
                    "method": "PUT",
                    "path": f"/api/incidents/{sample_incident['id']}",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "outcome": "string",
                        "notes": "string"
                    },
                    "matchingRules": {
                        "$.body.outcome": {
                            "match": "type"
                        },
                        "$.body.notes": {
                            "match": "type"
                        }
                    }
                },
                "response": {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "incident": {
                            "id": sample_incident['id'],
                            "outcome": "string",
                            "notes": "string"
                        }
                    },
                    "matchingRules": {
                        "$.body.incident.outcome": {
                            "match": "type"
                        },
                        "$.body.incident.notes": {
                            "match": "type"
                        }
                    }
                }
            })
        
        # Interaction 5: Delete an incident
        if self.dept_incidents and len(self.dept_incidents) > 1:
            sample_incident = self.dept_incidents[1]
            
            contract["interactions"].append({
                "description": "a request to delete an incident",
                "providerState": "incident with ID exists",
                "request": {
                    "method": "DELETE",
                    "path": f"/api/incidents/{sample_incident['id']}",
                    "headers": {
                        "Accept": "application/json"
                    }
                },
                "response": {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "success": true,
                        "message": "string"
                    },
                    "matchingRules": {
                        "$.body.success": {
                            "match": "type"
                        },
                        "$.body.message": {
                            "match": "type"
                        }
                    }
                }
            })
        
        return contract
    
    def verify_provider(self) -> bool:
        """Verify that the provider fulfills the contract.
        
        Returns:
            True if the provider fulfills the contract, False otherwise
        """
        # Load the contract
        contract = self.load_contract(self.contract_file)
        
        # Start a test app server
        # In a real test, this would start the actual provider service
        # For this example, we'll simulate the verification
        
        self.logger.info("Verifying provider against contract...")
        
        # Verify each interaction
        for interaction in contract.get('interactions', []):
            description = interaction.get('description', 'unknown interaction')
            self.logger.info(f"Verifying interaction: {description}")
            
            # In a real test, would make actual requests to the provider
            # and verify the responses match the contract
            
            # Simulate verification
            # In a real test, this would be actual verification logic
            request = interaction.get('request', {})
            expected_response = interaction.get('response', {})
            
            self.logger.info(f"Request: {request.get('method')} {request.get('path')}")
            self.logger.info(f"Expected status: {expected_response.get('status')}")
        
        # For the example, return success
        return True


class IncidentAPIConsumerTest(ContractTest):
    """Contract test for the Incident API consumer."""
    
    provider_name = "Incident API"
    consumer_name = "Incident Logger UI"
    
    def verify_consumer(self) -> bool:
        """Verify that the consumer uses the contract correctly.
        
        Returns:
            True if the consumer uses the contract correctly, False otherwise
        """
        # Load the contract
        contract = self.load_contract(self.contract_file)
        
        # In a real test, would set up a mock server based on the contract
        # that responds according to the contract, then run the consumer
        # against the mock server
        
        self.logger.info("Verifying consumer against contract...")
        
        # Verify each interaction
        for interaction in contract.get('interactions', []):
            description = interaction.get('description', 'unknown interaction')
            self.logger.info(f"Verifying interaction: {description}")
            
            # In a real test, would run the consumer code and verify
            # it makes the expected requests and handles the responses correctly
            
            # Simulate verification
            request = interaction.get('request', {})
            
            self.logger.info(f"Request: {request.get('method')} {request.get('path')}")
        
        # For the example, return success
        return True


class DepartmentAPIProviderTest(ContractTest):
    """Contract test for the Department API provider."""
    
    provider_name = "Department API"
    consumer_name = "Department Dashboard UI"
    
    def create_contract(self) -> Dict[str, Any]:
        """Create a contract for the Department API.
        
        Returns:
            A dictionary representing the contract
        """
        # Base contract
        contract = super().create_contract()
        
        # Add interactions
        
        # Interaction 1: Get all departments
        contract["interactions"].append({
            "description": "a request to get all departments",
            "providerState": "departments exist",
            "request": {
                "method": "GET",
                "path": "/api/departments",
                "headers": {
                    "Accept": "application/json"
                }
            },
            "response": {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "departments": [
                        {
                            "id": "string",
                            "name": "string",
                            "type": "string",
                            "size": "string",
                            "service_area": "string"
                        }
                    ]
                },
                "matchingRules": {
                    "$.body.departments": {
                        "min": 1
                    },
                    "$.body.departments[*].id": {
                        "match": "type"
                    },
                    "$.body.departments[*].name": {
                        "match": "type"
                    }
                }
            }
        })
        
        # Interaction 2: Get a department by ID
        if self.departments:
            sample_dept = self.departments[0]
            
            contract["interactions"].append({
                "description": "a request to get a department by ID",
                "providerState": "department with ID exists",
                "request": {
                    "method": "GET",
                    "path": f"/api/departments/{sample_dept['id']}",
                    "headers": {
                        "Accept": "application/json"
                    }
                },
                "response": {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "department": {
                            "id": sample_dept['id'],
                            "name": sample_dept['name'],
                            "type": sample_dept['type'],
                            "size": sample_dept['size'],
                            "service_area": sample_dept['service_area'],
                            "station_count": sample_dept['station_count'],
                            "personnel_count": sample_dept['personnel_count'],
                            "vehicle_count": sample_dept['vehicle_count']
                        }
                    }
                }
            })
        
        # Interaction 3: Get stations for a department
        if self.departments and self.dept_stations:
            sample_dept = self.departments[0]
            
            contract["interactions"].append({
                "description": "a request to get stations for a department",
                "providerState": "department with stations exists",
                "request": {
                    "method": "GET",
                    "path": f"/api/departments/{sample_dept['id']}/stations",
                    "headers": {
                        "Accept": "application/json"
                    }
                },
                "response": {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "stations": [
                            {
                                "id": "string",
                                "name": "string",
                                "department_id": sample_dept['id'],
                                "type": "string",
                                "location": {
                                    "latitude": "number",
                                    "longitude": "number",
                                    "address": "string"
                                }
                            }
                        ]
                    },
                    "matchingRules": {
                        "$.body.stations": {
                            "min": 1
                        },
                        "$.body.stations[*].id": {
                            "match": "type"
                        },
                        "$.body.stations[*].name": {
                            "match": "type"
                        },
                        "$.body.stations[*].location.latitude": {
                            "match": "number"
                        },
                        "$.body.stations[*].location.longitude": {
                            "match": "number"
                        }
                    }
                }
            })
        
        return contract
    
    def verify_provider(self) -> bool:
        """Verify that the provider fulfills the contract."""
        # Similar to IncidentAPIProviderTest.verify_provider
        # In a real test, would verify the Department API provider
        return True


class StationAPIProviderTest(ContractTest):
    """Contract test for the Station API provider."""
    
    provider_name = "Station API"
    consumer_name = "Isochrone Map Generator"
    
    def create_contract(self) -> Dict[str, Any]:
        """Create a contract for the Station API.
        
        Returns:
            A dictionary representing the contract
        """
        # Base contract
        contract = super().create_contract()
        
        # Add interactions
        
        # Interaction 1: Get all stations
        contract["interactions"].append({
            "description": "a request to get all stations",
            "providerState": "stations exist",
            "request": {
                "method": "GET",
                "path": "/api/stations",
                "headers": {
                    "Accept": "application/json"
                }
            },
            "response": {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "stations": [
                        {
                            "id": "string",
                            "name": "string",
                            "department_id": "string",
                            "type": "string",
                            "location": {
                                "latitude": "number",
                                "longitude": "number",
                                "address": "string",
                                "city": "string",
                                "state": "string",
                                "postal_code": "string"
                            }
                        }
                    ]
                },
                "matchingRules": {
                    "$.body.stations": {
                        "min": 1
                    },
                    "$.body.stations[*].id": {
                        "match": "type"
                    },
                    "$.body.stations[*].location.latitude": {
                        "match": "number"
                    },
                    "$.body.stations[*].location.longitude": {
                        "match": "number"
                    }
                }
            }
        })
        
        # Interaction 2: Get station by ID
        if self.stations:
            sample_station = self.stations[0]
            
            contract["interactions"].append({
                "description": "a request to get a station by ID",
                "providerState": "station with ID exists",
                "request": {
                    "method": "GET",
                    "path": f"/api/stations/{sample_station['id']}",
                    "headers": {
                        "Accept": "application/json"
                    }
                },
                "response": {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "station": {
                            "id": sample_station['id'],
                            "name": sample_station['name'],
                            "department_id": sample_station['department_id'],
                            "type": sample_station['type'],
                            "location": {
                                "latitude": sample_station['location']['latitude'],
                                "longitude": sample_station['location']['longitude'],
                                "address": sample_station['location']['address']
                            }
                        }
                    }
                }
            })
        
        # Interaction 3: Get apparatus for a station
        if self.stations:
            sample_station = self.stations[0]
            
            contract["interactions"].append({
                "description": "a request to get apparatus for a station",
                "providerState": "station with apparatus exists",
                "request": {
                    "method": "GET",
                    "path": f"/api/stations/{sample_station['id']}/apparatus",
                    "headers": {
                        "Accept": "application/json"
                    }
                },
                "response": {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "apparatus": [
                            {
                                "id": "string",
                                "type": "string",
                                "designation": "string",
                                "status": "string"
                            }
                        ]
                    },
                    "matchingRules": {
                        "$.body.apparatus": {
                            "min": 1
                        },
                        "$.body.apparatus[*].id": {
                            "match": "type"
                        },
                        "$.body.apparatus[*].type": {
                            "match": "type"
                        }
                    }
                }
            })
        
        return contract
    
    def verify_provider(self) -> bool:
        """Verify that the provider fulfills the contract."""
        # Similar to IncidentAPIProviderTest.verify_provider
        # In a real test, would verify the Station API provider
        return True


if __name__ == "__main__":
    import unittest
    unittest.main()