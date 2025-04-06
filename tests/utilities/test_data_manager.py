"""
Test Data Manager

A comprehensive system for managing test data across different test types.
Provides facilities for:
- Loading and saving test datasets
- Generating test data with specific characteristics
- Creating test fixtures for different test scenarios
- Data reset between test runs
- Verification of data integrity
"""

import os
import json
import shutil
import sqlite3
import uuid
import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Union, Tuple

# Base directory for test data
TEST_DATA_DIR = Path(__file__).parent.parent / "test_data"
FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"


class TestDataSet:
    """Represents a named test dataset with metadata."""
    
    def __init__(self, name: str, category: str, data: Any, metadata: Optional[Dict] = None):
        """
        Initialize a test dataset.
        
        Args:
            name: Unique name for the dataset
            category: Category of data (incidents, departments, stations, users)
            data: The actual data content
            metadata: Optional metadata about the dataset
        """
        self.name = name
        self.category = category
        self.data = data
        self.metadata = metadata or {
            "created": datetime.datetime.now().isoformat(),
            "id": str(uuid.uuid4()),
            "version": "1.0"
        }
    
    def save(self) -> Path:
        """Save the dataset to the appropriate directory."""
        category_dir = TEST_DATA_DIR / self.category
        category_dir.mkdir(exist_ok=True, parents=True)
        
        file_path = category_dir / f"{self.name}.json"
        with open(file_path, 'w') as f:
            json.dump({
                "metadata": self.metadata,
                "data": self.data
            }, f, indent=2)
        
        return file_path
    
    @classmethod
    def load(cls, name: str, category: str) -> 'TestDataSet':
        """Load a dataset from the appropriate directory."""
        file_path = TEST_DATA_DIR / category / f"{name}.json"
        
        if not file_path.exists():
            raise FileNotFoundError(f"Test dataset {name} not found in {category}")
        
        with open(file_path, 'r') as f:
            content = json.load(f)
            
        return cls(
            name=name,
            category=category,
            data=content["data"],
            metadata=content["metadata"]
        )


class TestFixture:
    """Represents a test fixture that can be used in tests."""
    
    def __init__(self, name: str, datasets: List[TestDataSet], setup_func=None, teardown_func=None):
        """
        Initialize a test fixture.
        
        Args:
            name: Unique name for the fixture
            datasets: List of datasets included in this fixture
            setup_func: Optional function to run during setup
            teardown_func: Optional function to run during teardown
        """
        self.name = name
        self.datasets = datasets
        self.setup_func = setup_func
        self.teardown_func = teardown_func
        self.metadata = {
            "created": datetime.datetime.now().isoformat(),
            "id": str(uuid.uuid4()),
            "version": "1.0",
            "dataset_ids": [ds.metadata["id"] for ds in datasets]
        }
    
    def save(self) -> Path:
        """Save the fixture to the fixtures directory."""
        FIXTURES_DIR.mkdir(exist_ok=True, parents=True)
        
        # Save all component datasets first
        for dataset in self.datasets:
            dataset.save()
        
        # Save the fixture metadata
        file_path = FIXTURES_DIR / f"{self.name}.json"
        with open(file_path, 'w') as f:
            json.dump({
                "name": self.name,
                "metadata": self.metadata,
                "datasets": [
                    {"name": ds.name, "category": ds.category}
                    for ds in self.datasets
                ]
            }, f, indent=2)
        
        return file_path
    
    @classmethod
    def load(cls, name: str) -> 'TestFixture':
        """Load a fixture from the fixtures directory."""
        file_path = FIXTURES_DIR / f"{name}.json"
        
        if not file_path.exists():
            raise FileNotFoundError(f"Test fixture {name} not found")
        
        with open(file_path, 'r') as f:
            content = json.load(f)
        
        # Load all component datasets
        datasets = [
            TestDataSet.load(ds["name"], ds["category"])
            for ds in content["datasets"]
        ]
        
        fixture = cls(
            name=content["name"],
            datasets=datasets
        )
        fixture.metadata = content["metadata"]
        
        return fixture
    
    def setup(self):
        """Set up the fixture by running the setup function if provided."""
        if self.setup_func:
            return self.setup_func(self)
    
    def teardown(self):
        """Tear down the fixture by running the teardown function if provided."""
        if self.teardown_func:
            return self.teardown_func(self)


class TestDatabase:
    """Manages a test SQLite database for tests."""
    
    def __init__(self, db_path: Union[str, Path] = None):
        """
        Initialize a test database.
        
        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = Path(db_path) if db_path else TEST_DATA_DIR / "test.db"
        self.conn = None
        self.fixtures_applied = []
    
    def connect(self):
        """Connect to the database."""
        self.db_path.parent.mkdir(exist_ok=True, parents=True)
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        return self.conn
    
    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
            self.conn = None
    
    def reset(self):
        """Reset the database to a clean state."""
        self.close()
        if self.db_path.exists():
            self.db_path.unlink()
        self.connect()
        self.fixtures_applied = []
    
    def apply_fixture(self, fixture: TestFixture):
        """Apply a fixture to the database."""
        if not self.conn:
            self.connect()
        
        fixture.setup()
        self.fixtures_applied.append(fixture.name)
    
    def execute_script(self, script: str):
        """Execute a SQL script on the database."""
        if not self.conn:
            self.connect()
        
        self.conn.executescript(script)
        self.conn.commit()
    
    def execute(self, query: str, params=None):
        """Execute a query on the database."""
        if not self.conn:
            self.connect()
        
        cursor = self.conn.cursor()
        cursor.execute(query, params or [])
        self.conn.commit()
        return cursor


class TestDataManager:
    """Central manager for all test data operations."""
    
    def __init__(self):
        """Initialize the test data manager."""
        self.datasets = {}  # Cache of loaded datasets
        self.fixtures = {}  # Cache of loaded fixtures
        self.database = TestDatabase()
    
    def get_dataset(self, name: str, category: str) -> TestDataSet:
        """Get a dataset by name and category."""
        cache_key = f"{category}/{name}"
        if cache_key not in self.datasets:
            self.datasets[cache_key] = TestDataSet.load(name, category)
        return self.datasets[cache_key]
    
    def get_fixture(self, name: str) -> TestFixture:
        """Get a fixture by name."""
        if name not in self.fixtures:
            self.fixtures[name] = TestFixture.load(name)
        return self.fixtures[name]
    
    def create_dataset(self, name: str, category: str, data: Any, metadata: Optional[Dict] = None) -> TestDataSet:
        """Create a new dataset."""
        dataset = TestDataSet(name, category, data, metadata)
        dataset.save()
        
        cache_key = f"{category}/{name}"
        self.datasets[cache_key] = dataset
        
        return dataset
    
    def create_fixture(self, name: str, datasets: List[TestDataSet], 
                      setup_func=None, teardown_func=None) -> TestFixture:
        """Create a new fixture."""
        fixture = TestFixture(name, datasets, setup_func, teardown_func)
        fixture.save()
        
        self.fixtures[name] = fixture
        
        return fixture
    
    def reset_all(self):
        """Reset all test data to initial state."""
        self.database.reset()
        self.datasets = {}
        self.fixtures = {}
    
    def setup_for_test(self, fixture_names: List[str]):
        """Set up the test environment with specified fixtures."""
        self.database.reset()
        
        for name in fixture_names:
            fixture = self.get_fixture(name)
            self.database.apply_fixture(fixture)
    
    @property
    def db(self) -> TestDatabase:
        """Get the test database."""
        return self.database


# Singleton instance
data_manager = TestDataManager()