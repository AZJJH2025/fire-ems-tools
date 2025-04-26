#!/usr/bin/env python3
"""
Setup Test Database Script

This script creates and initializes a test database for running the
non-simplified tests for the Fire-EMS Tools application.

It creates test data including:
- Departments
- Stations
- Users
- Incidents

Usage:
    python setup_test_database.py [--force]

Options:
    --force  Drop existing tables before creating new ones
"""

import os
import sys
import argparse
import random
from datetime import datetime, timedelta
import hashlib
import json
import csv
import sqlite3
from pathlib import Path

# Setup script constants
DEFAULT_DB_PATH = "test_fire_ems.db"
TEST_DATA_DIR = "data/test"
DEPARTMENT_TYPES = ["fire", "ems", "combined"]
FEATURE_LIST = [
    "incident_logger",
    "call_density",
    "isochrone_map",
    "coverage_gap_finder",
    "fire_map_pro",
    "data_formatter",
    "response_time",
    "station_overview"
]

# Department configurations
DEPARTMENT_CONFIGS = [
    {
        "code": "rural",
        "name": "Pinecrest Fire District",
        "department_type": "fire",
        "num_stations": 2,
        "features_enabled": ["incident_logger", "call_density"]
    },
    {
        "code": "suburban",
        "name": "Oakridge Fire Department",
        "department_type": "combined",
        "num_stations": 4,
        "features_enabled": ["incident_logger", "call_density", "isochrone_map", "coverage_gap_finder"]
    },
    {
        "code": "urban",
        "name": "Bayport Fire & Rescue",
        "department_type": "combined",
        "num_stations": 12,
        "features_enabled": ["incident_logger", "call_density", "isochrone_map", "coverage_gap_finder", 
                             "fire_map_pro", "data_formatter"]
    },
    {
        "code": "regional",
        "name": "Tri-County Regional Fire & EMS",
        "department_type": "combined",
        "num_stations": 8,
        "features_enabled": ["incident_logger", "call_density", "isochrone_map", "coverage_gap_finder", 
                            "fire_map_pro", "data_formatter", "response_time", "station_overview"]
    }
]

# Geographic data for test stations
GEOGRAPHIC_AREAS = {
    "rural": {
        "lat_center": 34.1231,
        "lng_center": -112.3456,
        "radius": 15
    },
    "suburban": {
        "lat_center": 33.6543,
        "lng_center": -111.9870,
        "radius": 8
    },
    "urban": {
        "lat_center": 33.4484,
        "lng_center": -112.0740,
        "radius": 5
    },
    "regional": {
        "lat_center": 33.8765,
        "lng_center": -112.5432,
        "radius": 25
    }
}

# Incident types for test data
INCIDENT_TYPES = {
    "fire": ["STRUCTURE_FIRE", "VEHICLE_FIRE", "WILDLAND_FIRE", "ALARM_ACTIVATION", "SMOKE_INVESTIGATION"],
    "ems": ["MEDICAL_EMERGENCY", "TRAUMA", "CARDIAC_ARREST", "BREATHING_DIFFICULTY", "FALL"],
    "other": ["HAZMAT", "RESCUE", "SERVICE_CALL", "PUBLIC_ASSIST", "MUTUAL_AID"]
}

# User roles and types
USER_ROLES = ["admin", "manager", "user", "readonly"]


