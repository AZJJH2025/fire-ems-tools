"""
Test Database Setup

Utility for creating and populating a test database with generated data.
"""

import os
import sqlite3
import json
from pathlib import Path
import sys
from typing import Dict, List, Any, Optional

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from utilities.test_data_manager import TestDataSet, TestFixture, data_manager

# SQL schemas for database tables
SQL_SCHEMAS = {
    "departments": """
    CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size TEXT NOT NULL,
        service_area TEXT NOT NULL,
        station_count INTEGER NOT NULL,
        personnel_count INTEGER NOT NULL,
        vehicle_count INTEGER NOT NULL,
        annual_budget REAL NOT NULL,
        contact TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """,
    
    "stations": """
    CREATE TABLE IF NOT EXISTS stations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department_id TEXT NOT NULL,
        type TEXT NOT NULL,
        staffing TEXT NOT NULL,
        location TEXT NOT NULL,
        apparatus TEXT NOT NULL,
        area_served_sq_miles REAL NOT NULL,
        built_year INTEGER NOT NULL,
        last_renovated INTEGER,
        features TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments (id)
    );
    """,
    
    "users": """
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        department_id TEXT NOT NULL,
        station_id TEXT,
        permissions TEXT NOT NULL,
        level INTEGER NOT NULL,
        phone TEXT,
        position TEXT,
        certifications TEXT,
        hire_date TEXT,
        active INTEGER NOT NULL,
        last_login TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments (id),
        FOREIGN KEY (station_id) REFERENCES stations (id)
    );
    """,
    
    "incidents": """
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        department_id TEXT NOT NULL,
        call_number TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        priority INTEGER NOT NULL,
        location TEXT NOT NULL,
        caller_info TEXT NOT NULL,
        times TEXT NOT NULL,
        units TEXT NOT NULL,
        outcome TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments (id)
    );
    """
}


def setup_database(db_path: str, overwrite: bool = False) -> sqlite3.Connection:
    """
    Set up a test database with the required schema.
    
    Args:
        db_path: Path to the SQLite database file
        overwrite: Whether to overwrite an existing database
        
    Returns:
        A connection to the database
    """
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    # Delete existing database if overwrite is True
    if overwrite and os.path.exists(db_path):
        os.remove(db_path)
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    
    # Create tables
    for schema in SQL_SCHEMAS.values():
        conn.executescript(schema)
    
    return conn


def insert_department(conn: sqlite3.Connection, department: Dict[str, Any]):
    """
    Insert a department into the database.
    
    Args:
        conn: Database connection
        department: Department data dictionary
    """
    # Convert nested dictionaries to JSON
    contact_json = json.dumps(department["contact"])
    
    conn.execute(
        """
        INSERT INTO departments (
            id, name, type, size, service_area, station_count, 
            personnel_count, vehicle_count, annual_budget,
            contact, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            department["id"],
            department["name"],
            department["type"],
            department["size"],
            department["service_area"],
            department["station_count"],
            department["personnel_count"],
            department["vehicle_count"],
            department["annual_budget"],
            contact_json,
            department["created_at"],
            department["updated_at"]
        )
    )


def insert_station(conn: sqlite3.Connection, station: Dict[str, Any]):
    """
    Insert a station into the database.
    
    Args:
        conn: Database connection
        station: Station data dictionary
    """
    # Convert nested dictionaries and lists to JSON
    staffing_json = json.dumps(station["staffing"])
    location_json = json.dumps(station["location"])
    apparatus_json = json.dumps(station["apparatus"])
    features_json = json.dumps(station["features"])
    
    conn.execute(
        """
        INSERT INTO stations (
            id, name, department_id, type, staffing, location, apparatus,
            area_served_sq_miles, built_year, last_renovated, features,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            station["id"],
            station["name"],
            station["department_id"],
            station["type"],
            staffing_json,
            location_json,
            apparatus_json,
            station["area_served_sq_miles"],
            station["built_year"],
            station.get("last_renovated"),
            features_json,
            station["created_at"],
            station["updated_at"]
        )
    )


