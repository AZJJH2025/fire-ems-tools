"""
Base class for test scenarios.

This module provides a base class for creating test scenarios that work with the
test data management system.
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from utilities.test_data_manager import data_manager


class TestScenario:
    """Base class for test scenarios.
    
    A test scenario represents a specific sequence of actions and validations
    for testing a particular feature of the application.
    """
    
    # The name of the scenario
    name = "Base Scenario"
    
    # The feature being tested
    feature = "Base Feature"
    
    # The fixture to use for this scenario
    fixture_name = "small_test"
    
    # Default logger
    logger = logging.getLogger("TestScenario")
    
    def __init__(self, fixture_name: Optional[str] = None):
        """Initialize the test scenario.
        
        Args:
            fixture_name: Optional name of the fixture to use (overrides class fixture_name)
        """
        # Allow overriding the fixture name
        self.fixture_name = fixture_name or self.fixture_name
        
        # Allow overriding with environment variable
        self.fixture_name = os.environ.get("TEST_FIXTURE", self.fixture_name)
        
        # Set up logging
        self.logger = logging.getLogger(f"TestScenario.{self.name}")
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
        
        # Initialize state for the scenario
        self.state = {}
        
        # Set up test data
        self._setup_test_data()
    
    def _setup_test_data(self):
        """Set up test data for the scenario."""
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
    
    def setup(self):
        """Set up the scenario. Override in subclasses."""
        self.logger.info(f"Setting up scenario: {self.name}")
    
    def run(self):
        """Run the scenario. Override in subclasses."""
        self.logger.info(f"Running scenario: {self.name}")
    
    def validate(self) -> bool:
        """Validate the scenario results. Override in subclasses.
        
        Returns:
            True if validation passed, False otherwise
        """
        self.logger.info(f"Validating scenario: {self.name}")
        return True
    
    def teardown(self):
        """Clean up after the scenario. Override in subclasses."""
        self.logger.info(f"Tearing down scenario: {self.name}")
        data_manager.reset_all()
    
    def execute(self) -> bool:
        """Execute the full scenario workflow.
        
        Returns:
            True if the scenario was successful, False otherwise
        """
        try:
            self.setup()
            self.run()
            result = self.validate()
            
            if result:
                self.logger.info(f"Scenario {self.name} PASSED")
            else:
                self.logger.error(f"Scenario {self.name} FAILED")
            
            return result
        except Exception as e:
            self.logger.exception(f"Error executing scenario {self.name}: {e}")
            return False
        finally:
            self.teardown()
    
    def get_scenario_metadata(self) -> Dict[str, Any]:
        """Get metadata about this scenario.
        
        Returns:
            A dictionary with scenario metadata
        """
        return {
            "name": self.name,
            "feature": self.feature,
            "fixture": self.fixture_name,
            "description": self.__doc__ or "No description provided"
        }
    
    def save_results(self, filepath: str):
        """Save the scenario results to a file.
        
        Args:
            filepath: Path to save the results to
        """
        results = {
            "scenario": self.get_scenario_metadata(),
            "state": self.state,
            "success": self.state.get("success", False)
        }
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w') as f:
            json.dump(results, f, indent=2)
        
        self.logger.info(f"Saved results to {filepath}")
    
    @classmethod
    def load_results(cls, filepath: str) -> Dict[str, Any]:
        """Load scenario results from a file.
        
        Args:
            filepath: Path to load the results from
            
        Returns:
            A dictionary with the scenario results
        """
        with open(filepath, 'r') as f:
            return json.load(f)