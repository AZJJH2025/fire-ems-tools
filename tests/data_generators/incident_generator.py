"""
Incident Generator

Generates test incident data with realistic properties and distributions.
"""

import random
import uuid
import datetime
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import json
import math

# Incident types and their relative frequencies
INCIDENT_TYPES = {
    "EMS": {
        "Medical Emergency": 0.35,
        "Traumatic Injury": 0.15,
        "Cardiac Arrest": 0.05,
        "Stroke": 0.05,
        "Respiratory Distress": 0.08,
        "Overdose/Poisoning": 0.07,
        "Psychiatric": 0.06,
        "Fall": 0.10,
        "Other EMS": 0.09
    },
    "Fire": {
        "Structure Fire": 0.25,
        "Vehicle Fire": 0.15,
        "Wildland Fire": 0.10,
        "Trash/Dumpster Fire": 0.08,
        "Alarm Activation": 0.20,
        "Gas Leak": 0.07,
        "Smoke Investigation": 0.10,
        "Other Fire": 0.05
    },
    "Service": {
        "Public Assist": 0.30,
        "Lift Assist": 0.25,
        "Water Problem": 0.10,
        "Animal Rescue": 0.05,
        "Lockout": 0.15,
        "Other Service": 0.15
    }
}

# Priority levels
PRIORITY_LEVELS = {
    1: 0.15,  # Highest priority (life-threatening)
    2: 0.25,  # Emergency
    3: 0.40,  # Urgent
    4: 0.15,  # Non-urgent
    5: 0.05   # Scheduled/routine
}

# Units and apparatus types
UNIT_TYPES = {
    "Engine": 0.30,
    "Ladder/Truck": 0.15,
    "Ambulance/Medic": 0.35,
    "Battalion Chief": 0.05,
    "Rescue": 0.05,
    "HazMat": 0.03,
    "Brush": 0.02,
    "Command": 0.03,
    "Other": 0.02
}

# Outcome distributions
OUTCOMES = {
    "Transport to Hospital": 0.45,
    "Treated and Released": 0.20,
    "Refused Treatment": 0.10,
    "Canceled En Route": 0.05,
    "Fire Extinguished": 0.08,
    "False Alarm": 0.07,
    "Other": 0.05
}

def weighted_choice(choices: Dict[Any, float]) -> Any:
    """
    Make a weighted random choice from a dictionary of choices and weights.
    
    Args:
        choices: Dictionary with choices as keys and weights as values
        
    Returns:
        A randomly chosen key based on the weights
    """
    total = sum(choices.values())
    r = random.uniform(0, total)
    cumulative = 0
    
    for choice, weight in choices.items():
        cumulative += weight
        if r <= cumulative:
            return choice
    
    # Fallback to last item if we somehow reach here
    return list(choices.keys())[-1]

def generate_random_time(
    start_date: datetime.datetime,
    end_date: datetime.datetime
) -> datetime.datetime:
    """
    Generate a random datetime between start_date and end_date.
    
    Args:
        start_date: Start of date range
        end_date: End of date range
        
    Returns:
        A random datetime between start_date and end_date
    """
    delta = end_date - start_date
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return start_date + datetime.timedelta(seconds=random_seconds)

def generate_coordinates(base_lat: float, base_lon: float, radius_km: float) -> Tuple[float, float]:
    """
    Generate random coordinates within a radius of a base point.
    
    Args:
        base_lat: Base latitude
        base_lon: Base longitude
        radius_km: Radius in kilometers
        
    Returns:
        A tuple of (latitude, longitude)
    """
    # Earth's radius in kilometers
    earth_radius = 6371.0
    
    # Convert radius from kilometers to radians
    radius_radians = radius_km / earth_radius
    
    # Generate a random distance and bearing
    random_distance = random.uniform(0, radius_radians)
    random_bearing = random.uniform(0, 2 * math.pi)
    
    # Convert base coordinates to radians
    base_lat_rad = math.radians(base_lat)
    base_lon_rad = math.radians(base_lon)
    
    # Calculate new latitude
    new_lat_rad = math.asin(
        math.sin(base_lat_rad) * math.cos(random_distance) +
        math.cos(base_lat_rad) * math.sin(random_distance) * math.cos(random_bearing)
    )
    
    # Calculate new longitude
    new_lon_rad = base_lon_rad + math.atan2(
        math.sin(random_bearing) * math.sin(random_distance) * math.cos(base_lat_rad),
        math.cos(random_distance) - math.sin(base_lat_rad) * math.sin(new_lat_rad)
    )
    
    # Convert back to degrees
    new_lat = math.degrees(new_lat_rad)
    new_lon = math.degrees(new_lon_rad)
    
    return (new_lat, new_lon)

