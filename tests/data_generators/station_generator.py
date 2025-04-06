"""
Station Generator

Generates test fire/EMS station data with realistic properties.
"""

import random
import uuid
import datetime
from typing import Dict, List, Any, Optional, Tuple
import math

# Station types
STATION_TYPES = [
    "Fire", "EMS", "Combined", "Volunteer", "Satellite", 
    "Headquarters", "Training", "Special Operations"
]

# Apparatus types and counts by station type
APPARATUS_TYPES = {
    "Engine": {
        "Fire": (1, 2),
        "Combined": (1, 2),
        "Volunteer": (1, 1),
        "Headquarters": (1, 2),
        "default": (0, 1)
    },
    "Ladder/Truck": {
        "Fire": (0, 1),
        "Combined": (0, 1),
        "Headquarters": (0, 1),
        "default": (0, 0)
    },
    "Ambulance/Medic": {
        "EMS": (2, 4),
        "Combined": (1, 2),
        "Headquarters": (1, 2),
        "default": (0, 1)
    },
    "Battalion Chief": {
        "Headquarters": (1, 1),
        "default": (0, 0)
    },
    "Rescue": {
        "Special Operations": (1, 1),
        "Combined": (0, 1),
        "default": (0, 0)
    },
    "HazMat": {
        "Special Operations": (1, 1),
        "default": (0, 0)
    },
    "Brush": {
        "Fire": (0, 1),
        "Combined": (0, 1),
        "default": (0, 0)
    },
    "Command": {
        "Headquarters": (1, 1),
        "default": (0, 0)
    },
    "Water Tender": {
        "Fire": (0, 1),
        "Volunteer": (0, 1),
        "default": (0, 0)
    },
    "Boat": {
        "Special Operations": (0, 1),
        "default": (0, 0)
    }
}

# Staffing models
STAFFING_MODELS = [
    "Career", "Volunteer", "Combination", "Part-time", 
    "Day Career/Night Volunteer", "Cross-staffed"
]

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