def create_database_connection(db_path):
    """Create a connection to the SQLite database"""
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def create_tables(conn, force=False):
    """Create the database tables"""
    cursor = conn.cursor()
    
    # Drop tables if force is specified
    if force:
        print("Dropping existing tables...")
        cursor.execute("DROP TABLE IF EXISTS incidents")
        cursor.execute("DROP TABLE IF EXISTS stations")
        cursor.execute("DROP TABLE IF EXISTS users")
        cursor.execute("DROP TABLE IF EXISTS departments")
    
    # Create departments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        department_type TEXT NOT NULL,
        features_enabled TEXT DEFAULT '{}',
        api_enabled BOOLEAN DEFAULT FALSE,
        api_key TEXT,
        webhook_url TEXT,
        webhook_secret TEXT,
        webhook_events TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        full_name TEXT,
        department_id INTEGER,
        role TEXT DEFAULT 'user',
        preferences TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id)
    )
    """)
    
    # Create stations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department_id INTEGER NOT NULL,
        station_number TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zipcode TEXT,
        latitude REAL,
        longitude REAL,
        station_type TEXT,
        personnel_count INTEGER,
        apparatus TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id)
    )
    """)
    
    # Create incidents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_number TEXT NOT NULL,
        department_id INTEGER NOT NULL,
        incident_date DATE NOT NULL,
        incident_time TIME NOT NULL,
        incident_type TEXT,
        response_time INTEGER,
        latitude REAL,
        longitude REAL,
        address TEXT,
        description TEXT,
        status TEXT DEFAULT 'completed',
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
    )
    """)
    
    conn.commit()
    print("Database tables created successfully")


def create_departments(conn):
    """Create test departments"""
    cursor = conn.cursor()
    
    # Check if departments already exist
    cursor.execute("SELECT COUNT(*) FROM departments")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"Departments already exist in the database ({count} found)")
        return
    
    print("Creating test departments...")
    for dept in DEPARTMENT_CONFIGS:
        # Convert features list to JSON string
        features_dict = {feature: True for feature in dept["features_enabled"]}
        for feature in FEATURE_LIST:
            if feature not in features_dict:
                features_dict[feature] = False
        
        features_json = json.dumps(features_dict)
        
        # Set API enabled for larger departments
        api_enabled = dept["code"] in ["urban", "regional", "suburban"]
        
        # Generate API key
        api_key = hashlib.sha256(f"{dept['code']}_api_key_{random.randint(1000, 9999)}".encode()).hexdigest()
        
        # Setup webhooks for applicable departments
        webhook_url = None
        webhook_secret = None
        webhook_events = None
        
        if dept["code"] in ["urban", "regional", "suburban"]:
            webhook_url = f"https://test-webhook.{dept['code'].lower()}fd.gov/incident-updates" 
            webhook_secret = hashlib.sha256(f"{dept['code']}_webhook_{random.randint(1000, 9999)}".encode()).hexdigest()[:32]
            webhook_events = json.dumps({
                "incident.created": True,
                "incident.updated": True,
                "incident.deleted": dept["code"] == "urban",
                "station.created": False,
                "user.created": False
            })
        
        cursor.execute("""
        INSERT INTO departments (code, name, department_type, features_enabled, 
                              api_enabled, api_key, webhook_url, webhook_secret, webhook_events)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dept["code"], 
            dept["name"], 
            dept["department_type"], 
            features_json, 
            api_enabled, 
            api_key,
            webhook_url,
            webhook_secret,
            webhook_events
        ))
    
    conn.commit()
    print(f"Created {len(DEPARTMENT_CONFIGS)} test departments")