def generate_incident(
    incident_id: Optional[str] = None,
    incident_date: Optional[datetime.datetime] = None,
    incident_type: Optional[str] = None,
    priority: Optional[int] = None,
    department_id: Optional[str] = None,
    location: Optional[Dict[str, Any]] = None,
    seed: Optional[int] = None
) -> Dict[str, Any]:
    """
    Generate a test incident with realistic properties.
    
    Args:
        incident_id: Optional incident ID (generated if None)
        incident_date: Optional incident date (generated if None)
        incident_type: Optional incident type (chosen randomly if None)
        priority: Optional priority level (chosen randomly if None)
        department_id: Optional department ID (generated if None)
        location: Optional location data (generated if None)
        seed: Optional random seed for reproducible generation
        
    Returns:
        A dictionary containing incident data
    """
    if seed is not None:
        random.seed(seed)
    
    # Generate incident ID if not provided
    if incident_id is None:
        incident_id = str(uuid.uuid4())
    
    # Generate incident date if not provided
    if incident_date is None:
        # Default to a random date in the last year
        end_date = datetime.datetime.now()
        start_date = end_date - datetime.timedelta(days=365)
        incident_date = generate_random_time(start_date, end_date)
    
    # Select incident category and type
    if incident_type is None:
        # First select a category
        category = weighted_choice({
            "EMS": 0.60,
            "Fire": 0.30,
            "Service": 0.10
        })
        
        # Then select a type within that category
        incident_type = weighted_choice(INCIDENT_TYPES[category])
    else:
        # Determine category from incident type
        category = None
        for cat, types in INCIDENT_TYPES.items():
            if incident_type in types:
                category = cat
                break
        
        if category is None:
            # Default to EMS if we can't determine the category
            category = "EMS"
    
    # Select priority level
    if priority is None:
        priority = weighted_choice(PRIORITY_LEVELS)
    
    # Generate department ID if not provided
    if department_id is None:
        department_id = str(uuid.uuid4())
    
    # Generate location if not provided
    if location is None:
        # Default to a random location around Seattle
        base_lat, base_lon = 47.6062, -122.3321
        lat, lon = generate_coordinates(base_lat, base_lon, 30.0)
        
        location = {
            "latitude": lat,
            "longitude": lon,
            "address": f"{random.randint(100, 9999)} Example Street",
            "city": "Seattle",
            "state": "WA",
            "postal_code": f"981{random.randint(10, 99)}"
        }
    
    # Generate response times
    dispatch_time = incident_date
    enroute_time = dispatch_time + datetime.timedelta(seconds=random.randint(30, 180))
    arrive_time = enroute_time + datetime.timedelta(seconds=random.randint(180, 900))
    clear_time = arrive_time + datetime.timedelta(minutes=random.randint(10, 120))
    
    # Generate responding units
    unit_count = max(1, int(random.normalvariate(3, 1)))  # Normal distribution around 3 units
    units = []
    
    for i in range(unit_count):
        unit_type = weighted_choice(UNIT_TYPES)
        unit_id = f"{unit_type[0]}-{random.randint(1, 9)}"
        
        # Special case for ambulances
        if unit_type == "Ambulance/Medic":
            unit_id = f"M-{random.randint(1, 20)}"
        
        # Add some variability to response times for each unit
        unit_enroute = enroute_time + datetime.timedelta(seconds=random.randint(-30, 30))
        unit_arrive = arrive_time + datetime.timedelta(seconds=random.randint(-120, 120))
        unit_clear = clear_time + datetime.timedelta(seconds=random.randint(-600, 600))
        
        units.append({
            "unit_id": unit_id,
            "unit_type": unit_type,
            "station_id": f"STA-{random.randint(1, 20)}",
            "personnel_count": random.randint(2, 5),
            "status": "Cleared",
            "times": {
                "dispatched": dispatch_time.isoformat(),
                "enroute": unit_enroute.isoformat(),
                "arrived": unit_arrive.isoformat(),
                "cleared": unit_clear.isoformat()
            }
        })
    
    # Generate outcome
    outcome = weighted_choice(OUTCOMES)
    
    # Create incident object
    incident = {
        "id": incident_id,
        "department_id": department_id,
        "call_number": f"{incident_date.year}-{random.randint(10000, 99999)}",
        "type": incident_type,
        "category": category,
        "priority": priority,
        "location": location,
        "caller_info": {
            "name": "Anonymous",
            "phone": f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
        },
        "times": {
            "received": incident_date.isoformat(),
            "dispatched": dispatch_time.isoformat(),
            "first_unit_enroute": enroute_time.isoformat(),
            "first_unit_arrived": arrive_time.isoformat(),
            "last_unit_cleared": clear_time.isoformat()
        },
        "units": units,
        "outcome": outcome,
        "notes": f"Test incident generated for {incident_type}",
        "created_at": datetime.datetime.now().isoformat(),
        "updated_at": datetime.datetime.now().isoformat()
    }
    
    return incident