def insert_user(conn: sqlite3.Connection, user: Dict[str, Any]):
    """
    Insert a user into the database.
    
    Args:
        conn: Database connection
        user: User data dictionary
    """
    # Convert nested dictionaries and lists to JSON
    permissions_json = json.dumps(user["permissions"])
    certifications_json = json.dumps(user.get("certifications", []))
    
    conn.execute(
        """
        INSERT INTO users (
            id, username, first_name, last_name, email, password_hash,
            role, department_id, station_id, permissions, level, phone,
            position, certifications, hire_date, active, last_login,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user["id"],
            user["username"],
            user["first_name"],
            user["last_name"],
            user["email"],
            user["password_hash"],
            user["role"],
            user["department_id"],
            user.get("station_id"),
            permissions_json,
            user["level"],
            user.get("phone"),
            user.get("position"),
            certifications_json,
            user.get("hire_date"),
            1 if user["active"] else 0,
            user.get("last_login"),
            user["created_at"],
            user["updated_at"]
        )
    )


def insert_incident(conn: sqlite3.Connection, incident: Dict[str, Any]):
    """
    Insert an incident into the database.
    
    Args:
        conn: Database connection
        incident: Incident data dictionary
    """
    # Convert nested dictionaries and lists to JSON
    location_json = json.dumps(incident["location"])
    caller_info_json = json.dumps(incident["caller_info"])
    times_json = json.dumps(incident["times"])
    units_json = json.dumps(incident["units"])
    
    conn.execute(
        """
        INSERT INTO incidents (
            id, department_id, call_number, type, category, priority,
            location, caller_info, times, units, outcome, notes,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            incident["id"],
            incident["department_id"],
            incident["call_number"],
            incident["type"],
            incident["category"],
            incident["priority"],
            location_json,
            caller_info_json,
            times_json,
            units_json,
            incident["outcome"],
            incident.get("notes"),
            incident["created_at"],
            incident["updated_at"]
        )
    )


def load_fixture_to_database(
    fixture_name: str,
    db_path: str,
    overwrite: bool = False
) -> sqlite3.Connection:
    """
    Load a fixture into a test database.
    
    Args:
        fixture_name: Name of the fixture to load
        db_path: Path to the SQLite database file
        overwrite: Whether to overwrite an existing database
        
    Returns:
        A connection to the database
    """
    # Set up the database
    conn = setup_database(db_path, overwrite)
    
    # Load the fixture
    fixture = data_manager.get_fixture(fixture_name)
    
    # Group datasets by category
    datasets_by_category = {
        "departments": [],
        "stations": [],
        "users": [],
        "incidents": []
    }
    
    for dataset in fixture.datasets:
        if dataset.category in datasets_by_category:
            datasets_by_category[dataset.category].append(dataset)
    
    # Track inserted items to avoid duplicates
    inserted_ids = {
        "departments": set(),
        "stations": set(),
        "users": set(),
        "incidents": set()
    }
    
    # Insert departments first
    for dataset in datasets_by_category["departments"]:
        for department in dataset.data:
            if department["id"] not in inserted_ids["departments"]:
                try:
                    insert_department(conn, department)
                    inserted_ids["departments"].add(department["id"])
                except sqlite3.IntegrityError:
                    # Already exists, skip
                    pass
    
    # Then insert stations
    for dataset in datasets_by_category["stations"]:
        for station in dataset.data:
            if station["id"] not in inserted_ids["stations"]:
                try:
                    insert_station(conn, station)
                    inserted_ids["stations"].add(station["id"])
                except sqlite3.IntegrityError:
                    # Already exists, skip
                    pass
    
    # Then insert users
    for dataset in datasets_by_category["users"]:
        for user in dataset.data:
            if user["id"] not in inserted_ids["users"]:
                try:
                    insert_user(conn, user)
                    inserted_ids["users"].add(user["id"])
                except sqlite3.IntegrityError:
                    # Already exists, skip
                    pass
    
    # Finally insert incidents
    for dataset in datasets_by_category["incidents"]:
        for incident in dataset.data:
            if incident["id"] not in inserted_ids["incidents"]:
                try:
                    insert_incident(conn, incident)
                    inserted_ids["incidents"].add(incident["id"])
                except sqlite3.IntegrityError:
                    # Already exists, skip
                    pass
    
    # Commit the changes
    conn.commit()
    
    return conn


def main():
    """Main entry point for the script."""
    # Default database path
    db_path = str(Path(__file__).parent.parent / "test_data" / "test.db")
    
    # Load the small_test fixture by default
    load_fixture_to_database("small_test", db_path, overwrite=True)
    print(f"Loaded small_test fixture into {db_path}")


if __name__ == "__main__":
    main()