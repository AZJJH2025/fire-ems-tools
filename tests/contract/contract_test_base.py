"""
Base class for contract tests.

This module provides base classes for creating contract tests to verify
that services integrate correctly.
"""

import os
import sys
import json
import unittest
import tempfile
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from utilities.test_data_manager import data_manager


class ContractTest(unittest.TestCase):
    """Base class for contract tests."""
    
    # The service being tested
    provider_name = "Base Provider"
    
    # The client of the service
    consumer_name = "Base Consumer"
    
    # The fixture to use for this test
    fixture_name = "small_test"
    
    # Logger for the test
    logger = logging.getLogger("ContractTest")
    
    def setUp(self):
        """Set up the contract test."""
        # Configure logging
        self.logger = logging.getLogger(f"ContractTest.{self.provider_name}.{self.consumer_name}")
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
        
        # Allow overriding with environment variable
        self.fixture_name = os.environ.get("TEST_FIXTURE", self.fixture_name)
        
        # Set up test data
        self._setup_test_data()
        
        # Create a contract file
        contract_json = self.create_contract()
        fd, self.contract_file = tempfile.mkstemp(suffix='.json')
        os.close(fd)
        
        with open(self.contract_file, 'w') as f:
            json.dump(contract_json, f, indent=2)
        
        self.logger.info(f"Created contract file at {self.contract_file}")
    
    def tearDown(self):
        """Clean up after the test."""
        # Delete the contract file
        if hasattr(self, 'contract_file') and os.path.exists(self.contract_file):
            os.unlink(self.contract_file)
            self.logger.info(f"Deleted contract file: {self.contract_file}")
        
        # Reset data manager
        data_manager.reset_all()
    
    def _setup_test_data(self):
        """Set up test data."""
        data_manager.setup_for_test([self.fixture_name])
        
        # Get data from the fixture
        fixture = data_manager.get_fixture(self.fixture_name)
        
        # Extract data from fixture
        self.departments = []
        self.stations = []
        self.users = []
        self.incidents = []
        
        for dataset in fixture.datasets:
            if dataset.category == "departments":
                self.departments.extend(dataset.data)
            elif dataset.category == "stations":
                self.stations.extend(dataset.data)
            elif dataset.category == "users":
                self.users.extend(dataset.data)
            elif dataset.category == "incidents":
                self.incidents.extend(dataset.data)
        
        # Get the first department for testing
        self.department = self.departments[0] if self.departments else None
        
        # Get department-specific data
        if self.department:
            dept_id = self.department["id"]
            self.dept_stations = [s for s in self.stations if s["department_id"] == dept_id]
            self.dept_users = [u for u in self.users if u["department_id"] == dept_id]
            self.dept_incidents = [i for i in self.incidents if i["department_id"] == dept_id]
    
    def create_contract(self) -> Dict[str, Any]:
        """Create a contract for this provider-consumer pair.
        
        Returns:
            A dictionary representing the contract
        """
        # Base contract structure
        contract = {
            "provider": {
                "name": self.provider_name
            },
            "consumer": {
                "name": self.consumer_name
            },
            "interactions": [],
            "metadata": {
                "pactSpecification": {
                    "version": "2.0.0"
                }
            }
        }
        
        # This should be overridden by subclasses to add specific interactions
        return contract
    
    def load_contract(self, file_path: str) -> Dict[str, Any]:
        """Load a contract from a file.
        
        Args:
            file_path: Path to the contract file
            
        Returns:
            A dictionary representing the contract
        """
        with open(file_path, 'r') as f:
            return json.load(f)
    
    def verify_provider(self) -> bool:
        """Verify that the provider fulfills the contract.
        
        Returns:
            True if the provider fulfills the contract, False otherwise
        """
        # Load the contract
        contract = self.load_contract(self.contract_file)
        
        # Verify each interaction
        for interaction in contract.get('interactions', []):
            # This should be implemented by provider contract tests
            pass
        
        # Default implementation always passes
        return True
    
    def verify_consumer(self) -> bool:
        """Verify that the consumer uses the contract correctly.
        
        Returns:
            True if the consumer uses the contract correctly, False otherwise
        """
        # Load the contract
        contract = self.load_contract(self.contract_file)
        
        # Verify each interaction
        for interaction in contract.get('interactions', []):
            # This should be implemented by consumer contract tests
            pass
        
        # Default implementation always passes
        return True