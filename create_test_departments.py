#!/usr/bin/env python3
"""
Test Department Creation Script

This script creates test departments with varied configurations for testing purposes.
It sets up four different department profiles:
1. Small Rural Department
2. Suburban Department 
3. Large Urban Department
4. Combined Fire/EMS Agency

Each department has appropriate settings, stations, users, and incident data.
"""

import json
import os
import random
import argparse
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import models
try:
    from database import Department, User, Station, Incident, db
    from app import app, bcrypt
except ImportError:
    print("Error: Could not import required modules.")
    print("Make sure you're running this script from the project root directory.")
    sys.exit(1)

def create_rural_department(session):
    """Create a small rural department with 1-2 stations"""
    print("Creating Small Rural Department...")
    
    # Basic department information
    rural_dept = Department(
        code="rural",
        name="Pinecrest Fire District",
        department_type="fire",
        num_stations=2,
        num_personnel=15,
        service_area=340.5,
        population_served=4500,
        address="421 Main Street",
        city="Pinecrest",
        state="Montana",
        zip_code="59823",
        phone="406-555-0127",
        email="chief@pinecrestfire.org",
        website="https://pinecrestfire.org",
        is_active=True,
        setup_complete=True,
        primary_color="#8B0000",  # Dark red
        secondary_color="#556B2F"  # Dark olive green
    )
    
    # Configure feature enablement
    rural_dept.features_enabled = {
        "incident_logger": True,
        "call_density": True,
        "isochrone_map": True,
        "dashboard": True,
        "coverage_gap_finder": False,
        "fire_map_pro": False,
        "data_formatter": False,
        "station_overview": False
    }
    
    # Configure API settings (limited)
    rural_dept.api_enabled = False
    rural_dept.api_key = None
    
    # Configure webhook settings (disabled)
    rural_dept.webhooks_enabled = False
    
    session.add(rural_dept)
    session.flush()  # Flush to get the department ID
    
    # Create stations
    stations = [
        {
            "name": "Pinecrest Station 1",
            "station_number": "1",
            "address": "421 Main Street",
            "city": "Pinecrest",
            "state": "Montana",
            "zip_code": "59823",
            "latitude": 46.8721,
            "longitude": -113.9940,
            "personnel_count": 9,
            "apparatus": {
                "engine": 1,
                "tanker": 1,
                "brush": 1,
                "command": 1
            }
        },
        {
            "name": "Millcreek Station",
            "station_number": "2",
            "address": "5532 Millcreek Road",
            "city": "Millcreek",
            "state": "Montana",
            "zip_code": "59824",
            "latitude": 46.9110,
            "longitude": -114.0560,
            "personnel_count": 6,
            "apparatus": {
                "engine": 1,
                "brush": 1
            }
        }
    ]
    
    for station_data in stations:
        station = Station(
            department_id=rural_dept.id,
            **station_data
        )
        session.add(station)
    
    # Create users with different roles
    users = [
        {
            "email": "chief@pinecrestfire.org",
            "name": "John Redmond",
            "role": "admin",
            "password": "rural-admin-pass"
        },
        {
            "email": "captain@pinecrestfire.org",
            "name": "Sarah Miller",
            "role": "manager",
            "password": "rural-manager-pass"
        },
        {
            "email": "ff1@pinecrestfire.org",
            "name": "Mike Johnson",
            "role": "user",
            "password": "rural-user-pass"
        }
    ]
    
    for user_data in users:
        password = user_data.pop("password")
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        user = User(
            department_id=rural_dept.id,
            password_hash=password_hash,
            is_active=True,
            **user_data
        )
        session.add(user)
    
    print(f"Created Pinecrest Fire District (ID: {rural_dept.id}) with 2 stations and 3 users")
    return rural_dept