def generate_apparatus(
    station_type: str,
    apparatus_count: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Generate apparatus for a station based on station type.
    
    Args:
        station_type: Type of the station
        apparatus_count: Optional total apparatus count (calculated if None)
        
    Returns:
        A list of apparatus dictionaries
    """
    apparatus_list = []
    
    if apparatus_count is None:
        # Determine a reasonable number of apparatus based on station type
        if station_type == "Headquarters":
            apparatus_count = random.randint(4, 8)
        elif station_type == "Special Operations":
            apparatus_count = random.randint(3, 6)
        elif station_type == "Combined":
            apparatus_count = random.randint(3, 5)
        elif station_type == "Fire":
            apparatus_count = random.randint(2, 4)
        elif station_type == "EMS":
            apparatus_count = random.randint(2, 5)
        else:
            apparatus_count = random.randint(1, 3)
    
    # Make weighted choices for apparatus types based on station type
    apparatus_weights = {}
    for apparatus_type, type_counts in APPARATUS_TYPES.items():
        min_count, max_count = type_counts.get(station_type, type_counts["default"])
        if max_count > 0:
            apparatus_weights[apparatus_type] = max_count
    
    # Generate the requested number of apparatus
    apparatus_types_to_create = []
    while len(apparatus_types_to_create) < apparatus_count:
        if not apparatus_weights:
            break
        
        apparatus_type = random.choices(
            list(apparatus_weights.keys()),
            weights=list(apparatus_weights.values()),
            k=1
        )[0]
        
        apparatus_types_to_create.append(apparatus_type)
        
        # Reduce the weight to make additional of this type less likely
        apparatus_weights[apparatus_type] = max(0, apparatus_weights[apparatus_type] - 1)
        if apparatus_weights[apparatus_type] == 0:
            del apparatus_weights[apparatus_type]
    
    # Create the apparatus objects
    for i, apparatus_type in enumerate(apparatus_types_to_create):
        # Generate a designation based on type
        if apparatus_type == "Engine":
            designation = f"Engine {random.randint(1, 9)}"
        elif apparatus_type == "Ladder/Truck":
            designation = f"Truck {random.randint(1, 5)}"
        elif apparatus_type == "Ambulance/Medic":
            designation = f"Medic {random.randint(1, 9)}"
        elif apparatus_type == "Battalion Chief":
            designation = f"Battalion {random.randint(1, 3)}"
        elif apparatus_type == "Rescue":
            designation = f"Rescue {random.randint(1, 3)}"
        elif apparatus_type == "HazMat":
            designation = "HazMat 1"
        elif apparatus_type == "Brush":
            designation = f"Brush {random.randint(1, 3)}"
        elif apparatus_type == "Command":
            designation = "Command 1"
        elif apparatus_type == "Water Tender":
            designation = f"Tender {random.randint(1, 2)}"
        elif apparatus_type == "Boat":
            designation = f"Marine {random.randint(1, 2)}"
        else:
            designation = f"{apparatus_type} {i+1}"
        
        # Generate crew size based on type
        if apparatus_type in ["Engine", "Ladder/Truck"]:
            crew_size = random.randint(3, 4)
        elif apparatus_type in ["Ambulance/Medic"]:
            crew_size = 2
        elif apparatus_type in ["Battalion Chief", "Command"]:
            crew_size = 1
        elif apparatus_type in ["Rescue", "HazMat"]:
            crew_size = random.randint(3, 6)
        else:
            crew_size = random.randint(1, 3)
        
        # Generate apparatus object
        apparatus = {
            "id": str(uuid.uuid4()),
            "type": apparatus_type,
            "designation": designation,
            "status": random.choice(["In Service", "In Service", "In Service", "Out for Maintenance"]),
            "year": random.randint(2000, 2023),
            "make": random.choice(["Pierce", "E-ONE", "Seagrave", "Spartan", "Rosenbauer", "KME"]),
            "model": random.choice(["Arrow XT", "Velocity", "Enforcer", "Quantum", "Cyclone", "Custom"]),
            "capabilities": [],
            "crew_size": crew_size
        }
        
        # Add capabilities based on type
        if apparatus_type == "Engine":
            apparatus["capabilities"] = ["Pump", "Water Tank", "Basic Life Support"]
            if random.random() < 0.3:
                apparatus["capabilities"].append("Advanced Life Support")
        elif apparatus_type == "Ladder/Truck":
            apparatus["capabilities"] = ["Aerial Device", "Ground Ladders", "Ventilation"]
            height = random.choice([75, 100, 105, 110])
            apparatus["capabilities"].append(f"{height}' Aerial")
        elif apparatus_type == "Ambulance/Medic":
            if random.random() < 0.7:
                apparatus["capabilities"] = ["Advanced Life Support", "Transport"]
            else:
                apparatus["capabilities"] = ["Basic Life Support", "Transport"]
        elif apparatus_type == "Rescue":
            apparatus["capabilities"] = ["Vehicle Extrication", "Technical Rescue"]
            if random.random() < 0.5:
                apparatus["capabilities"].append("Water Rescue")
            if random.random() < 0.3:
                apparatus["capabilities"].append("Confined Space")
        elif apparatus_type == "HazMat":
            apparatus["capabilities"] = ["Chemical Detection", "Decontamination", "Containment"]
        elif apparatus_type == "Brush":
            apparatus["capabilities"] = ["Wildland", "Off-Road", "Pump and Roll"]
        elif apparatus_type == "Water Tender":
            capacity = random.choice([1500, 2000, 2500, 3000])
            apparatus["capabilities"] = [f"{capacity} Gallon Tank", "Water Supply"]
        elif apparatus_type == "Boat":
            apparatus["capabilities"] = ["Water Rescue", "Fire Suppression"]
        
        apparatus_list.append(apparatus)
    
    return apparatus_list

def generate_station(
    station_id: Optional[str] = None,
    name: Optional[str] = None,
    station_type: Optional[str] = None,
    department_id: Optional[str] = None,
    location: Optional[Dict[str, Any]] = None,
    apparatus_count: Optional[int] = None,
    staffing_model: Optional[str] = None,
    seed: Optional[int] = None
) -> Dict[str, Any]:
    """
    Generate a test station with realistic properties.
    
    Args:
        station_id: Optional station ID (generated if None)
        name: Optional station name (generated if None)
        station_type: Optional station type (chosen randomly if None)
        department_id: Optional department ID (generated if None)
        location: Optional location data (generated if None)
        apparatus_count: Optional number of apparatus (calculated if None)
        staffing_model: Optional staffing model (chosen randomly if None)
        seed: Optional random seed for reproducible generation
        
    Returns:
        A dictionary containing station data
    """
    if seed is not None:
        random.seed(seed)
    
    # Generate station ID if not provided
    if station_id is None:
        station_id = str(uuid.uuid4())
    
    # Generate station type if not provided
    if station_type is None:
        station_type = random.choice(STATION_TYPES)
    
    # Generate department ID if not provided
    if department_id is None:
        department_id = str(uuid.uuid4())
    
    # Generate name if not provided
    if name is None:
        station_number = random.randint(1, 30)
        name = f"Station {station_number}"
    
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
    
    # Generate staffing model if not provided
    if staffing_model is None:
        if station_type == "Volunteer":
            staffing_model = "Volunteer"
        elif station_type == "Headquarters":
            staffing_model = "Career"
        else:
            staffing_model = random.choice(STAFFING_MODELS)
    
    # Generate apparatus
    apparatus = generate_apparatus(station_type, apparatus_count)
    
    # Determine personnel count based on apparatus and staffing
    if staffing_model == "Career":
        min_personnel = sum(app["crew_size"] for app in apparatus)
        personnel_count = min_personnel + random.randint(0, 3)  # Add a few extra
    elif staffing_model == "Volunteer":
        personnel_count = random.randint(6, 20)
    elif staffing_model == "Combination":
        min_career = sum(app["crew_size"] for app in apparatus) // 2
        personnel_count = {
            "career": min_career + random.randint(0, 2),
            "volunteer": random.randint(5, 15)
        }
    else:
        personnel_count = random.randint(6, 15)
    
    # Calculate area served
    area_served_miles = random.randint(3, 15)
    
    # Create station object
    station = {
        "id": station_id,
        "name": name,
        "department_id": department_id,
        "type": station_type,
        "staffing": {
            "model": staffing_model,
            "personnel": personnel_count
        },
        "location": location,
        "apparatus": apparatus,
        "area_served_sq_miles": area_served_miles,
        "built_year": random.randint(1950, 2020),
        "last_renovated": random.randint(2000, 2023),
        "features": [],
        "created_at": datetime.datetime.now().isoformat(),
        "updated_at": datetime.datetime.now().isoformat()
    }
    
    # Add features based on station type
    possible_features = [
        "Training Room", "Sleeping Quarters", "Kitchen", "Fitness Room",
        "Community Room", "Decontamination Area", "Backup Generator",
        "Maintenance Bay", "Hose Tower", "Safe Haven", "Fuel Station"
    ]
    
    feature_count = random.randint(3, 8)
    station["features"] = random.sample(possible_features, feature_count)
    
    return station

def generate_stations(
    count: int,
    department_id: Optional[str] = None,
    base_location: Optional[Tuple[float, float]] = None,
    radius_km: float = 30.0,
    seed: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Generate multiple test stations.
    
    Args:
        count: Number of stations to generate
        department_id: Optional department ID for all stations
        base_location: Optional base location (lat, lon) for all stations
        radius_km: Radius in kilometers around base location
        seed: Optional random seed for reproducible generation
        
    Returns:
        A list of station dictionaries
    """
    if seed is not None:
        random.seed(seed)
    
    if department_id is None:
        department_id = str(uuid.uuid4())
    
    if base_location is None:
        # Default to Seattle
        base_location = (47.6062, -122.3321)
    
    stations = []
    
    # Make sure we have one headquarters
    has_headquarters = False
    
    for i in range(count):
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
        
        # Each station gets a unique seed if a seed was provided
        station_seed = None if seed is None else seed + i
        
        # For the first station, consider making it a headquarters
        if i == 0 and not has_headquarters and random.random() < 0.7:
            station_type = "Headquarters"
            has_headquarters = True
        else:
            station_type = None
        
        station = generate_station(
            station_type=station_type,
            department_id=department_id,
            name=f"Station {i+1}",
            location=location,
            seed=station_seed
        )
        
        stations.append(station)
    
    return stations


if __name__ == "__main__":
    # Example usage
    station = generate_station(name="Test Station 1", station_type="Combined")
    print(f"{station['name']} - {station['type']} - {len(station['apparatus'])} apparatus")
    
    # Generate multiple stations
    stations = generate_stations(5, seed=42)
    for s in stations:
        print(f"{s['name']} - {s['type']} - {len(s['apparatus'])} apparatus")