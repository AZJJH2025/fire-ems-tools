#!/usr/bin/env python3
"""
Test Data CLI

Command-line interface for managing test data and fixtures.
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent))

from utilities.test_data_manager import data_manager
from utilities.setup_test_database import load_fixture_to_database
from data_generators.generate_test_data import (
    generate_complete_dataset,
    generate_standard_test_fixtures,
    ensure_directories_exist
)


def list_datasets():
    """List all available datasets."""
    print("Available Datasets:")
    
    # List departments datasets
    dept_dir = Path(__file__).parent / "test_data" / "departments"
    if dept_dir.exists():
        print("\nDepartments:")
        for file in dept_dir.glob("*.json"):
            print(f"  - {file.stem}")
    
    # List stations datasets
    stations_dir = Path(__file__).parent / "test_data" / "stations"
    if stations_dir.exists():
        print("\nStations:")
        for file in stations_dir.glob("*.json"):
            print(f"  - {file.stem}")
    
    # List users datasets
    users_dir = Path(__file__).parent / "test_data" / "users"
    if users_dir.exists():
        print("\nUsers:")
        for file in users_dir.glob("*.json"):
            print(f"  - {file.stem}")
    
    # List incidents datasets
    incidents_dir = Path(__file__).parent / "test_data" / "incidents"
    if incidents_dir.exists():
        print("\nIncidents:")
        for file in incidents_dir.glob("*.json"):
            print(f"  - {file.stem}")


def list_fixtures():
    """List all available fixtures."""
    print("Available Fixtures:")
    
    fixtures_dir = Path(__file__).parent / "fixtures"
    if fixtures_dir.exists():
        for file in fixtures_dir.glob("*.json"):
            print(f"  - {file.stem}")
    else:
        print("No fixtures found.")


def show_dataset(category, name):
    """
    Show the contents of a dataset.
    
    Args:
        category: Dataset category (departments, stations, users, incidents)
        name: Dataset name
    """
    try:
        dataset = data_manager.get_dataset(name, category)
        print(f"Dataset: {name} ({category})")
        print(f"Metadata: {json.dumps(dataset.metadata, indent=2)}")
        print(f"Data Sample (first 2 items):")
        
        if isinstance(dataset.data, list) and len(dataset.data) > 0:
            sample = dataset.data[:2]
            print(json.dumps(sample, indent=2))
            print(f"Total items: {len(dataset.data)}")
        else:
            print(dataset.data)
    except Exception as e:
        print(f"Error: {e}")


def show_fixture(name):
    """
    Show the contents of a fixture.
    
    Args:
        name: Fixture name
    """
    try:
        fixture = data_manager.get_fixture(name)
        print(f"Fixture: {name}")
        print(f"Metadata: {json.dumps(fixture.metadata, indent=2)}")
        print("Datasets:")
        
        for dataset in fixture.datasets:
            print(f"  - {dataset.category}/{dataset.name}: {len(dataset.data)} items")
    except Exception as e:
        print(f"Error: {e}")


def create_database(fixture_name, db_path=None, overwrite=False):
    """
    Create a test database from a fixture.
    
    Args:
        fixture_name: Name of the fixture to load
        db_path: Path to the database file (default: tests/test_data/test.db)
        overwrite: Whether to overwrite an existing database
    """
    if db_path is None:
        db_path = str(Path(__file__).parent / "test_data" / "test.db")
    
    try:
        conn = load_fixture_to_database(fixture_name, db_path, overwrite)
        conn.close()
        print(f"Created test database at {db_path} from fixture {fixture_name}")
    except Exception as e:
        print(f"Error creating database: {e}")


def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(description="Test Data Management CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # List datasets command
    list_datasets_parser = subparsers.add_parser("list-datasets", help="List all available datasets")
    
    # List fixtures command
    list_fixtures_parser = subparsers.add_parser("list-fixtures", help="List all available fixtures")
    
    # Show dataset command
    show_dataset_parser = subparsers.add_parser("show-dataset", help="Show dataset contents")
    show_dataset_parser.add_argument("category", help="Dataset category (departments, stations, users, incidents)")
    show_dataset_parser.add_argument("name", help="Dataset name")
    
    # Show fixture command
    show_fixture_parser = subparsers.add_parser("show-fixture", help="Show fixture contents")
    show_fixture_parser.add_argument("name", help="Fixture name")
    
    # Generate standard fixtures command
    generate_parser = subparsers.add_parser("generate", help="Generate standard test fixtures")
    
    # Generate custom dataset command
    generate_custom_parser = subparsers.add_parser("generate-custom", help="Generate custom dataset")
    generate_custom_parser.add_argument("--name", default="custom", help="Name for the dataset")
    generate_custom_parser.add_argument("--departments", type=int, default=3, help="Number of departments")
    generate_custom_parser.add_argument("--stations", type=int, default=5, help="Stations per department")
    generate_custom_parser.add_argument("--users", type=int, default=20, help="Users per department")
    generate_custom_parser.add_argument("--incidents", type=int, default=100, help="Incidents per department")
    generate_custom_parser.add_argument("--seed", type=int, help="Random seed for reproducible generation")
    
    # Create database command
    db_parser = subparsers.add_parser("create-db", help="Create a test database from a fixture")
    db_parser.add_argument("fixture", help="Fixture name")
    db_parser.add_argument("--db-path", help="Path to the database file")
    db_parser.add_argument("--overwrite", action="store_true", help="Overwrite existing database")
    
    args = parser.parse_args()
    
    # Ensure directories exist
    ensure_directories_exist()
    
    if args.command == "list-datasets":
        list_datasets()
    elif args.command == "list-fixtures":
        list_fixtures()
    elif args.command == "show-dataset":
        show_dataset(args.category, args.name)
    elif args.command == "show-fixture":
        show_fixture(args.name)
    elif args.command == "generate":
        generate_standard_test_fixtures()
    elif args.command == "generate-custom":
        generate_complete_dataset(
            name=args.name,
            department_count=args.departments,
            stations_per_department=args.stations,
            users_per_department=args.users,
            incidents_per_department=args.incidents,
            seed=args.seed
        )
    elif args.command == "create-db":
        create_database(args.fixture, args.db_path, args.overwrite)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()