def create_suburban_department(session):
    """Create a suburban department with 3-6 stations"""
    print("Creating Suburban Department...")
    
    # Basic department information
    suburban_dept = Department(
        code="suburban",
        name="Oakridge Fire Department",
        department_type="combined",
        num_stations=4,
        num_personnel=75,
        service_area=48.2,
        population_served=92000,
        address="1200 Oak Drive",
        city="Oakridge",
        state="Ohio",
        zip_code="45332",
        phone="513-555-3300",
        email="admin@oakridgefd.gov",
        website="https://oakridgefd.gov",
        is_active=True,
        setup_complete=True,
        primary_color="#003366",  # Navy blue
        secondary_color="#CC9900"  # Gold
    )
    
    # Configure feature enablement
    suburban_dept.features_enabled = {
        "incident_logger": True,
        "call_density": True,
        "isochrone_map": True,
        "dashboard": True,
        "coverage_gap_finder": True,
        "fire_map_pro": True,
        "data_formatter": False,
        "station_overview": False
    }
    
    # Configure API settings
    suburban_dept.api_enabled = True
    suburban_dept.api_key = "suburban-test-api-key-12345"
    
    # Configure webhook settings
    suburban_dept.webhooks_enabled = True
    suburban_dept.webhook_url = "https://test-webhook.oakridgefd.gov/incident-updates"
    suburban_dept.webhook_secret = "suburban-test-webhook-secret"
    suburban_dept.webhook_events = {
        "incident.created": True,
        "incident.updated": True,
        "incident.deleted": False,
        "user.created": False
    }
    
    session.add(suburban_dept)
    session.flush()  # Flush to get the department ID
    
    # Create stations
    stations = [
        {
            "name": "Oakridge HQ",
            "station_number": "1",
            "address": "1200 Oak Drive",
            "city": "Oakridge",
            "state": "Ohio",
            "zip_code": "45332",
            "latitude": 39.3219,
            "longitude": -84.4317,
            "personnel_count": 24,
            "apparatus": {
                "engine": 2,
                "ladder": 1,
                "ambulance": 2,
                "rescue": 1,
                "command": 2
            }
        },
        {
            "name": "West Oakridge",
            "station_number": "2",
            "address": "455 Westover Road",
            "city": "Oakridge",
            "state": "Ohio",
            "zip_code": "45332",
            "latitude": 39.3389,
            "longitude": -84.4689,
            "personnel_count": 18,
            "apparatus": {
                "engine": 1,
                "ambulance": 2,
                "brush": 1
            }
        },
        {
            "name": "North Station",
            "station_number": "3",
            "address": "780 North Hills Drive",
            "city": "Oakridge",
            "state": "Ohio",
            "zip_code": "45333",
            "latitude": 39.3486,
            "longitude": -84.4224,
            "personnel_count": 16,
            "apparatus": {
                "engine": 1,
                "ambulance": 1,
                "tanker": 1
            }
        },
        {
            "name": "Eastlake Station",
            "station_number": "4",
            "address": "1425 Lakefront Boulevard",
            "city": "Eastlake",
            "state": "Ohio",
            "zip_code": "45335",
            "latitude": 39.3113,
            "longitude": -84.4012,
            "personnel_count": 17,
            "apparatus": {
                "engine": 1,
                "ladder": 1,
                "ambulance": 1
            }
        }
    ]
    
    for station_data in stations:
        station = Station(
            department_id=suburban_dept.id,
            **station_data
        )
        session.add(station)
    
    # Create users with different roles
    users = [
        {
            "email": "chief@oakridgefd.gov",
            "name": "Robert Chen",
            "role": "admin",
            "password": "suburban-admin-pass"
        },
        {
            "email": "deputy@oakridgefd.gov",
            "name": "Maria Gonzalez",
            "role": "admin",
            "password": "suburban-admin2-pass"
        },
        {
            "email": "battalion1@oakridgefd.gov",
            "name": "James Wilson",
            "role": "manager",
            "password": "suburban-manager-pass"
        },
        {
            "email": "captain1@oakridgefd.gov",
            "name": "David Smith",
            "role": "manager",
            "password": "suburban-manager2-pass"
        },
        {
            "email": "ff1@oakridgefd.gov",
            "name": "Sophia Wang",
            "role": "user",
            "password": "suburban-user-pass"
        },
        {
            "email": "emt1@oakridgefd.gov",
            "name": "Michael Johnson",
            "role": "user",
            "password": "suburban-user2-pass"
        }
    ]
    
    for user_data in users:
        password = user_data.pop("password")
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        user = User(
            department_id=suburban_dept.id,
            password_hash=password_hash,
            is_active=True,
            **user_data
        )
        session.add(user)
    
    print(f"Created Oakridge Fire Department (ID: {suburban_dept.id}) with 4 stations and 6 users")
    return suburban_dept