def generate_incidents(
    count: int,
    department_id: Optional[str] = None,
    start_date: Optional[datetime.datetime] = None,
    end_date: Optional[datetime.datetime] = None,
    base_location: Optional[Tuple[float, float]] = None,
    radius_km: float = 30.0,
    seed: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Generate multiple test incidents.
    
    Args:
        count: Number of incidents to generate
        department_id: Optional department ID for all incidents
        start_date: Optional start date for incidents (defaults to 1 year ago)
        end_date: Optional end date for incidents (defaults to now)
        base_location: Optional base location (lat, lon) for all incidents
        radius_km: Radius in kilometers around base location
        seed: Optional random seed for reproducible generation
        
    Returns:
        A list of incident dictionaries
    """
    if seed is not None:
        random.seed(seed)
    
    if department_id is None:
        department_id = str(uuid.uuid4())
    
    if start_date is None:
        start_date = datetime.datetime.now() - datetime.timedelta(days=365)
    
    if end_date is None:
        end_date = datetime.datetime.now()
    
    if base_location is None:
        # Default to Seattle
        base_location = (47.6062, -122.3321)
    
    incidents = []
    for i in range(count):
        # Generate a random date within the range
        incident_date = generate_random_time(start_date, end_date)
        
        # Generate random coordinates within the radius
        lat, lon = generate_coordinates(base_location[0], base_location[1], radius_km)
        
        location = {
            "latitude": lat,
            "longitude": lon,
            "address": f"{random.randint(100, 9999)} Example Street",
            "city": "Seattle",
            "state": "WA",
            "postal_code": f"981{random.randint(10, 99)}"
        }
        
        # Each incident gets a unique seed if a seed was provided
        incident_seed = None if seed is None else seed + i
        
        incident = generate_incident(
            incident_date=incident_date,
            department_id=department_id,
            location=location,
            seed=incident_seed
        )
        
        incidents.append(incident)
    
    # Sort by date
    incidents.sort(key=lambda x: x["times"]["received"])
    
    return incidents


if __name__ == "__main__":
    # Example usage
    incident = generate_incident()
    print(json.dumps(incident, indent=2))
    
    # Generate multiple incidents
    incidents = generate_incidents(5, seed=42)
    for inc in incidents:
        print(f"{inc['times']['received']} - {inc['type']} - Priority {inc['priority']}")