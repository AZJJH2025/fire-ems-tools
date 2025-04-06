#!/usr/bin/env python3
"""
Test Data Generator

Generates comprehensive test data for the Fire-EMS Tools application.
"""

import os
import argparse
import json
import random
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

# Import data generators
from data_generators.department_generator import generate_departments
from data_generators.station_generator import generate_stations
from data_generators.incident_generator import generate_incidents
from data_generators.user_generator import generate_users
from utilities.test_data_manager import TestDataSet, TestFixture, data_manager

# Base directory for test data
TEST_DATA_DIR = Path(__file__).parent.parent / "test_data"
FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"


def ensure_directories_exist():
    """Ensure that all required directories exist."""
    for directory in [
        TEST_DATA_DIR,
        TEST_DATA_DIR / "departments",
        TEST_DATA_DIR / "stations",
        TEST_DATA_DIR / "incidents",
        TEST_DATA_DIR / "users",
        FIXTURES_DIR
    ]:
        directory.mkdir(exist_ok=True, parents=True)


def generate_department_data(
    count: int = 5,
    seed: Optional[int] = None,
    output_file: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generate department test data.
    
    Args:
        count: Number of departments to generate
        seed: Random seed for reproducible generation
        output_file: Optional filename to save the generated data
        
    Returns:
        A list of department dictionaries
    """
    departments = generate_departments(count, seed=seed)
    
    if output_file:
        output_path = TEST_DATA_DIR / "departments" / output_file
        with open(output_path, 'w') as f:
            json.dump(departments, f, indent=2)
        print(f"Generated {count} departments and saved to {output_path}")
        
        # Create a dataset in the data manager
        dataset_name = output_file.replace('.json', '')
        data_manager.create_dataset(dataset_name, "departments", departments)
    
    return departments


def generate_station_data(
    department_id: str,
    count: int = 10,
    seed: Optional[int] = None,
    output_file: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generate station test data for a department.
    
    Args:
        department_id: Department ID to associate stations with
        count: Number of stations to generate
        seed: Random seed for reproducible generation
        output_file: Optional filename to save the generated data
        
    Returns:
        A list of station dictionaries
    """
    stations = generate_stations(count, department_id=department_id, seed=seed)
    
    if output_file:
        output_path = TEST_DATA_DIR / "stations" / output_file
        with open(output_path, 'w') as f:
            json.dump(stations, f, indent=2)
        print(f"Generated {count} stations and saved to {output_path}")
        
        # Create a dataset in the data manager
        dataset_name = output_file.replace('.json', '')
        data_manager.create_dataset(dataset_name, "stations", stations)
    
    return stations


def generate_user_data(
    department_id: str,
    station_ids: List[str],
    count: int = 50,
    seed: Optional[int] = None,
    output_file: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generate user test data for a department.
    
    Args:
        department_id: Department ID to associate users with
        station_ids: List of station IDs to associate users with
        count: Number of users to generate
        seed: Random seed for reproducible generation
        output_file: Optional filename to save the generated data
        
    Returns:
        A list of user dictionaries
    """
    users = generate_users(count, department_id=department_id, station_ids=station_ids, seed=seed)
    
    if output_file:
        output_path = TEST_DATA_DIR / "users" / output_file
        with open(output_path, 'w') as f:
            json.dump(users, f, indent=2)
        print(f"Generated {count} users and saved to {output_path}")
        
        # Create a dataset in the data manager
        dataset_name = output_file.replace('.json', '')
        data_manager.create_dataset(dataset_name, "users", users)
    
    return users


def generate_incident_data(
    department_id: str,
    count: int = 100,
    seed: Optional[int] = None,
    output_file: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generate incident test data for a department.
    
    Args:
        department_id: Department ID to associate incidents with
        count: Number of incidents to generate
        seed: Random seed for reproducible generation
        output_file: Optional filename to save the generated data
        
    Returns:
        A list of incident dictionaries
    """
    incidents = generate_incidents(count, department_id=department_id, seed=seed)
    
    if output_file:
        output_path = TEST_DATA_DIR / "incidents" / output_file
        with open(output_path, 'w') as f:
            json.dump(incidents, f, indent=2)
        print(f"Generated {count} incidents and saved to {output_path}")
        
        # Create a dataset in the data manager
        dataset_name = output_file.replace('.json', '')
        data_manager.create_dataset(dataset_name, "incidents", incidents)
    
    return incidents


def generate_complete_dataset(
    name: str = "default",
    department_count: int = 3,
    stations_per_department: int = 5,
    users_per_department: int = 20,
    incidents_per_department: int = 100,
    seed: Optional[int] = None
) -> Dict[str, Any]:
    """
    Generate a complete test dataset with departments, stations, users, and incidents.
    
    Args:
        name: Name for the dataset
        department_count: Number of departments to generate
        stations_per_department: Number of stations per department
        users_per_department: Number of users per department
        incidents_per_department: Number of incidents per department
        seed: Random seed for reproducible generation
        
    Returns:
        A dictionary with all generated data
    """
    if seed is not None:
        random.seed(seed)
    
    print(f"Generating complete dataset '{name}'...")
    
    datasets = {}
    fixture_datasets = []
    
    # Generate departments
    departments = generate_department_data(
        count=department_count,
        seed=seed,
        output_file=f"{name}_departments.json"
    )
    
    # Create a dataset for the departments
    dept_dataset = data_manager.create_dataset(
        f"{name}_departments",
        "departments",
        departments
    )
    fixture_datasets.append(dept_dataset)
    datasets["departments"] = departments
    
    # Generate stations, users, and incidents for each department
    for i, department in enumerate(departments):
        department_id = department["id"]
        department_seed = None if seed is None else seed + (i * 1000)
        
        # Generate stations
        stations = generate_station_data(
            department_id=department_id,
            count=stations_per_department,
            seed=department_seed,
            output_file=f"{name}_department_{i+1}_stations.json"
        )
        
        if department_id not in datasets:
            datasets[department_id] = {}
        
        datasets[department_id]["stations"] = stations
        
        # Create a dataset for the stations
        station_dataset = data_manager.create_dataset(
            f"{name}_department_{i+1}_stations",
            "stations",
            stations
        )
        fixture_datasets.append(station_dataset)
        
        # Extract station IDs
        station_ids = [station["id"] for station in stations]
        
        # Generate users
        users = generate_user_data(
            department_id=department_id,
            station_ids=station_ids,
            count=users_per_department,
            seed=department_seed + 1,
            output_file=f"{name}_department_{i+1}_users.json"
        )
        
        datasets[department_id]["users"] = users
        
        # Create a dataset for the users
        user_dataset = data_manager.create_dataset(
            f"{name}_department_{i+1}_users",
            "users",
            users
        )
        fixture_datasets.append(user_dataset)
        
        # Generate incidents
        incidents = generate_incident_data(
            department_id=department_id,
            count=incidents_per_department,
            seed=department_seed + 2,
            output_file=f"{name}_department_{i+1}_incidents.json"
        )
        
        datasets[department_id]["incidents"] = incidents
        
        # Create a dataset for the incidents
        incident_dataset = data_manager.create_dataset(
            f"{name}_department_{i+1}_incidents",
            "incidents",
            incidents
        )
        fixture_datasets.append(incident_dataset)
    
    # Create a fixture that includes all datasets
    fixture = data_manager.create_fixture(
        name=name,
        datasets=fixture_datasets
    )
    
    print(f"Generated complete dataset '{name}' with:")
    print(f"  - {department_count} departments")
    print(f"  - {department_count * stations_per_department} stations")
    print(f"  - {department_count * users_per_department} users")
    print(f"  - {department_count * incidents_per_department} incidents")
    print(f"Fixture saved as {FIXTURES_DIR}/{name}.json")
    
    return datasets


def generate_standard_test_fixtures():
    """Generate a set of standard test fixtures for different test scenarios."""
    # Ensure directories exist
    ensure_directories_exist()
    
    # Generate a small dataset for unit tests
    generate_complete_dataset(
        name="small_test",
        department_count=1,
        stations_per_department=3,
        users_per_department=10,
        incidents_per_department=50,
        seed=42
    )
    
    # Generate a medium dataset for integration tests
    generate_complete_dataset(
        name="medium_test",
        department_count=2,
        stations_per_department=5,
        users_per_department=20,
        incidents_per_department=100,
        seed=43
    )
    
    # Generate a large dataset for performance tests
    generate_complete_dataset(
        name="large_test",
        department_count=5,
        stations_per_department=10,
        users_per_department=50,
        incidents_per_department=500,
        seed=44
    )
    
    # Generate specialized datasets for specific test scenarios
    
    # 1. Dataset with many incidents for call density heatmap testing
    many_incidents_dept = generate_departments(1, seed=100)[0]
    dept_id = many_incidents_dept["id"]
    
    # Create the dataset
    dept_dataset = data_manager.create_dataset(
        "heatmap_test_department",
        "departments",
        [many_incidents_dept]
    )
    
    # Generate a high volume of incidents clustered in specific areas
    incidents = generate_incidents(
        count=1000,
        department_id=dept_id,
        seed=101
    )
    
    # Create the dataset
    incident_dataset = data_manager.create_dataset(
        "heatmap_test_incidents",
        "incidents",
        incidents
    )
    
    # Create a fixture for heatmap testing
    data_manager.create_fixture(
        name="heatmap_test",
        datasets=[dept_dataset, incident_dataset]
    )
    
    print("Generated standard test fixtures.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate test data for Fire-EMS Tools")
    parser.add_argument("--standard", action="store_true", help="Generate standard test fixtures")
    parser.add_argument("--name", default="custom", help="Name for the dataset")
    parser.add_argument("--departments", type=int, default=3, help="Number of departments")
    parser.add_argument("--stations", type=int, default=5, help="Stations per department")
    parser.add_argument("--users", type=int, default=20, help="Users per department")
    parser.add_argument("--incidents", type=int, default=100, help="Incidents per department")
    parser.add_argument("--seed", type=int, help="Random seed for reproducible generation")
    
    args = parser.parse_args()
    
    # Ensure directories exist
    ensure_directories_exist()
    
    if args.standard:
        generate_standard_test_fixtures()
    else:
        generate_complete_dataset(
            name=args.name,
            department_count=args.departments,
            stations_per_department=args.stations,
            users_per_department=args.users,
            incidents_per_department=args.incidents,
            seed=args.seed
        )