def create_urban_department(session):
    """Create a large urban department with 10+ stations"""
    print("Creating Large Urban Department...")
    
    # Basic department information
    urban_dept = Department(
        code="urban",
        name="Bayport Fire & Rescue",
        department_type="combined",
        num_stations=12,
        num_personnel=380,
        service_area=142.6,
        population_served=825000,
        address="325 Central Avenue",
        city="Bayport",
        state="California",
        zip_code="94133",
        phone="415-555-7000",
        email="operations@bayportfire.gov",
        website="https://bayportfire.gov",
        is_active=True,
        setup_complete=True,
        primary_color="#FF0000",  # Red
        secondary_color="#000000"  # Black
    )
    
    # Configure feature enablement
    urban_dept.features_enabled = {
        "incident_logger": True,
        "call_density": True,
        "isochrone_map": True,
        "dashboard": True,
        "coverage_gap_finder": True,
        "fire_map_pro": True,
        "data_formatter": True,
        "station_overview": True
    }
    
    # Configure API settings
    urban_dept.api_enabled = True
    urban_dept.api_key = "urban-test-api-key-67890"
    
    # Configure webhook settings
    urban_dept.webhooks_enabled = True
    urban_dept.webhook_url = "https://api.bayportfire.gov/webhooks/incident-sync"
    urban_dept.webhook_secret = "urban-test-webhook-secret"
    urban_dept.webhook_events = {
        "incident.created": True,
        "incident.updated": True,
        "incident.deleted": True,
        "user.created": True,
        "user.updated": True,
        "station.updated": True
    }
    
    session.add(urban_dept)
    session.flush()  # Flush to get the department ID
    
    # Create a subset of stations (3 out of 12) for brevity
    stations = [
        {
            "name": "Headquarters Station 1",
            "station_number": "1",
            "address": "325 Central Avenue",
            "city": "Bayport",
            "state": "California",
            "zip_code": "94133",
            "latitude": 37.7982,
            "longitude": -122.4040,
            "personnel_count": 45,
            "apparatus": {
                "engine": 2,
                "ladder": 2,
                "ambulance": 2,
                "rescue": 2,
                "command": 3,
                "hazmat": 1
            }
        },
        {
            "name": "Financial District Station 3",
            "station_number": "3",
            "address": "1045 Montgomery Street",
            "city": "Bayport",
            "state": "California",
            "zip_code": "94104",
            "latitude": 37.7942,
            "longitude": -122.4037,
            "personnel_count": 32,
            "apparatus": {
                "engine": 1,
                "ladder": 1,
                "ambulance": 2,
                "rescue": 1
            }
        },
        {
            "name": "Oceanview Station 10",
            "station_number": "10",
            "address": "655 Ocean Boulevard",
            "city": "Bayport",
            "state": "California",
            "zip_code": "94122",
            "latitude": 37.7542,
            "longitude": -122.4837,
            "personnel_count": 28,
            "apparatus": {
                "engine": 1,
                "ladder": 1,
                "ambulance": 1,
                "marine_unit": 1
            }
        }
    ]
    
    for station_data in stations:
        station = Station(
            department_id=urban_dept.id,
            **station_data
        )
        session.add(station)
    
    # Create users with different roles (just a sample)
    users = [
        {
            "email": "chief@bayportfire.gov",
            "name": "Elizabeth Davis",
            "role": "admin",
            "password": "urban-admin-pass"
        },
        {
            "email": "operations@bayportfire.gov",
            "name": "Marcus Johnson",
            "role": "admin",
            "password": "urban-admin2-pass"
        },
        {
            "email": "battalion1@bayportfire.gov",
            "name": "Jason Washington",
            "role": "manager",
            "password": "urban-manager-pass"
        },
        {
            "email": "station1@bayportfire.gov",
            "name": "Kimberly Rodriguez",
            "role": "manager",
            "password": "urban-manager2-pass"
        },
        {
            "email": "fficer1@bayportfire.gov",
            "name": "Thomas Lee",
            "role": "user",
            "password": "urban-user-pass"
        }
    ]
    
    for user_data in users:
        password = user_data.pop("password")
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        user = User(
            department_id=urban_dept.id,
            password_hash=password_hash,
            is_active=True,
            **user_data
        )
        session.add(user)
    
    print(f"Created Bayport Fire & Rescue (ID: {urban_dept.id}) with 3 sample stations (out of 12) and 5 users")
    return urban_dept

