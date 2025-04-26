"""
User Generator

Generates test user data with realistic properties and roles.
"""

import random
import uuid
import datetime
import hashlib
from typing import Dict, List, Any, Optional

# User roles and their permissions
ROLES = {
    "Administrator": {
        "permissions": [
            "view_all", "edit_all", "admin_panel", "manage_users", 
            "manage_departments", "manage_incidents", "export_data",
            "generate_reports", "system_settings"
        ],
        "level": 5
    },
    "Department Chief": {
        "permissions": [
            "view_all", "edit_all", "manage_department", "manage_stations",
            "manage_incidents", "export_data", "generate_reports"
        ],
        "level": 4
    },
    "Battalion Chief": {
        "permissions": [
            "view_all", "edit_incidents", "manage_stations",
            "export_data", "generate_reports"
        ],
        "level": 3
    },
    "Supervisor": {
        "permissions": [
            "view_all", "edit_incidents", "export_data", "generate_reports"
        ],
        "level": 3
    },
    "Station Officer": {
        "permissions": [
            "view_station", "edit_incidents", "generate_reports"
        ],
        "level": 2
    },
    "Firefighter/EMT": {
        "permissions": [
            "view_station", "create_incidents", "edit_own_incidents"
        ],
        "level": 1
    },
    "Dispatcher": {
        "permissions": [
            "view_all", "create_incidents", "update_incident_status"
        ],
        "level": 2
    },
    "Data Analyst": {
        "permissions": [
            "view_all", "export_data", "generate_reports"
        ],
        "level": 2
    },
    "IT Support": {
        "permissions": [
            "view_all", "admin_panel", "system_settings"
        ],
        "level": 4
    },
    "Read Only": {
        "permissions": [
            "view_all"
        ],
        "level": 1
    }
}

# Sample first and last names
FIRST_NAMES = [
    "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph",
    "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth",
    "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Christopher", "Daniel",
    "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Ryan",
    "Laura", "Michelle", "Amanda", "Melissa", "Stephanie", "Rebecca", "Emily",
    "Anna", "Emma", "Madison", "Jose", "Luis", "Carlos", "Juan", "Miguel",
    "Maria", "Sofia", "Isabella", "Valentina", "Camila"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson",
    "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
    "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis",
    "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright",
    "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson",
    "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell",
    "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris",
    "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey"
]

def generate_password_hash(password: str) -> str:
    """
    Generate a password hash for testing purposes.
    
    Args:
        password: Raw password string
        
    Returns:
        A simple hash of the password
    """
    # This is just for test data - use a proper password hashing library in production
    return hashlib.sha256(password.encode()).hexdigest()

def generate_username(first_name: str, last_name: str) -> str:
    """
    Generate a username from first and last name.
    
    Args:
        first_name: User's first name
        last_name: User's last name
        
    Returns:
        A username based on first and last name
    """
    username = f"{first_name[0].lower()}{last_name.lower()}"
    
    # Add a random digit if needed
    if random.random() < 0.3:
        username += str(random.randint(1, 99))
    
    return username

def generate_user(
    user_id: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    email: Optional[str] = None,
    role: Optional[str] = None,
    department_id: Optional[str] = None,
    station_id: Optional[str] = None,
    active: Optional[bool] = None,
    seed: Optional[int] = None
) -> Dict[str, Any]:
    """
    Generate a test user with realistic properties.
    
    Args:
        user_id: Optional user ID (generated if None)
        first_name: Optional first name (chosen randomly if None)
        last_name: Optional last name (chosen randomly if None)
        email: Optional email (generated if None)
        role: Optional role (chosen randomly if None)
        department_id: Optional department ID (generated if None)
        station_id: Optional station ID (generated if None)
        active: Optional active status (defaulted to True if None)
        seed: Optional random seed for reproducible generation
        
    Returns:
        A dictionary containing user data
    """
    if seed is not None:
        random.seed(seed)
    
    # Generate user ID if not provided
    if user_id is None:
        user_id = str(uuid.uuid4())
    
    # Generate first name if not provided
    if first_name is None:
        first_name = random.choice(FIRST_NAMES)
    
    # Generate last name if not provided
    if last_name is None:
        last_name = random.choice(LAST_NAMES)
    
    # Generate role if not provided
    if role is None:
        role = random.choice(list(ROLES.keys()))
    
    # Generate department ID if not provided
    if department_id is None:
        department_id = str(uuid.uuid4())
    
    # Generate station ID if provided
    if station_id is None and role in ["Station Officer", "Firefighter/EMT"]:
        station_id = str(uuid.uuid4())
    
    # Generate email if not provided
    if email is None:
        domain = random.choice(["example.com", "fireems.org", "cityfiredept.gov", "countyems.net"])
        email = f"{first_name.lower()}.{last_name.lower()}@{domain}"
    
    # Set active status if not provided
    if active is None:
        active = True
    
    # Generate username
    username = generate_username(first_name, last_name)
    
    # Get permission for role
    permissions = ROLES[role]["permissions"]
    level = ROLES[role]["level"]
    
    # Generate hire date and user creation date
    current_date = datetime.datetime.now()
    hire_date = current_date - datetime.timedelta(days=random.randint(30, 3650))  # Random date in last 10 years
    created_at = current_date - datetime.timedelta(days=random.randint(1, 365))  # Random date in last year
    
    # Generate user object
    user = {
        "id": user_id,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password_hash": generate_password_hash("password123"),  # Dummy hash for test data
        "role": role,
        "department_id": department_id,
        "station_id": station_id,
        "permissions": permissions,
        "level": level,
        "phone": f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
        "hire_date": hire_date.date().isoformat(),
        "active": active,
        "last_login": (current_date - datetime.timedelta(days=random.randint(0, 30))).isoformat() if active else None,
        "created_at": created_at.isoformat(),
        "updated_at": current_date.isoformat()
    }
    
    # Add position/rank and certifications
    if role in ["Department Chief", "Battalion Chief"]:
        user["position"] = role
        user["certifications"] = ["Fire Officer IV", "Fire Instructor III", "Fire Inspector II"]
    elif role == "Station Officer":
        user["position"] = random.choice(["Captain", "Lieutenant"])
        user["certifications"] = ["Fire Officer II", "Fire Instructor I"]
    elif role == "Firefighter/EMT":
        user["position"] = random.choice(["Firefighter", "Engineer", "Paramedic"])
        
        certs = ["Firefighter I", "Firefighter II", "Hazmat Operations"]
        if user["position"] == "Engineer":
            certs.append("Driver/Operator")
        elif user["position"] == "Paramedic":
            certs.extend(["Paramedic", "ACLS", "PALS"])
        else:
            if random.random() < 0.7:
                certs.append("EMT-Basic")
            if random.random() < 0.3:
                certs.append("EMT-Advanced")
            if random.random() < 0.2:
                certs.append("Paramedic")
        
        user["certifications"] = certs
    else:
        user["position"] = role
        user["certifications"] = []
    
    return user