def create_stations(conn):
    """Create test stations for each department"""
    cursor = conn.cursor()
    
    # Check if stations already exist
    cursor.execute("SELECT COUNT(*) FROM stations")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"Stations already exist in the database ({count} found)")
        return
    
    print("Creating test stations...")
    total_stations = 0
    
    # Get all departments
    cursor.execute("SELECT id, code, department_type FROM departments")
    departments = cursor.fetchall()
    
    for dept_id, dept_code, dept_type in departments:
        dept_config = next(d for d in DEPARTMENT_CONFIGS if d["code"] == dept_code)
        num_stations = dept_config["num_stations"]
        geo_area = GEOGRAPHIC_AREAS[dept_code]
        
        for i in range(1, num_stations + 1):
            # Generate a realistic station location within the radius
            angle = random.uniform(0, 360)
            distance = random.uniform(0, geo_area["radius"])
            
            # Convert polar to cartesian, scaling for lat/lng
            # Note: This is a simplified approach and doesn't account for Earth's curvature
            lat_offset = distance * 0.01 * math.sin(math.radians(angle))
            lng_offset = distance * 0.01 * math.cos(math.radians(angle))
            
            latitude = geo_area["lat_center"] + lat_offset
            longitude = geo_area["lng_center"] + lng_offset
            
            # Generate station details
            station_name = f"Station {i}"
            station_number = str(i)
            address = f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Pine', 'Maple', 'Elm'])} {random.choice(['St', 'Ave', 'Blvd', 'Dr'])}"
            city = f"{random.choice(['North', 'South', 'East', 'West', ''])} {random.choice(['Pinecrest', 'Oakridge', 'Bayport', 'Riverside', 'Lakewood'])}"
            state = "AZ"
            zipcode = f"{random.randint(85000, 86000)}"
            
            # Determine station type based on department type
            if dept_type == "fire":
                station_type = "fire"
            elif dept_type == "ems":
                station_type = "ems"
            else:  # combined
                station_type = random.choice(["fire", "ems", "combined"])
            
            # Generate personnel count based on department type
            if dept_code == "rural":
                personnel_count = random.randint(4, 8)
            elif dept_code == "suburban":
                personnel_count = random.randint(8, 12)
            elif dept_code == "urban":
                personnel_count = random.randint(12, 24)
            else:  # regional
                personnel_count = random.randint(8, 16)
            
            # Generate apparatus list
            apparatus = []
            if station_type in ["fire", "combined"]:
                apparatus.append(f"Engine {station_number}")
                if random.random() > 0.5:
                    apparatus.append(f"Ladder {station_number}")
                if random.random() > 0.7:
                    apparatus.append(f"Brush {station_number}")
            
            if station_type in ["ems", "combined"]:
                num_ambulances = random.randint(1, 3)
                for j in range(1, num_ambulances + 1):
                    apparatus.append(f"Ambulance {station_number}{j}")
            
            apparatus_json = json.dumps(apparatus)
            
            cursor.execute("""
            INSERT INTO stations (name, department_id, station_number, address, city, state, zipcode,
                               latitude, longitude, station_type, personnel_count, apparatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                station_name, 
                dept_id, 
                station_number, 
                address, 
                city, 
                state, 
                zipcode, 
                latitude, 
                longitude, 
                station_type, 
                personnel_count, 
                apparatus_json
            ))
            total_stations += 1
    
    conn.commit()
    print(f"Created {total_stations} test stations")


def create_users(conn):
    """Create test users for each department"""
    cursor = conn.cursor()
    
    # Check if users already exist
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"Users already exist in the database ({count} found)")
        return
    
    print("Creating test users...")
    total_users = 0
    
    # Get all departments
    cursor.execute("SELECT id, code, name FROM departments")
    departments = cursor.fetchall()
    
    # Create a global admin user
    admin_password_hash = hashlib.sha256("admin123".encode()).hexdigest()
    cursor.execute("""
    INSERT INTO users (username, password_hash, email, full_name, department_id, role)
    VALUES (?, ?, ?, ?, NULL, ?)
    """, (
        "admin", 
        admin_password_hash, 
        "admin@fire-ems-tools.org", 
        "System Administrator", 
        "admin"
    ))
    total_users += 1
    
    # Create users for each department
    for dept_id, dept_code, dept_name in departments:
        # Add department admin
        password_hash = hashlib.sha256(f"{dept_code}_admin".encode()).hexdigest()
        cursor.execute("""
        INSERT INTO users (username, password_hash, email, full_name, department_id, role)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            f"{dept_code}_admin", 
            password_hash, 
            f"admin@{dept_code}.org", 
            f"{dept_name} Admin", 
            dept_id, 
            "admin"
        ))
        total_users += 1
        
        # Add manager
        password_hash = hashlib.sha256(f"{dept_code}_manager".encode()).hexdigest()
        cursor.execute("""
        INSERT INTO users (username, password_hash, email, full_name, department_id, role)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            f"{dept_code}_manager", 
            password_hash, 
            f"manager@{dept_code}.org", 
            f"{dept_name} Manager", 
            dept_id, 
            "manager"
        ))
        total_users += 1
        
        # Add regular user
        password_hash = hashlib.sha256(f"{dept_code}_user".encode()).hexdigest()
        cursor.execute("""
        INSERT INTO users (username, password_hash, email, full_name, department_id, role)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            f"{dept_code}_user", 
            password_hash, 
            f"user@{dept_code}.org", 
            f"{dept_name} User", 
            dept_id, 
            "user"
        ))
        total_users += 1
        
        # Add read-only user
        password_hash = hashlib.sha256(f"{dept_code}_readonly".encode()).hexdigest()
        cursor.execute("""
        INSERT INTO users (username, password_hash, email, full_name, department_id, role)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            f"{dept_code}_readonly", 
            password_hash, 
            f"readonly@{dept_code}.org", 
            f"{dept_name} Read Only", 
            dept_id, 
            "readonly"
        ))
        total_users += 1
    
    conn.commit()
    print(f"Created {total_users} test users")


def create_incidents(conn, num_incidents_per_dept=100):
    """Create test incidents for each department"""
    cursor = conn.cursor()
    
    # Check if incidents already exist
    cursor.execute("SELECT COUNT(*) FROM incidents")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"Incidents already exist in the database ({count} found)")
        return
    
    print(f"Creating {num_incidents_per_dept} test incidents per department...")
    total_incidents = 0
    
    # Get all departments
    cursor.execute("SELECT id, code, department_type FROM departments")
    departments = cursor.fetchall()
    
    # Get users for creating incidents
    cursor.execute("SELECT id, department_id FROM users WHERE role IN ('admin', 'manager', 'user')")
    users_by_dept = {}
    for user_id, dept_id in cursor.fetchall():
        if dept_id not in users_by_dept:
            users_by_dept[dept_id] = []
        users_by_dept[dept_id].append(user_id)
    
    # Get stations for incident locations
    cursor.execute("SELECT id, department_id, latitude, longitude FROM stations")
    stations_by_dept = {}
    for station_id, dept_id, lat, lng in cursor.fetchall():
        if dept_id not in stations_by_dept:
            stations_by_dept[dept_id] = []
        stations_by_dept[dept_id].append((lat, lng))
    
    for dept_id, dept_code, dept_type in departments:
        geo_area = GEOGRAPHIC_AREAS[dept_code]
        
        # Get user IDs for this department
        dept_users = users_by_dept.get(dept_id, [])
        if not dept_users:
            dept_users = [None]  # Use None if no users found
        
        # Get station locations for this department
        dept_stations = stations_by_dept.get(dept_id, [])
        if not dept_stations:
            dept_stations = [(geo_area["lat_center"], geo_area["lng_center"])]
        
        # Determine which incident types to use based on department type
        if dept_type == "fire":
            incident_type_weights = {"fire": 0.7, "ems": 0.1, "other": 0.2}
        elif dept_type == "ems":
            incident_type_weights = {"fire": 0.1, "ems": 0.8, "other": 0.1}
        else:  # combined
            incident_type_weights = {"fire": 0.4, "ems": 0.5, "other": 0.1}
        
        # Generate incidents
        for i in range(1, num_incidents_per_dept + 1):
            # Create incident number with department code and sequential number
            incident_number = f"{dept_code.upper()}-{datetime.now().year}-{i:04d}"
            
            # Generate random date within the last year
            days_ago = random.randint(0, 365)
            incident_date = (datetime.now() - timedelta(days=days_ago)).date()
            
            # Generate random time
            incident_time = datetime.strptime(f"{random.randint(0, 23):02d}:{random.randint(0, 59):02d}:00", "%H:%M:%S").time()
            
            # Select incident type based on weights
            type_category = random.choices(
                ["fire", "ems", "other"],
                weights=[incident_type_weights["fire"], incident_type_weights["ems"], incident_type_weights["other"]],
                k=1
            )[0]
            incident_type = random.choice(INCIDENT_TYPES[type_category])
            
            # Generate random response time (2-15 minutes)
            response_time = random.randint(120, 900)
            
            # Generate location near one of the stations
            base_lat, base_lng = random.choice(dept_stations)
            max_offset = 0.05  # About 3 miles
            lat_offset = random.uniform(-max_offset, max_offset)
            lng_offset = random.uniform(-max_offset, max_offset)
            latitude = base_lat + lat_offset
            longitude = base_lng + lng_offset
            
            # Generate dummy address
            address = f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Pine', 'Maple', 'Elm', 'Cedar', 'Washington', 'First', 'Second'])} {random.choice(['St', 'Ave', 'Blvd', 'Dr', 'Rd', 'Ln', 'Way', 'Circle'])}"
            
            # Generate description based on incident type
            if "FIRE" in incident_type:
                description = random.choice([
                    "Smoke visible from structure",
                    "Flames visible from garage",
                    "Vehicle fully engulfed",
                    "Small brush fire",
                    "Fire alarm activation"
                ])
            elif "MEDICAL" in incident_type or "CARDIAC" in incident_type or "BREATHING" in incident_type:
                description = random.choice([
                    "Patient experiencing chest pain",
                    "Difficulty breathing",
                    "Fall victim",
                    "Unconscious person",
                    "Possible stroke symptoms"
                ])
            else:
                description = random.choice([
                    "Unknown odor investigation",
                    "Service call for assistance",
                    "Public assist",
                    "Chemical spill",
                    "Water leak"
                ])
            
            # Select random user who created the incident
            created_by = random.choice(dept_users)
            
            cursor.execute("""
            INSERT INTO incidents (incident_number, department_id, incident_date, incident_time,
                               incident_type, response_time, latitude, longitude, address,
                               description, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                incident_number, 
                dept_id, 
                incident_date.isoformat(), 
                incident_time.isoformat(), 
                incident_type, 
                response_time, 
                latitude, 
                longitude, 
                address, 
                description, 
                created_by
            ))
            total_incidents += 1
    
    conn.commit()
    print(f"Created {total_incidents} test incidents")