def create_combined_agency(session):
    """Create a combined Fire/EMS agency with complex configuration"""
    print("Creating Combined Fire/EMS Agency...")
    
    # Basic department information
    combined_dept = Department(
        code="regional",
        name="Tri-County Regional Fire & EMS",
        department_type="combined",
        num_stations=8,
        num_personnel=165,
        service_area=520.8,
        population_served=275000,
        address="255 Government Center Pkwy",
        city="Fairview",
        state="Arizona",
        zip_code="85001",
        phone="602-555-2500",
        email="director@tricountyems.org",
        website="https://tricountyems.org",
        is_active=True,
        setup_complete=True,
        primary_color="#006400",  # Dark green
        secondary_color="#4B0082"  # Indigo
    )
    
    # Configure feature enablement
    combined_dept.features_enabled = {
        "incident_logger": True,
        "call_density": True,
        "isochrone_map": True,
        "dashboard": True,
        "coverage_gap_finder": True,
        "fire_map_pro": True,
        "data_formatter": True,
        "station_overview": True
    }
    
    # Configure API settings
    combined_dept.api_enabled = True
    combined_dept.api_key = "combined-test-api-key-abcde"
    
    # Configure webhook settings
    combined_dept.webhooks_enabled = True
    combined_dept.webhook_url = "https://cad.tricountyems.org/api/webhooks"
    combined_dept.webhook_secret = "combined-test-webhook-secret"
    combined_dept.webhook_events = {
        "incident.created": True,
        "incident.updated": True,
        "incident.deleted": False,
        "user.created": True,
        "user.updated": False,
        "station.updated": True
    }
    
    session.add(combined_dept)
    session.flush()  # Flush to get the department ID
    
    # Create a subset of stations (3 out of 8) for brevity
    stations = [
        {
            "name": "Fairview Main Station",
            "station_number": "1",
            "address": "255 Government Center Pkwy",
            "city": "Fairview",
            "state": "Arizona",
            "zip_code": "85001",
            "latitude": 33.4538,
            "longitude": -112.0740,
            "personnel_count": 32,
            "apparatus": {
                "engine": 2,
                "ladder": 1,
                "ambulance": 3,
                "rescue": 1,
                "command": 2,
                "hazmat": 1
            }
        },
        {
            "name": "Westridge Station",
            "station_number": "4",
            "address": "1840 Westridge Blvd",
            "city": "Westridge",
            "state": "Arizona",
            "zip_code": "85023",
            "latitude": 33.5238,
            "longitude": -112.1240,
            "personnel_count": 22,
            "apparatus": {
                "engine": 1,
                "ambulance": 2,
                "brush": 1
            }
        },
        {
            "name": "Desert View EMS",
            "station_number": "7",
            "address": "763 East Desert Drive",
            "city": "Desert View",
            "state": "Arizona",
            "zip_code": "85045",
            "latitude": 33.3938,
            "longitude": -111.9540,
            "personnel_count": 18,
            "apparatus": {
                "ambulance": 3,
                "command": 1
            }
        }
    ]
    
    for station_data in stations:
        station = Station(
            department_id=combined_dept.id,
            **station_data
        )
        session.add(station)
    
    # Create users with different roles
    users = [
        {
            "email": "director@tricountyems.org",
            "name": "Andrea Martinez",
            "role": "admin",
            "password": "combined-admin-pass"
        },
        {
            "email": "firedirector@tricountyems.org",
            "name": "Benjamin Taylor",
            "role": "admin",
            "password": "combined-admin2-pass"
        },
        {
            "email": "emsdirector@tricountyems.org",
            "name": "Olivia Parker",
            "role": "admin",
            "password": "combined-admin3-pass"
        },
        {
            "email": "battalion1@tricountyems.org",
            "name": "Richard Wilson",
            "role": "manager",
            "password": "combined-manager-pass"
        },
        {
            "email": "emsmanager@tricountyems.org",
            "name": "Jennifer Adams",
            "role": "manager",
            "password": "combined-manager2-pass"
        },
        {
            "email": "fireuser@tricountyems.org",
            "name": "Daniel Rodriguez",
            "role": "user",
            "password": "combined-user-pass"
        },
        {
            "email": "emsuser@tricountyems.org",
            "name": "Samantha Brown",
            "role": "user",
            "password": "combined-user2-pass"
        }
    ]
    
    for user_data in users:
        password = user_data.pop("password")
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        user = User(
            department_id=combined_dept.id,
            password_hash=password_hash,
            is_active=True,
            **user_data
        )
        session.add(user)
    
    print(f"Created Tri-County Regional Fire & EMS (ID: {combined_dept.id}) with 3 sample stations (out of 8) and 7 users")
    return combined_dept

