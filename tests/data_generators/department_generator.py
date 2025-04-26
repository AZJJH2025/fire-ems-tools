"""
Department Generator

Generates test department data with realistic properties.
"""

import random
import uuid
from typing import Dict, List, Any, Optional

# Department types
DEPARTMENT_TYPES = [
    "Fire", "EMS", "Combined", "Volunteer Fire", "County Fire", 
    "Municipal Fire", "Private EMS", "Hospital-based EMS"
]

# Department sizes
DEPARTMENT_SIZES = {
    "small": {
        "stations": (1, 5),
        "personnel": (5, 50),
        "vehicles": (2, 10)
    },
    "medium": {
        "stations": (6, 15),
        "personnel": (51, 200),
        "vehicles": (11, 40)
    },
    "large": {
        "stations": (16, 50),
        "personnel": (201, 1000),
        "vehicles": (41, 150)
    },
    "metro": {
        "stations": (51, 100),
        "personnel": (1001, 5000),
        "vehicles": (151, 300)
    }
}

# Service areas
SERVICE_AREAS = [
    "Urban", "Suburban", "Rural", "Mixed", "Metropolitan", 
    "County-wide", "Regional", "District"
]

def generate_department(
    name: Optional[str] = None,
    dept_type: Optional[str] = None,
    size: Optional[str] = None,
    service_area: Optional[str] = None,
    seed: Optional[int] = None
) -> Dict[str, Any]:
    """
    Generate a test department with realistic properties.
    
    Args:
        name: Optional department name (generated if None)
        dept_type: Optional department type (chosen randomly if None)
        size: Optional size category (small, medium, large, metro)
        service_area: Optional service area type
        seed: Optional random seed for reproducible generation
        
    Returns:
        A dictionary containing department data
    """
    if seed is not None:
        random.seed(seed)
    
    # Generate name if not provided
    if name is None:
        area_names = ["Springfield", "Riverside", "Lakeside", "Oakdale", 
                     "Pinecrest", "Millbrook", "Westview", "Eastpoint",
                     "Northridge", "Southport", "Highland", "Valley"]
        name = f"{random.choice(area_names)} {random.choice(['Fire', 'Fire & Rescue', 'Fire-EMS', 'EMS'])}"
    
    # Select department type
    if dept_type is None:
        dept_type = random.choice(DEPARTMENT_TYPES)
    
    # Select size category
    if size is None:
        size = random.choice(list(DEPARTMENT_SIZES.keys()))
    
    # Select service area
    if service_area is None:
        service_area = random.choice(SERVICE_AREAS)
    
    # Generate department properties based on size
    size_props = DEPARTMENT_SIZES[size]
    station_count = random.randint(*size_props["stations"])
    personnel_count = random.randint(*size_props["personnel"])
    vehicle_count = random.randint(*size_props["vehicles"])
    
    # Generate department ID
    dept_id = str(uuid.uuid4())
    
    # Calculate budget based on size and type
    budget_factors = {
        "small": (500_000, 2_000_000),
        "medium": (2_000_001, 10_000_000),
        "large": (10_000_001, 50_000_000),
        "metro": (50_000_001, 200_000_000)
    }
    
    annual_budget = random.randint(*budget_factors[size])
    
    # Generate contact information
    phone = f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
    email = f"info@{name.lower().replace(' ', '')}.gov"
    
    # Create department object
    department = {
        "id": dept_id,
        "name": name,
        "type": dept_type,
        "size": size,
        "service_area": service_area,
        "station_count": station_count,
        "personnel_count": personnel_count,
        "vehicle_count": vehicle_count,
        "annual_budget": annual_budget,
        "contact": {
            "phone": phone,
            "email": email,
            "address": f"{random.randint(100, 999)} Main Street"
        },
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
    }
    
    return department

def generate_departments(count: int, seed: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Generate multiple test departments.
    
    Args:
        count: Number of departments to generate
        seed: Optional random seed for reproducible generation
        
    Returns:
        A list of department dictionaries
    """
    if seed is not None:
        random.seed(seed)
    
    departments = []
    for i in range(count):
        dept_seed = None if seed is None else seed + i
        departments.append(generate_department(seed=dept_seed))
    
    return departments


if __name__ == "__main__":
    # Example usage
    dept = generate_department(name="Test Fire Department", size="medium")
    print(dept)
    
    # Generate multiple departments
    depts = generate_departments(5, seed=42)
    for d in depts:
        print(f"{d['name']} - {d['type']} - {d['size']}")