def export_csv_data(conn, output_dir):
    """Export data to CSV files for use in tests"""
    cursor = conn.cursor()
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Export departments
    cursor.execute("SELECT id, code, name, department_type, features_enabled FROM departments")
    departments = cursor.fetchall()
    
    with open(os.path.join(output_dir, "departments.csv"), 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["id", "code", "name", "department_type", "features_enabled"])
        for row in departments:
            writer.writerow(row)
    
    # Export stations
    cursor.execute("SELECT id, name, department_id, latitude, longitude, station_type FROM stations")
    stations = cursor.fetchall()
    
    with open(os.path.join(output_dir, "stations.csv"), 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["id", "name", "department_id", "latitude", "longitude", "station_type"])
        for row in stations:
            writer.writerow(row)
    
    # Export users (excluding password hashes)
    cursor.execute("SELECT id, username, email, department_id, role FROM users")
    users = cursor.fetchall()
    
    with open(os.path.join(output_dir, "users.csv"), 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["id", "username", "email", "department_id", "role"])
        for row in users:
            writer.writerow(row)
    
    # Export incidents
    cursor.execute("""
    SELECT i.id, i.incident_number, i.department_id, i.incident_date, i.incident_time, 
           i.incident_type, i.latitude, i.longitude, i.address, d.code
    FROM incidents i
    JOIN departments d ON i.department_id = d.id
    """)
    incidents = cursor.fetchall()
    
    # Export all incidents
    with open(os.path.join(output_dir, "incidents.csv"), 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["id", "incident_number", "department_id", "incident_date", "incident_time", 
                         "incident_type", "latitude", "longitude", "address", "department_code"])
        for row in incidents:
            writer.writerow(row)
    
    # Export department-specific incidents
    for dept_id, dept_code, _, _, _ in departments:
        dept_incidents = [inc for inc in incidents if inc[2] == dept_id]
        
        if dept_incidents:
            with open(os.path.join(output_dir, f"{dept_code}_incidents.csv"), 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(["id", "incident_number", "department_id", "incident_date", "incident_time", 
                             "incident_type", "latitude", "longitude", "address", "department_code"])
                for row in dept_incidents:
                    writer.writerow(row)
    
    print(f"Exported CSV data to {output_dir}")


def main():
    """Main function to set up the test database"""
    parser = argparse.ArgumentParser(description='Setup test database for Fire-EMS Tools')
    parser.add_argument('--force', action='store_true', help='Drop existing tables before creating new ones')
    parser.add_argument('--db-path', default=DEFAULT_DB_PATH, help='Database file path')
    parser.add_argument('--num-incidents', type=int, default=100, help='Number of incidents per department')
    args = parser.parse_args()
    
    print(f"Setting up test database at {args.db_path}")
    
    # Create database connection
    conn = create_database_connection(args.db_path)
    
    try:
        # Create tables
        create_tables(conn, args.force)
        
        # Add test data
        create_departments(conn)
        create_stations(conn)
        create_users(conn)
        create_incidents(conn, args.num_incidents)
        
        # Export data to CSV files
        export_csv_data(conn, TEST_DATA_DIR)
        
        print("\nTest database setup complete!")
        print(f"Database file: {args.db_path}")
        print(f"CSV data: {TEST_DATA_DIR}")
        print("\nTest credentials:")
        print("- Global admin: username='admin', password='admin123'")
        print("- Department admins: username='<dept_code>_admin', password='<dept_code>_admin'")
        print("  (e.g., username='rural_admin', password='rural_admin')")
        
    except Exception as e:
        print(f"Error setting up test database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()


if __name__ == "__main__":
    # Import math here to avoid polluting the global namespace
    import math
    main()