def create_super_admin(session):
    """Creates a super admin user for testing all departments"""
    
    # Check if super admin already exists
    existing_super_admin = session.query(User).filter_by(
        email="super@fireems.ai",
        role="super_admin"
    ).first()
    
    if existing_super_admin:
        print(f"Super admin already exists (ID: {existing_super_admin.id})")
        return existing_super_admin
    
    print("Creating super admin user...")
    password_hash = bcrypt.generate_password_hash("super-admin-pass").decode('utf-8')
    
    super_admin = User(
        email="super@fireems.ai",
        name="Super Administrator",
        role="super_admin",
        password_hash=password_hash,
        is_active=True,
        department_id=None  # Super admins don't belong to a specific department
    )
    
    session.add(super_admin)
    session.flush()
    
    print(f"Created super admin (ID: {super_admin.id})")
    return super_admin

def create_test_incidents(session, department, count=25):
    """Create sample incidents for testing"""
    print(f"Creating {count} test incidents for {department.name}...")
    
    # Get department stations for realistic incident data
    stations = session.query(Station).filter_by(department_id=department.id).all()
    if not stations:
        print(f"No stations found for {department.name}, skipping incident creation")
        return
    
    # Define incident types and their relative frequencies
    incident_types = {
        "Medical Emergency": 0.45,
        "Fire Alarm": 0.15,
        "Structure Fire": 0.08,
        "Vehicle Accident": 0.12,
        "Gas Leak": 0.05,
        "Wildland Fire": 0.03,
        "Water Rescue": 0.02,
        "Hazardous Materials": 0.04,
        "Service Call": 0.06
    }
    
    # Create incidents with realistic distribution
    for i in range(count):
        # Determine incident date (past 60 days)
        days_ago = random.randint(0, 60)
        incident_date = datetime.now() - timedelta(days=days_ago)
        
        # Determine incident type based on weighted probabilities
        incident_type = random.choices(
            list(incident_types.keys()),
            weights=list(incident_types.values()),
            k=1
        )[0]
        
        # Generate location near a station with some randomness
        base_station = random.choice(stations)
        lat_offset = random.uniform(-0.05, 0.05)
        lng_offset = random.uniform(-0.05, 0.05)
        latitude = base_station.latitude + lat_offset
        longitude = base_station.longitude + lng_offset
        
        # Create a realistic address
        street_numbers = ["123", "456", "789", "1024", "555", "777", "888", "999", "432", "765"]
        street_names = ["Main St", "Oak Ave", "Pine St", "Maple Dr", "Washington Blvd", 
                        "Lincoln Way", "Park Ave", "Forest Dr", "Lake Rd", "River St"]
        address = f"{random.choice(street_numbers)} {random.choice(street_names)}"
        
        # Generate a unique incident number
        year = incident_date.strftime("%y")
        incident_number = f"{year}-{department.code.upper()}-{i+1:04d}"
        
        # Create basic incident data
        data = {
            "incident_type": incident_type,
            "address": address,
            "city": base_station.city,
            "state": base_station.state,
            "zip_code": base_station.zip_code,
            "latitude": latitude,
            "longitude": longitude,
            "dispatch_time": incident_date.isoformat(),
            "arrival_time": (incident_date + timedelta(minutes=random.randint(5, 15))).isoformat(),
            "clear_time": (incident_date + timedelta(hours=random.randint(1, 3))).isoformat(),
            "responding_units": [base_station.station_number],
            "reporter_name": "Dispatch",
            "reporter_phone": "555-555-5555",
            "incident_commander": "Officer on Duty",
            "narrative": f"Test {incident_type} incident for department testing",
            "patient_count": 1 if "Medical" in incident_type or "Accident" in incident_type else 0
        }
        
        # Add specific data based on incident type
        if incident_type == "Structure Fire":
            data["structure_type"] = random.choice(["Residential", "Commercial", "Industrial", "Multi-Family"])
            data["fire_spread"] = random.choice(["Room of Origin", "Floor of Origin", "Building"])
        elif incident_type == "Medical Emergency":
            data["patient_age"] = random.randint(18, 95)
            data["patient_gender"] = random.choice(["Male", "Female"])
            data["chief_complaint"] = random.choice(["Chest Pain", "Difficulty Breathing", "Fall", "Unconscious"])
        
        # Create incident record
        incident = Incident(
            department_id=department.id,
            incident_number=incident_number,
            title=f"{incident_type} - {address}",
            incident_date=incident_date,
            incident_type=incident_type,
            location=address,
            latitude=latitude,
            longitude=longitude,
            status="closed",
            data=data
        )
        
        session.add(incident)
    
    print(f"Created {count} test incidents for {department.name}")