def generate_users(
    count: int,
    department_id: Optional[str] = None,
    station_ids: Optional[List[str]] = None,
    seed: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Generate multiple test users.
    
    Args:
        count: Number of users to generate
        department_id: Optional department ID for all users
        station_ids: Optional list of station IDs to assign to users
        seed: Optional random seed for reproducible generation
        
    Returns:
        A list of user dictionaries
    """
    if seed is not None:
        random.seed(seed)
    
    if department_id is None:
        department_id = str(uuid.uuid4())
    
    # Generate role distribution based on typical department structure
    roles_to_generate = {
        "Administrator": max(1, round(count * 0.03)),  # ~3% administrators
        "Department Chief": 1,  # Just one chief
        "Battalion Chief": max(1, round(count * 0.05)),  # ~5% battalion chiefs
        "Supervisor": max(1, round(count * 0.07)),  # ~7% supervisors
        "Station Officer": max(1, round(count * 0.15)),  # ~15% officers
        "Firefighter/EMT": max(1, count - round(count * 0.4)),  # The bulk of the staff
        "Dispatcher": max(1, round(count * 0.05)),  # ~5% dispatchers
        "Data Analyst": max(0, round(count * 0.02)),  # ~2% analysts
        "IT Support": max(0, round(count * 0.02)),  # ~2% IT support
        "Read Only": max(0, round(count * 0.01))  # ~1% read-only
    }
    
    # Adjust if we have too many roles (small count)
    total_roles = sum(roles_to_generate.values())
    if total_roles > count:
        # Prioritize keeping administrators, chiefs, and firefighters
        priority_roles = ["Administrator", "Department Chief", "Firefighter/EMT", "Station Officer"]
        non_priority = [r for r in roles_to_generate.keys() if r not in priority_roles]
        
        # First reduce non-priority roles
        for role in non_priority:
            if total_roles <= count:
                break
            while roles_to_generate[role] > 0 and total_roles > count:
                roles_to_generate[role] -= 1
                total_roles -= 1
        
        # If still too many, reduce officers
        while roles_to_generate["Station Officer"] > 1 and total_roles > count:
            roles_to_generate["Station Officer"] -= 1
            total_roles -= 1
            
        # Finally adjust firefighters if needed
        while total_roles > count:
            if roles_to_generate["Firefighter/EMT"] > 1:
                roles_to_generate["Firefighter/EMT"] -= 1
                total_roles -= 1
            else:
                break
    
    # Generate the role list
    all_roles = []
    for role, count_for_role in roles_to_generate.items():
        all_roles.extend([role] * count_for_role)
    
    # Shuffle roles
    random.shuffle(all_roles)
    
    # If we still have more roles than requested count, truncate
    if len(all_roles) > count:
        all_roles = all_roles[:count]
    
    # If we have fewer roles than requested count, add more firefighters
    while len(all_roles) < count:
        all_roles.append("Firefighter/EMT")
    
    # Assign station IDs if provided
    if station_ids is None:
        station_ids = [str(uuid.uuid4()) for _ in range(max(1, count // 10))]
    
    users = []
    for i in range(count):
        role = all_roles[i]
        
        # Assign station ID based on role
        if role in ["Station Officer", "Firefighter/EMT"]:
            station_id = random.choice(station_ids)
        else:
            station_id = None
        
        # Each user gets a unique seed if a seed was provided
        user_seed = None if seed is None else seed + i
        
        user = generate_user(
            role=role,
            department_id=department_id,
            station_id=station_id,
            seed=user_seed
        )
        
        users.append(user)
    
    return users


if __name__ == "__main__":
    # Example usage
    user = generate_user(role="Firefighter/EMT")
    print(f"{user['first_name']} {user['last_name']} - {user['role']} - {user['position']}")
    
    # Generate multiple users
    users = generate_users(10, seed=42)
    for u in users:
        print(f"{u['first_name']} {u['last_name']} - {u['role']}")