def list_test_departments_access(departments):
    """Display access information for test departments"""
    print("\n" + "="*80)
    print("TEST DEPARTMENT ACCESS INFORMATION")
    print("="*80)
    
    for dept in departments:
        print(f"\n{dept.name} (Code: {dept.code})")
        print("-" * len(dept.name))
        
        # Get admin users
        users = [u for u in dept.users if u.role == 'admin']
        if users:
            admin = users[0]
            print(f"Admin Login: {admin.email}")
            # In a real script, we wouldn't print passwords, but this is for testing
            print(f"Password: {dept.code}-admin-pass")
        
        print(f"URL: /dept/{dept.code}")
        
        if dept.api_enabled:
            print(f"API Key: {dept.api_key}")
        
        # Display available tools
        enabled_tools = [tool for tool, enabled in dept.features_enabled.items() if enabled]
        print(f"Enabled Tools: {', '.join(enabled_tools)}")
    
    # Display super admin access
    print("\nSuper Admin Access")
    print("----------------")
    print("Email: super@fireems.ai")
    print("Password: super-admin-pass")
    print("URL: /admin/dashboard")

def clear_test_departments(session, confirm=False):
    """Clear existing test departments"""
    test_codes = ["rural", "suburban", "urban", "regional"]
    
    if not confirm:
        response = input("This will DELETE all test departments and their data. Continue? (y/n): ")
        if response.lower() != 'y':
            print("Operation cancelled")
            return
    
    departments = session.query(Department).filter(Department.code.in_(test_codes)).all()
    
    for dept in departments:
        print(f"Deleting department {dept.name} (ID: {dept.id})...")
        session.delete(dept)
    
    session.commit()
    print(f"Deleted {len(departments)} test departments")

def main():
    """Main function to create test departments"""
    parser = argparse.ArgumentParser(description='Create test departments for FireEMS tools')
    parser.add_argument('--clear', action='store_true', help='Clear existing test departments')
    parser.add_argument('--force', action='store_true', help='Skip confirmation prompts')
    parser.add_argument('--incidents', type=int, default=25, help='Number of incidents to create per department')
    args = parser.parse_args()
    
    # Set up database connection using app context
    with app.app_context():
        Session = sessionmaker(bind=db.engine)
        session = Session()
        
        try:
            if args.clear:
                clear_test_departments(session, args.force)
                if not args.force:
                    response = input("Create new test departments? (y/n): ")
                    if response.lower() != 'y':
                        return
            
            # Create super admin user
            super_admin = create_super_admin(session)
            
            # Create departments
            rural_dept = create_rural_department(session)
            suburban_dept = create_suburban_department(session)
            urban_dept = create_urban_department(session)
            combined_dept = create_combined_agency(session)
            
            # Generate test incidents
            create_test_incidents(session, rural_dept, args.incidents)
            create_test_incidents(session, suburban_dept, args.incidents * 2)
            create_test_incidents(session, urban_dept, args.incidents * 3)
            create_test_incidents(session, combined_dept, args.incidents * 2)
            
            # Commit changes
            session.commit()
            
            # Display access information
            departments = [rural_dept, suburban_dept, urban_dept, combined_dept]
            list_test_departments_access(departments)
            
            print("\nTest departments created successfully!")
        
        except Exception as e:
            session.rollback()
            print(f"Error creating test departments: {str(e)}")
            import traceback
            traceback.print_exc()
        finally:
            session.close()

if __name__ == "__main__":
    main()